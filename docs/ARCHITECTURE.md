# Architecture & Engineering Standards

> Guiding principle: **"Architecture is kindness to my future self."**

ReviewQuest uses feature-first organization with a layered separation, so logic, data, and presentation don't tangle.

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Presentation | `src/features/*/components` | UI components styled with Tailwind. Keep business logic out. |
| Logic | `src/features/*/store.ts`, `src/features/*/services` | Zustand state and AI orchestration services. |
| Data / schemas | `src/lib/schemas.ts` | Zod schemas as the single source of truth for entities. |
| Infrastructure | `src/lib/multiAiClient.ts`, `src/lib/supabase.ts` | External clients and environment boundaries. |
| Routes | `src/app/api/*` | Thin HTTP handlers that call the service layer. |
| API guards | `src/lib/api/*` | Shared request handling: rate limiting, size limits, Zod request schemas, error responses. |

## Request flow

Every API route first runs the shared guards in `src/lib/api`: **rate limit → size-limited body read → JSON parse → Zod validation**. Only then does it call a service.

1. **`/api/extract`**: the uploaded PDF is verified by its magic bytes, parsed server-side with `pdfjs-dist`, and the text is normalized and capped.
2. **`/api/syllabus`**: the text is split into sub-topics (one per floor).
3. **`/api/generate` / `/api/generate-stage`**: AI generates the boss and its questions for the chosen quiz type.
4. **`multiAiClient`** sends each request to Gemini, falling back to Groq and then OpenRouter on failure or timeout.
5. Responses are validated with Zod before reaching the game store.

## Standards

- **Validate at boundaries.** AI JSON and user input are parsed with Zod before use.
- **Guard clauses over nested ifs.** Return early.
- **Token-driven UI.** Colors and spacing come from CSS variables in `globals.css`, not hardcoded hex values.
- **Feature-first folders.** Group by feature (`game/`, `upload/`, `dashboard/`), not by file type.
- **Loading skeletons** during AI generation to avoid layout shift.
- **Accessibility.** Semantic HTML, keyboard operability, and visible focus rings.

## Targets (aspirational, not yet measured)

- Initial JS under 200 KB
- LCP under 2.5 s
- Zero `any` types (currently ~16 `as any` / `@ts-ignore` remain; see the cleanup checklist)

## Status

| Area | State |
| --- | --- |
| Core game loop | Done |
| AI generation pipeline | Done |
| Progression and crafting | Done |
| Cloud sync (Supabase) | In progress: `scoreService` exists but is not called yet |
| Multiplayer / social | Planned |
