import { ReviewerSyllabusSchema, type ReviewerSyllabus } from "@/lib/schemas";
import { executeMultiAiCompletion } from "@/lib/multiAiClient";

/**
 * Zero-AI Algorithmic Syllabus Parser
 * Pure algorithmic fallback when ALL AI providers fail.
 * No network calls, no external dependencies — guaranteed to produce output.
 */
function buildAlgorithmicSyllabus(text: string): ReviewerSyllabus {
    const enemySprites = ['vanguard_scout', 'elite_sentinel', 'chaos_guard', 'academic_overlord'];
    const lines = text.split('\n');

    // --- Step 1: Detect headings ---
    const romanNumeralRe = /^[IVX]+\.\s+.{3,}/;
    const allCapsRe = /^[A-Z][A-Z ]{4,}$/;
    const numberedRe = /^\d+[\.\)]\s+[A-Z].{2,}/;

    interface Section { heading: string; body: string[] }
    const sections: Section[] = [];
    let currentSection: Section | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        const isHeading =
            romanNumeralRe.test(trimmed) ||
            allCapsRe.test(trimmed) ||
            numberedRe.test(trimmed);

        if (isHeading) {
            if (currentSection) sections.push(currentSection);
            currentSection = { heading: trimmed, body: [] };
        } else if (currentSection) {
            currentSection.body.push(trimmed);
        }
    }
    if (currentSection) sections.push(currentSection);

    // --- Step 2: Extract term-definition pairs from each section ---
    const colonPairRe = /^(.+?)\s*[:\-–]\s*(.+)/;
    const bulletRe = /^[\-\*\•\·]\s*(.+)/;

    interface Pair { term: string; description: string }

    function extractPairsFromLines(bodyLines: string[]): Pair[] {
        const pairs: Pair[] = [];
        for (const line of bodyLines) {
            if (!line.trim()) continue;
            const colonMatch = line.match(colonPairRe);
            if (colonMatch) {
                pairs.push({ term: colonMatch[1].trim(), description: colonMatch[2].trim() });
                continue;
            }
            const bulletMatch = line.match(bulletRe);
            if (bulletMatch) {
                const content = bulletMatch[1].trim();
                pairs.push({ term: content, description: content });
                continue;
            }
            // Sentence boundary fallback
            const sentences = line.split(/\.\s+/).filter(s => s.trim().length > 3);
            for (const sentence of sentences) {
                const words = sentence.trim().split(/\s+/);
                const term = words.slice(0, 4).join(' ');
                pairs.push({ term, description: sentence.trim() });
            }
        }
        return pairs;
    }

    // --- Step 3: Gather all items (with section association) ---
    interface TaggedPair extends Pair { sectionIndex: number }
    let allTaggedPairs: TaggedPair[] = [];

    for (let i = 0; i < sections.length; i++) {
        const pairs = extractPairsFromLines(sections[i].body);
        for (const p of pairs) {
            allTaggedPairs.push({ ...p, sectionIndex: i });
        }
    }

    // Chunk fallback if too few headings or items
    if (sections.length < 3 || allTaggedPairs.length < 9) {
        allTaggedPairs = [];
        const chunks = text.split(/\n\n+/);
        const chunkSubset = chunks.slice(0, 5);
        for (let i = 0; i < chunkSubset.length; i++) {
            const chunk = chunkSubset[i];
            if (chunk.trim().length < 20) continue;
            const chunkLines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
            const pairs = extractPairsFromLines(chunkLines);
            if (pairs.length === 0) {
                // sentence-level fallback on the whole chunk
                const sentences = chunk.split(/\.\s+/).filter(s => s.trim().length > 3);
                for (const sentence of sentences) {
                    const words = sentence.trim().split(/\s+/);
                    const term = words.slice(0, 4).join(' ');
                    allTaggedPairs.push({ term, description: sentence.trim(), sectionIndex: i });
                }
            } else {
                for (const p of pairs) allTaggedPairs.push({ ...p, sectionIndex: i });
            }
        }
    }

    // Deduplicate by term
    const seenTerms = new Set<string>();
    const uniquePairs = allTaggedPairs.filter(p => {
        const key = p.term.toLowerCase().trim();
        if (seenTerms.has(key) || !p.term.trim() || !p.description.trim()) return false;
        seenTerms.add(key);
        return true;
    });

    // --- Step 4: Partition into stages of 7–9 items ---
    const totalItems = uniquePairs.length;

    // Minimum graceful output
    if (totalItems === 0) {
        return ReviewerSyllabusSchema.parse({
            title: "Algorithmic Reviewer",
            summary: "Algorithmically extracted study material.",
            stages: [{
                stageIndex: 1,
                title: "Bahagi 1",
                enemyId: "vanguard_scout",
                summary: "Algorithmic stage 1 of 1",
                items: [{ term: "Review Document", description: text.substring(0, 100).trim() || "Study material loaded." }]
            }]
        });
    }

    const TARGET_CHUNK = 8;
    const stageCount = totalItems < 7 ? 1 : Math.ceil(totalItems / TARGET_CHUNK);
    const finalStages: any[] = [];

    // Build a lookup from sectionIndex → heading for stage titles
    const sectionHeadings = sections.map(s => s.heading);

    for (let si = 0; si < stageCount; si++) {
        const sliceStart = si * TARGET_CHUNK;
        const sliceEnd = Math.min(sliceStart + TARGET_CHUNK, totalItems);
        const stageItems = uniquePairs.slice(sliceStart, sliceEnd);

        // Determine representative section heading for this stage
        const repSectionIndex = stageItems[0]?.sectionIndex ?? -1;
        let stageTitle: string;
        if (repSectionIndex >= 0 && sectionHeadings[repSectionIndex]) {
            const words = sectionHeadings[repSectionIndex].split(/\s+/).slice(0, 6);
            stageTitle = words.join(' ');
        } else {
            stageTitle = `Bahagi ${si + 1}`;
        }

        finalStages.push({
            stageIndex: si + 1,
            title: stageTitle,
            enemyId: enemySprites[si % enemySprites.length],
            summary: `Algorithmic stage ${si + 1} of ${stageCount}`,
            items: stageItems.map(p => ({ term: p.term, description: p.description }))
        });
    }

    return ReviewerSyllabusSchema.parse({
        title: "Algorithmic Reviewer",
        summary: "Algorithmically extracted study material.",
        stages: finalStages
    });
}

/**
 * Service: Progressive Syllabus Extraction
 * Analyzes the entire document and deconstructs it into progressive study stages.
 * Zero questions generated at this step — ultra lightweight and resilient.
 */
export async function extractReviewerSyllabus(fileText: string): Promise<ReviewerSyllabus> {
    if (!fileText || fileText.length < 30) {
        throw new Error("Insufficient study text provided.");
    }

    const enemySprites = ['vanguard_scout', 'elite_sentinel', 'chaos_guard', 'academic_overlord'];

    const buildPrompt = (isRetry: boolean = false) => `
        You are the "Master of Intel" in a gamified learning RPG.
        Analyze the provided study reviewer and deconstruct it into progressive, bite-sized learning stages.
        ${isRetry ? "\n⚠️ CRITICAL WARNING: A previous attempt generated too few stages or items. You MUST comprehensively scan the document and output at least 3 to 6 distinct stages, each containing 6 to 10 items!\n" : ""}
        TASK:
        1. Identify the overarching subject as the "title" of the reviewer.
        2. Write a concise 2-sentence "summary" of what the reviewer covers.
        3. Deconstruct the document into 3 to 6 progressive learning stages:
           - Each stage should contain 6 to 10 study items (concepts, dates, people, definitions).
           - NEVER dump everything into a single stage! Divide the document sequentially by topics, sections, or chronological periods into 3 to 6 progressive stages.
           - For EACH stage:
             - "stageIndex": 1-based index (1, 2, 3...)
             - "title": Descriptive topic title (e.g. "Stage 1: Mga Pangunahing Tauhan", "Stage 2: Ang Anotasyon ng Sucesos", "Stage 3: Mga Sanaysay at Calamba", "Stage 4: Asosasyon at Terminolohiya").
             - "enemyId": One of 'vanguard_scout', 'elite_sentinel', 'academic_overlord', 'chaos_guard'.
             - "summary": 1 short sentence describing this stage.
             - "items": Array of 6 to 10 terms and concise definitions found in this part.
        
        CRITICAL RULES:
        - MANDATORY MINIMUM: For any study reviewer, you MUST extract at least 3 to 6 distinct progressive stages. It is STRICTLY FORBIDDEN to output only 1 stage or a single item!
        - BITE-SIZED STAGE BALANCING: Each stage must contain 6 to 10 distinct items.
        - EXHAUSTIVE DOCUMENT SCAN: Scan the material completely from the very first line to the very last line. Extract all concepts across the stages.
        - Keep descriptions concise and direct (under 10 words each) to produce compact, high-speed JSON without hitting token limits.
        - Preserve the original language of the text (e.g., Tagalog/Filipino if in Tagalog/Filipino, English if English). Do NOT translate terms.
        
        STRICT JSON SCHEMA:
        {
          "title": "Topic Title",
          "summary": "Concise summary of the reviewer.",
          "stages": [
            {
              "stageIndex": 1,
              "title": "Stage 1 Title",
              "enemyId": "vanguard_scout",
              "summary": "Summary of stage 1.",
              "items": [
                { "term": "Term 1", "description": "Definition 1" },
                { "term": "Term 2", "description": "Definition 2" },
                { "term": "Term 3", "description": "Definition 3" },
                { "term": "Term 4", "description": "Definition 4" },
                { "term": "Term 5", "description": "Definition 5" },
                { "term": "Term 6", "description": "Definition 6" },
                { "term": "Term 7", "description": "Definition 7" }
              ]
            },
            {
              "stageIndex": 2,
              "title": "Stage 2 Title",
              "enemyId": "elite_sentinel",
              "summary": "Summary of stage 2.",
              "items": [
                { "term": "Term A", "description": "Definition A" },
                { "term": "Term B", "description": "Definition B" },
                { "term": "Term C", "description": "Definition C" },
                { "term": "Term D", "description": "Definition D" },
                { "term": "Term E", "description": "Definition E" },
                { "term": "Term F", "description": "Definition F" },
                { "term": "Term G", "description": "Definition G" }
              ]
            },
            {
              "stageIndex": 3,
              "title": "Stage 3 Title",
              "enemyId": "chaos_guard",
              "summary": "Summary of stage 3.",
              "items": [
                { "term": "Concept X", "description": "Definition X" },
                { "term": "Concept Y", "description": "Definition Y" },
                { "term": "Concept Z", "description": "Definition Z" },
                { "term": "Concept W", "description": "Definition W" },
                { "term": "Concept V", "description": "Definition V" },
                { "term": "Concept U", "description": "Definition U" }
              ]
            }
          ]
        }

        MATERIAL:
        ${fileText.substring(0, 80000)}
    `;

    const parseSyllabusOutput = (responseText: string): any => {
        let cleanJson = responseText.replace(/```json|```/g, "").trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        cleanJson = cleanJson.replace(/,[ \t\r\n]*([\]}])/g, '$1');

        try {
            return JSON.parse(cleanJson);
        } catch {
            const lastBrace = cleanJson.lastIndexOf('}');
            if (lastBrace !== -1) {
                let candidate = cleanJson.substring(0, lastBrace + 1).replace(/,\s*$/, '');
                const stack: string[] = [];
                let inString = false;
                let escaped = false;

                for (let i = 0; i < candidate.length; i++) {
                    const char = candidate[i];
                    if (escaped) { escaped = false; continue; }
                    if (char === '\\') { escaped = true; continue; }
                    if (char === '"') { inString = !inString; continue; }
                    if (!inString) {
                        if (char === '{') stack.push('}');
                        else if (char === '[') stack.push(']');
                        else if (char === '}' || char === ']') {
                            if (stack.length > 0 && stack[stack.length - 1] === char) {
                                stack.pop();
                            }
                        }
                    }
                }

                const closingSuffix = stack.reverse().join('');
                candidate = candidate.replace(/,\s*$/, '') + closingSuffix;
                return JSON.parse(candidate);
            }
            throw new Error("Failed to parse syllabus JSON");
        }
    };

    let rawData: any = { stages: [] };
    try {
        const aiResult = await executeMultiAiCompletion({
            prompt: buildPrompt(false),
            systemPrompt: "You are a JSON-only tactical intel parser. Output valid JSON only, without trailing commas.",
            maxTokens: 7500,
            priority: 'gemini'
        });

        if (aiResult.content) {
            rawData = parseSyllabusOutput(aiResult.content);

            // 🛡️ QUALITY GUARD: If the AI produced only 1 stage or fewer than 5 items for a substantial document, retry with Groq failover
            const initialItemCount = (rawData.stages || []).reduce(
                (sum: number, s: any) => sum + (Array.isArray(s.items) ? s.items.length : 0), 0
            );

            if (fileText.length > 800 && ((rawData.stages || []).length < 2 || initialItemCount < 6)) {
                console.warn(`[SYLLABUS WARNING] Sparse syllabus detected (${(rawData.stages || []).length} stages, ${initialItemCount} items). Triggering resilient re-deconstruction...`);
                try {
                    const retryResult = await executeMultiAiCompletion({
                        prompt: buildPrompt(true),
                        systemPrompt: "You are a tactical educational architect. Deconstruct the entire text into at least 3 to 6 distinct stages with 6 to 10 items each. Output strictly valid JSON.",
                        maxTokens: 7500,
                        priority: 'groq'
                    });
                    if (retryResult.content) {
                        const retryData = parseSyllabusOutput(retryResult.content);
                        const retryItemCount = (retryData.stages || []).reduce(
                            (sum: number, s: any) => sum + (Array.isArray(s.items) ? s.items.length : 0), 0
                        );
                        if ((retryData.stages || []).length >= (rawData.stages || []).length && retryItemCount > initialItemCount) {
                            rawData = retryData;
                            console.log(`[SYLLABUS RESILIENCE] Resilient re-deconstruction succeeded: ${rawData.stages.length} stages, ${retryItemCount} items.`);
                        }
                    }
                } catch (retryErr) {
                    console.warn("[SYLLABUS RESILIENCE] Fallback deconstruction skipped, continuing with initial parse:", retryErr);
                }
            }
        }
    } catch (aiErr) {
        console.warn("[SYLLABUS TIER-3] AI completely unavailable:", aiErr);
        // rawData stays { stages: [] }, triggering algorithmic fallback below
    }

    // Normalization & Progressive Auto-Partitioning Safeguard
    const finalStages: any[] = [];
    let stageCounter = 1;

    for (const rawStage of (rawData.stages || [])) {
        const validItems = (rawStage.items || []).filter((item: any) => item.term && item.description).map((item: any) => ({
            term: String(item.term).trim(),
            description: String(item.description).trim()
        }));

        if (validItems.length === 0) continue;

        // 🛡️ BITE-SIZED GAUNTLET PARTITIONING:
        // If a single stage contains > 10 items (e.g. 35 items), partition into balanced 7-9 item sub-stages
        const MAX_STAGE_ITEMS = 10;
        const TARGET_CHUNK = 8;
        if (validItems.length > MAX_STAGE_ITEMS) {
            const chunkCount = Math.ceil(validItems.length / TARGET_CHUNK);
            for (let c = 0; c < chunkCount; c++) {
                const chunkItems = validItems.slice(c * TARGET_CHUNK, (c + 1) * TARGET_CHUNK);
                const rawTitle = String(rawStage.title || `Bahagi ${c + 1}`).trim();
                const baseTitle = rawTitle.replace(/^([I|V|X]+\.\s*)?/, '').trim() || `Sektor`;
                const subTitle = `${baseTitle} (Bahagi ${c + 1}/${chunkCount})`;

                finalStages.push({
                    stageIndex: stageCounter,
                    title: subTitle,
                    enemyId: enemySprites[(stageCounter - 1) % enemySprites.length],
                    summary: rawStage.summary || `Pagsasanay para sa ${subTitle}`,
                    items: chunkItems
                });
                stageCounter++;
            }
        } else {
            finalStages.push({
                stageIndex: stageCounter,
                title: rawStage.title || `Stage ${stageCounter}`,
                enemyId: rawStage.enemyId || enemySprites[(stageCounter - 1) % enemySprites.length],
                summary: rawStage.summary || "",
                items: validItems
            });
            stageCounter++;
        }
    }

    if (finalStages.length === 0) {
        console.warn("[SYLLABUS TIER-3] All AI providers failed or produced no stages. Engaging Zero-AI algorithmic fallback...");
        const algorithmicSyllabus = buildAlgorithmicSyllabus(fileText);
        return algorithmicSyllabus;
    }

    const normalizedData = {
        title: rawData.title || "Target Reviewer Intel",
        summary: rawData.summary || "Complete tactical study curriculum.",
        stages: finalStages
    };

    return ReviewerSyllabusSchema.parse(normalizedData);
}
