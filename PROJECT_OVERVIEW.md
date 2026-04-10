# ReviewQuest: The Gamified Study RPG

## Project Vision
**ReviewQuest** is a gamified learning platform that transforms dense study materials into an immersive Sci-Fi RPG experience. By leveraging AI to process user-uploaded documents (like PDFs), the application generates challenging "battles" where knowledge is the primary weapon.

---

## Core Features & Current Progress

### 1. AI-Powered Knowledge Extraction
- **PDF Processing:** Automated text extraction from uploaded study materials using `pdf-parse`.
- **Dynamic Quiz Generation:** Integration with Google Generative AI (Gemini) and OpenAI to generate three types of challenges:
  - Multiple Choice
  - True/False
  - Enumeration (Input-based)
- **Subject Classification:** Automatic categorization of content into specialized "Dungeons" (IT, Nursing, Engineering, Law).

### 2. Tactical RPG Combat Engine
- **Battle Mechanics:** Players engage in turn-based combat against AI "Bosses" (e.g., The Academic Overlord).
- **Damage System:** 
  - **Attack:** Correct answers deal damage to enemies.
  - **Defense:** Incorrect answers result in health loss for the player, mitigated by defense stats.
- **Combo & Ultimate:** Successive correct answers build a combo meter, increasing damage and charging a powerful "Ultimate" ability.
- **Waves:** Battles are structured in waves, with escalating difficulty and unique enemy quotes.

### 3. Character Progression & Customization
- **Modular Character Creator:** Customize gender, skin tone, hair style, and modular facial features (optics, mouth, etc.).
- **Leveling System:** Earn XP through study sessions to level up and gain skill points to upgrade Attack and Defense.
- **The Forge (Crafting):** 
  - Collect loot fragments (Neural Links, Hardened Plates, Power Cores, Data Shards) from victories.
  - **High-Fidelity Visual Previews:** Real-time rendering of high-quality item assets (e.g., Sentinel Plating) during the compilation process instead of generic icons.
  - **Dynamic Asset Integration:** Recipes now support direct asset mapping via `assetPath` for a more immersive crafting experience.
  - Craft advanced weapons (Pulse Blade, Logic Staff) and armor to improve system stability and output.
- **Study Buddies:** Selectable pets (cats, owls, etc.) that accompany the player.

### 4. Exploration & Review
- **Tactical Map:** A visual representation of the study session's progress.
- **World Map:** A persistent map where players discover and revisit "Dungeons" based on their uploaded materials.
- **Intel Log:** A detailed review system that tracks "mistakes" (wrong answers), providing rationales and correct answers for post-battle analysis.

---

## Technical Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS & Framer Motion (for high-fidelity animations)
- **State Management:** Zustand (with persistence)
- **Backend/Database:** Supabase
- **AI Integration:** Google Generative AI & OpenAI SDKs
- **Icons:** Lucide-React

---

## Implementation Status (Summary)
- [x] **Core Game Loop:** Battle system, health management, and wave transitions.
- [x] **AI Integration:** PDF text extraction and quiz generation pipeline.
- [x] **State Persistence:** Local storage persistence for character stats and inventory.
- [x] **Progression:** Leveling, XP, and stat upgrading.
- [x] **Crafting:** The Forge interface and loot requirement logic.
- [x] **UI/UX:** Responsive layouts, character previews, and animated modals.
- [ ] **Multiplayer/Social:** (Planned/Future)
- [ ] **Cloud Sync:** (Work in progress via Supabase)
