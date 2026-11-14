import OpenAI from "openai";

/**
 * 🛡️ ARCHITECTURE: Multi-Provider AI Engine
 * Orchestrates Google AI Studio (Gemini), Groq, and OpenRouter.
 * Features:
 * - Zero-cost operation using official permanent free tiers
 * - 1,000,000 token context support via Gemini Flash (1,500 free requests/day)
 * - 300+ tok/s instant question synthesis via Groq LPU (14,400 free requests/day)
 * - Automatic cascading failover: Gemini -> Groq -> OpenRouter
 */

interface ChatCompletionOptions {
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    jsonMode?: boolean;
    priority?: 'gemini' | 'groq' | 'openrouter';
}

function getGeminiClient(): OpenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new OpenAI({
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        apiKey: key,
        timeout: 8000,
        maxRetries: 0
    });
}

function getGroqClient(): OpenAI | null {
    const key = process.env.GROQ_API_KEY;
    if (!key) return null;
    return new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: key,
        timeout: 8000,
        maxRetries: 0
    });
}

function getOpenRouterClient(): OpenAI | null {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return null;
    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: key,
        timeout: 10000,
        maxRetries: 0,
        defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "ReviewQuest",
        }
    });
}

/**
 * Executes an AI completion with automatic cascading fallback across providers.
 */
export async function executeMultiAiCompletion(options: ChatCompletionOptions): Promise<{ content: string; providerUsed: string }> {
    const {
        prompt,
        systemPrompt = "You are an intelligent educational game assistant. Strictly output valid JSON without trailing commas.",
        maxTokens = 4000,
        jsonMode = true,
        priority = 'gemini'
    } = options;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
    ];

    const responseFormat = jsonMode ? { type: "json_object" as const } : undefined;

    // Ordered sequence of providers to attempt
    const providerSequence: Array<{ name: string; run: () => Promise<string | null> }> = [];

    const gemini = getGeminiClient();
    const groq = getGroqClient();
    const openRouter = getOpenRouterClient();

    // 1. Google Gemini Flash (1,500 free RPD, 1M context, 8K output tokens)
    const runGemini = async (): Promise<string | null> => {
        if (!gemini) return null;
        console.log("--- [AI DISPATCH: GOOGLE GEMINI (Free Tier)] ---");
        try {
            const res = await gemini.chat.completions.create({
                model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
                max_tokens: maxTokens,
                messages,
                response_format: responseFormat
            });
            return res.choices[0]?.message?.content || null;
        } catch (flashErr: any) {
            console.log("--- [GEMINI: ENGAGING GEMINI 2.5 FLASH-LITE BACKUP] ---");
            // Fast failover: if flash-lite also fails or is 429, throw immediately to route to Groq
            const resLite = await gemini.chat.completions.create({
                model: "gemini-2.5-flash-lite",
                max_tokens: maxTokens,
                messages,
                response_format: responseFormat
            });
            return resLite.choices[0]?.message?.content || null;
        }
    };

    // 2. Groq (14,400 free RPD, ultra-fast 300+ tok/s LPU)
    const runGroq = async (): Promise<string | null> => {
        if (!groq) return null;
        console.log("--- [AI DISPATCH: GROQ LPU (Free Tier)] ---");
        try {
            const res = await groq.chat.completions.create({
                model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
                max_tokens: Math.min(maxTokens, 3500),
                messages,
                response_format: responseFormat
            });
            return res.choices[0]?.message?.content || null;
        } catch {
            try {
                const res = await groq.chat.completions.create({
                    model: "qwen/qwen3.8-27b",
                    max_tokens: Math.min(maxTokens, 3500),
                    messages,
                    response_format: responseFormat
                });
                return res.choices[0]?.message?.content || null;
            } catch {
                const res = await groq.chat.completions.create({
                    model: "openai/gpt-oss-20b",
                    max_tokens: Math.min(maxTokens, 3500),
                    messages,
                    response_format: responseFormat
                });
                return res.choices[0]?.message?.content || null;
            }
        }
    };

    // 3. OpenRouter (Paid key or openrouter/free)
    const runOpenRouter = async (): Promise<string | null> => {
        if (!openRouter) return null;
        console.log("--- [AI DISPATCH: OPENROUTER] ---");
        try {
            const res = await openRouter.chat.completions.create({
                model: process.env.AI_MODEL || "google/gemini-2.5-flash-lite",
                max_tokens: Math.min(maxTokens, 1800),
                messages,
                response_format: responseFormat
            });
            return res.choices[0]?.message?.content || null;
        } catch (err: any) {
            console.log("--- [OPENROUTER: SWITCHING TO OPENROUTER/FREE] ---");
            const freeRes = await openRouter.chat.completions.create({
                model: "openrouter/free",
                messages,
                response_format: responseFormat
            });
            return freeRes.choices[0]?.message?.content || null;
        }
    };

    if (priority === 'groq') {
        providerSequence.push({ name: 'groq', run: runGroq });
        providerSequence.push({ name: 'gemini', run: runGemini });
        providerSequence.push({ name: 'openrouter', run: runOpenRouter });
    } else {
        providerSequence.push({ name: 'gemini', run: runGemini });
        providerSequence.push({ name: 'groq', run: runGroq });
        providerSequence.push({ name: 'openrouter', run: runOpenRouter });
    }

    const errors: string[] = [];

    for (const provider of providerSequence) {
        try {
            const result = await provider.run();
            if (result && result.trim().length > 0) {
                return { content: result, providerUsed: provider.name };
            }
        } catch (err: any) {
            console.log(`[AI RESILIENCE FAILOVER] ${provider.name} busy or rate-limited (${err.status || err.message || 'cooling down'}) -> seamlessly routing to next tier...`);
            errors.push(`${provider.name}: ${err.message || String(err)}`);
            // Continue to next provider in cascade
        }
    }

    throw new Error(`All AI providers failed. Check your API keys in .env.local. Errors: [${errors.join(' | ')}]`);
}
