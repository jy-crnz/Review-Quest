# ⚔️ ReviewQuest

**Turn your study materials into a boss battle.**

ReviewQuest is a gamified study app. Upload a PDF, and AI turns it into a multi-floor sci-fi dungeon where **knowledge is your weapon**. Answer correctly to damage enemies, answer wrong and you take damage. Every mistake is saved to an Intel Log so you can review exactly what you missed.

<!-- TODO: add a screenshot or GIF of a battle here, e.g. ![ReviewQuest battle](docs/screenshots/battle.png) -->

## ✨ Features

**AI dungeon generation**
- Upload a PDF and the text is extracted and split into sub-topics. Each topic becomes a floor.
- Three question types: **Multiple Choice**, **True/False**, and **Enumeration**.
- AI output is validated with strict [Zod](https://zod.dev) schemas before it reaches the game.
- Automatic provider failover: **Gemini → Groq → OpenRouter**, so free-tier rate limits don't end your session.

**Combat**
- Turn-based fights against thematic bosses, floor by floor, with animated descents between levels.
- Correct answers deal damage; wrong answers cost HP, reduced by your Defense stat.
- Build a **combo meter** to boost damage and charge an **Ultimate**.

**Progression**
- Earn XP, level up, and spend skill points on Attack and Defense.
- **The Forge:** collect loot fragments and craft weapons and armor.
- **Character creator:** gender, skin tone, hair, and facial features, composited into a live sprite.
- Pets with sound effects.

**Review**
- **Intel Log** lists every wrong answer with the correct answer and a rationale.
- Mission Briefing and Debrief screens frame each run.

## 🧰 Tech stack

| Area | Tools |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling & motion | Tailwind CSS 4, Framer Motion, Lucide icons |
| State | Zustand (persisted) |
| Validation | Zod |
| AI | OpenAI SDK pointed at Gemini, Groq, and OpenRouter (OpenAI-compatible endpoints) |
| PDF parsing | `pdfjs-dist` (server-side) |
| Backend / DB | Supabase (optional, work in progress) |

## 🚀 Getting started

### Prerequisites
- **Node.js 20.9+** (required by Next.js 16)
- At least **one** free AI API key: [Gemini](https://aistudio.google.com/apikey), [Groq](https://console.groq.com/keys), or [OpenRouter](https://openrouter.ai/keys)

### Setup

```bash
git clone https://github.com/jy-crnz/Review-Quest.git
cd Review-Quest
npm install
cp .env.example .env.local   # then add your API key(s)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | One of the three AI keys | Primary AI provider |
| `GROQ_API_KEY` | One of the three AI keys | First fallback |
| `OPENROUTER_API_KEY` | One of the three AI keys | Second fallback |
| `GEMINI_MODEL` | No | Default `gemini-2.5-flash` |
| `GROQ_MODEL` | No | Default `openai/gpt-oss-120b` |
| `AI_MODEL` | No | OpenRouter model, default `google/gemini-2.5-flash-lite` |
| `RATE_LIMIT_PER_MINUTE` | No | Max requests per minute per IP, per API route (default 30) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Cloud sync (not wired up yet) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Cloud sync (not wired up yet) |

See [`.env.example`](.env.example) for a ready-to-copy template.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint with ESLint |

## 🗂️ Project structure

```
src/
├── app/              # Next.js routes and API handlers (extract, syllabus, generate, generate-stage)
├── features/
│   ├── game/         # Battle, character, forge, map: components, services, Zustand store
│   ├── upload/       # File upload UI
│   └── dashboard/    # XP bar, level-up and run-summary modals
└── lib/              # Zod schemas, AI client, answer matching, Supabase client
```

For design principles and layering, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 🛡️ API protection

All API routes validate their input with Zod and apply these limits (defined in `src/lib/api/limits.ts`):

| Limit | Value |
| --- | --- |
| Upload size | 20 MB, PDF only (checked by file contents, not just the extension) |
| PDF pages read | first 500 |
| Study text | 300,000 characters |
| Requests | 30 per minute per IP, per route (`RATE_LIMIT_PER_MINUTE`) |

Errors always use the shape `{ "error": { "code": "...", "message": "..." } }`. Messages are generic; details go to server logs only.

## ⚠️ Known limitations

- **PDF only.** PowerPoint (PPTX) files are rejected with a friendly message. Export your slides to PDF first.
- **Rate limiting is in-memory.** Counters live in the server process, so on serverless hosts the limit applies per instance. Use a shared store (e.g. Upstash Redis) for strict limits. The client IP is read from `x-forwarded-for`, which is only trustworthy behind a platform that sets it (e.g. Vercel).
- **The AI only reads the first ~80,000 characters** of a document when building the syllabus.
- **Cloud sync is unfinished.** Progress is stored locally in the browser.

## 🗺️ Roadmap

- [x] Core game loop (battle, HP, floor transitions)
- [x] Multi-level AI dungeon generation
- [x] XP, leveling, and stat upgrades
- [x] The Forge crafting
- [x] Character creator and sprite compositing
- [ ] PPTX support
- [x] API route hardening (input limits, validation, rate limiting)
- [ ] Automated tests
- [ ] Cloud sync with Supabase Auth and Row Level Security
- [ ] Multiplayer / social features
