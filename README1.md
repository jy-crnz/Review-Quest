# ⚔️ ReviewQuest
**The Academic Boss Battle**

ReviewQuest is a gamified study platform designed for IT students to transform dense academic materials (PDFs/PPTs) into interactive "Boss Battle" simulations. Using AI-driven active recall and strict architectural standards, it turns exam preparation into a rewarding quest.

---

## 🏗️ Architecture & Core Principles
This project is built with the guiding principle: **"Architecture is Kindness to my Future Self."** It follows a strict **Layered Separation** to ensure that logic, data, and presentation never tangle.

### 1. Layered Structure (Step 2)
* **Presentation Layer (`/src/features/*/components`):** Pure UI components driven by Tailwind CSS. Logic-agnostic and focused on user interaction.
* **Logic Layer (`/src/features/*/store.ts` & `/services`):** Global state managed via Zustand and AI orchestration services.
* **Data Access Layer (`/src/lib/schemas.ts`):** Strict Zod schemas acting as the **Single Source of Truth** for all entities.
* **Infrastructure Layer (`/src/lib/supabase.ts`):** Configuration for external services, API clients, and environment boundaries.

### 2. Engineering Standards (Step 3 & 5)
* **Token-Driven UI:** No hardcoded hex codes. All colors (Player HP, Boss HP, XP Gold) and spacing (4px/8px scale) use CSS variables defined in `globals.css`.
* **Validation at Boundaries:** All data entering the system—from AI-generated JSON to user-uploaded files—is parsed and validated via Zod before reaching the UI.
* **Guard Clauses Over Nested Ifs:** Functions prioritize early returns to ensure code readability and prevent silent failures.
* **Performance Budget:** Optimized for a snappy experience. Initial JS < 200KB. LCP < 2.5s utilizing **Loading Skeletons** to maintain UI stability during AI generation.

---

## 🚀 Technical Stack
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript (Strict Mode)
* **State Management:** Zustand (Local-first with persistence support)
* **Schema Validation:** Zod
* **Database & Auth:** Supabase (PostgreSQL)
* **Styling:** Tailwind CSS + Lucide Icons
* **Utilities:** `clsx` + `tailwind-merge` for safe class manipulation.

---

## 🛠️ Getting Started

### 1. Prerequisites
* Node.js (v18+)
* A Supabase Project

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

## 3. Installation
PowerShell
# Navigate to the project folder
cd reviewquest

# Install dependencies
npm install
4. Development
PowerShell
npm run dev
✅ Definition of Done (Step 7 Checklist)
[x] Feature-First Organization: Files grouped by feature (auth/, game/, upload/) rather than technical type.

[x] Gamification Engine: XP calculation and Level-Up triggers encapsulated in the Logic Layer.

[x] UI Resilience: Loading Skeletons implemented to prevent layout shift.

[x] Type Safety: Zero any types; all interfaces are inferred directly from Zod schemas.

[x] A11y Standards: Semantic HTML, keyboard operable, and visible focus indicators using --focus-ring.

📜 Project Vision
ReviewQuest aims to reduce the cognitive load of studying by applying RPG mechanics to learning. By validating every boundary and maintaining a clean separation of concerns, the codebase remains a "kindness" to developers and a powerful tool for students.