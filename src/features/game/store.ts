import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Quiz, type PetType, DungeonData, Level } from '@/lib/schemas';

// --- Engineering Standards: Balancing Constants ---
const XP_PER_CORRECT_ANSWER = 20;
const VICTORY_BONUS_XP = 100;
const PLAYER_HEALTH_POOL = 100;
const BASE_DAMAGE_TO_BOSS = 25;
const BASE_DAMAGE_TO_PLAYER = 20;

/** * 🛡️ MAP ARCHITECTURE CONSTANTS 
 * Ensures nodes stay within the 2000px TacticalMap canvas
 */
const CANVAS_SIZE = 2000;
const NODE_PADDING = 400;

export type CourseType = 'it' | 'nursing' | 'engineering' | 'law' | 'default';
export type QuizType = 'multiple-choice' | 'true-false' | 'enumeration';
export type EnemySpriteId = 'vanguard_scout' | 'elite_sentinel' | 'academic_overlord' | 'chaos_guard';
export type Gender = 'male' | 'female';
export type FragmentType = 'neural_link' | 'hardened_plate' | 'power_core' | 'data_shard';

// --- DATA STRUCTURES ---

export interface LootInventory {
    neural_link: number;
    hardened_plate: number;
    power_core: number;
    data_shard: number;
}

export interface ForgeRecipe {
    id: string;
    name: string;
    description: string;
    type: 'armor' | 'weapon';
    targetId: number;
    assetPath?: string;
    requirements: Partial<Record<FragmentType, number>>;
    bonuses: {
        attack?: number;
        defense?: number;
        xpBoost?: number;
    };
    isCompiled: boolean;
}

export interface WrongAnswer {
    question: string;
    userChoice: string;
    correctChoice: string;
    rationale?: string;
}

const WAVES = [
    { title: "Vanguard Scout", quote: "You won't get past the perimeter!", spriteId: 'vanguard_scout' as EnemySpriteId },
    { title: "Elite Sentinel", quote: "Reinforcements have arrived. Adapt or fail.", spriteId: 'elite_sentinel' as EnemySpriteId },
    { title: "The Academic Overlord", quote: "You have reached the final evaluation. Prove your worth.", spriteId: 'academic_overlord' as EnemySpriteId },
    { title: "Overlord Guard", quote: "Protect the Master! You shall not pass!", spriteId: 'chaos_guard' as EnemySpriteId }
];

export interface CharacterAppearance {
    gender: Gender;
    skinColorId: number;
    hairId: string;
    hairColor: string;
    faceId: string;      // Modular Optics
    faceColor: string;   // Optic Glow
    noseId: string;      // Modular Nose
    mouthId: string;     // Modular Mouth
    armorId: number;
    weaponId: number;
}

export interface DungeonNode {
    id: string;
    name: string;
    subject: CourseType;
    quizType: QuizType;
    status: 'locked' | 'available' | 'cleared' | 'decayed'; // Added 'decayed'
    position: { x: number; y: number };
    levelRequired: number;
    lastClearedAt: number | null; // Spaced Repetition tracking
    stability: number; // 0-100% knowledge retention
}

export interface TacticalNode {
    id: number;
    status: 'cleared' | 'current' | 'upcoming';
}

interface SessionStats {
    questionsCorrect: number;
    questionsAttempted: number;
    totalDamageDealt: number;
}

interface GameState {
    // Combat State
    playerHP: number;
    bossHP: number;
    maxBossHP: number;
    bossName: string;
    bossQuote: string;
    currentWaveIndex: number;
    currentQuestionIndex: number;
    isGameOver: boolean;
    isBossSlain: boolean;
    currentQuiz: DungeonData | null;
    currentLevelIndex: number;
    isLevelComplete: boolean;

    // Character State
    playerName: string;
    appearance: CharacterAppearance;
    selectedPet: PetType;
    level: number;
    currentXP: number;
    skillPoints: number;
    stats: { attack: number; defense: number; };

    // Forge & Loot State
    inventory: LootInventory;
    recipes: ForgeRecipe[];
    sessionLoot: Partial<LootInventory> | null;

    // Global State
    courseType: CourseType;
    pendingExtractedText: string | null;
    hasSeenOnboarding: boolean;
    dungeons: DungeonNode[];
    activeDungeonId: string | null;
    mapNodes: TacticalNode[];
    showInGameMap: boolean;
    combo: number;
    maxCombo: number;
    ultimateCharge: number;
    sessionStats: SessionStats;
    runSummary: { reason: 'defeated' | 'abandoned' | 'victory'; stats: SessionStats } | null;

    wrongAnswers: WrongAnswer[];
    showResults: boolean;
    showLevelUp: boolean;
    pendingLevelUp: boolean;
    showBriefing: boolean; // NEW: Story state

    // Actions
    setPendingText: (text: string | null) => void;
    setQuiz: (quiz: DungeonData, quizType: QuizType) => void;
    nextLevel: () => void;
    setPetType: (type: PetType) => void;
    setPlayerName: (name: string) => void;
    updateAppearance: (look: Partial<CharacterAppearance>) => void;
    completeOnboarding: () => void;
    toggleInGameMap: () => void;
    setActiveDungeon: (id: string | null) => void;
    discoverDungeon: (name: string, subject: CourseType) => void;
    clearActiveDungeon: () => void;
    runDecayScan: () => void; // Added for Spaced Repetition
    handleAnswer: (answer: number | string) => void;
    useUltimate: () => void;
    endRun: (reason: 'defeated' | 'abandoned' | 'victory') => void;
    upgradeStat: (statType: 'attack' | 'defense') => void;
    closeLevelUp: () => void;
    closeBriefing: () => void; // NEW: Story action
    collectRewards: () => void;
    resetGame: () => void;
    setShowResults: (val: boolean) => void;
    logMistake: (mistake: WrongAnswer) => void;
    resetIntelLog: () => void;
    addLoot: (loot: Partial<LootInventory>) => void;
    compileItem: (recipeId: string) => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // ... (keep previous values)
            playerName: 'Operator_01',
            appearance: {
                gender: 'male',
                skinColorId: 1,
                hairId: '1',
                hairColor: '#090806',
                faceId: '1',
                faceColor: '#00f2ff',
                noseId: '1',
                mouthId: '1',
                armorId: 1,
                weaponId: 1
            },
            level: 1,
            currentXP: 0,
            skillPoints: 0,
            stats: { attack: 0, defense: 0 },
            selectedPet: 'cat',

            // --- Initial Combat State ---
            playerHP: PLAYER_HEALTH_POOL,
            bossHP: 100,
            maxBossHP: 100,
            bossName: 'Scanning...',
            bossQuote: '...',
            currentWaveIndex: 0,
            currentQuestionIndex: 0,
            currentLevelIndex: 0,
            isLevelComplete: false,
            isGameOver: false,
            isBossSlain: false,
            currentQuiz: null,
            combo: 0,
            maxCombo: 0,
            ultimateCharge: 0,
            sessionStats: { questionsCorrect: 0, questionsAttempted: 0, totalDamageDealt: 0 },
            wrongAnswers: [],
            showResults: false,
            runSummary: null,
            showBriefing: false,

            // --- Forge & Inventory ---
            inventory: { neural_link: 0, hardened_plate: 0, power_core: 0, data_shard: 0 },
            sessionLoot: null,
            recipes: [
                {
                    id: 'sentinel-armor',
                    name: 'Sentinel Plating',
                    type: 'armor',
                    targetId: 2,
                    description: 'Reinforced industrial plating. Increases system stability.',
                    requirements: { hardened_plate: 3, data_shard: 1 },
                    bonuses: { defense: 5 },
                    assetPath: '/assets/armor/sentinel_armor.png',
                    isCompiled: false
                },
                {
                    id: 'vanguard-armor',
                    name: 'Vanguard Exosuit',
                    type: 'armor',
                    targetId: 3,
                    description: 'Advanced mobility shell. High defense rating.',
                    requirements: { hardened_plate: 6, neural_link: 2 },
                    bonuses: { defense: 12 },
                    isCompiled: false
                },
                {
                    id: 'overlord-armor',
                    name: 'Overlord Chassis',
                    type: 'armor',
                    targetId: 4,
                    description: 'Legendary regalia. Massive stability and power.',
                    requirements: { hardened_plate: 15, power_core: 2, neural_link: 5 },
                    bonuses: { defense: 25, attack: 10 },
                    isCompiled: false
                },
                {
                    id: 'pulse-blade',
                    name: 'Pulse Blade',
                    type: 'weapon',
                    targetId: 2,
                    description: 'Holographic edge. Cuts through data gaps.',
                    requirements: { data_shard: 5, neural_link: 1 },
                    bonuses: { attack: 8 },
                    isCompiled: false
                },
                {
                    id: 'logic-staff',
                    name: 'Logic Staff',
                    type: 'weapon',
                    targetId: 3,
                    description: 'Focuses mental energy for higher output.',
                    requirements: { power_core: 1, data_shard: 8 },
                    bonuses: { attack: 18 },
                    isCompiled: false
                }
            ],

            // --- Global/Exploration ---
            courseType: 'default',
            hasSeenOnboarding: false,
            pendingExtractedText: null,
            activeDungeonId: null,
            dungeons: [],
            mapNodes: [],
            showInGameMap: false,
            showLevelUp: false,
            pendingLevelUp: false,

            // --- Actions ---
            setPlayerName: (name) => set({ playerName: name }),
            updateAppearance: (look) => set((state) => ({
                appearance: { ...state.appearance, ...look }
            })),
            setPendingText: (text) => set({ pendingExtractedText: text }),
            toggleInGameMap: () => set((state) => ({ showInGameMap: !state.showInGameMap })),
            setPetType: (type) => set({ selectedPet: type }),
            completeOnboarding: () => set({ hasSeenOnboarding: true }),
            setActiveDungeon: (id) => set({ activeDungeonId: id }),
            setShowResults: (val) => set({ showResults: val }),
            logMistake: (mistake) => set((state) => ({ wrongAnswers: [...state.wrongAnswers, mistake] })),
            resetIntelLog: () => set({ wrongAnswers: [] }),

            addLoot: (loot) => set((state) => ({
                inventory: {
                    neural_link: state.inventory.neural_link + (loot.neural_link || 0),
                    hardened_plate: state.inventory.hardened_plate + (loot.hardened_plate || 0),
                    power_core: state.inventory.power_core + (loot.power_core || 0),
                    data_shard: state.inventory.data_shard + (loot.data_shard || 0),
                }
            })),

            compileItem: (recipeId) => set((state) => {
                const recipe = state.recipes.find(r => r.id === recipeId);
                if (!recipe || recipe.isCompiled) return state;
                const canAfford = Object.entries(recipe.requirements).every(([type, amt]) => state.inventory[type as FragmentType] >= (amt || 0));
                if (!canAfford) return state;
                const newInv = { ...state.inventory };
                Object.entries(recipe.requirements).forEach(([type, amt]) => { newInv[type as FragmentType] -= (amt || 0); });

                return {
                    inventory: newInv,
                    recipes: state.recipes.map(r => r.id === recipeId ? { ...r, isCompiled: true } : r)
                };
            }),

            discoverDungeon: (name, subject) => set((state) => ({
                dungeons: state.dungeons.map(d => d.id === state.activeDungeonId ? { ...d, name, subject } : d)
            })),

            clearActiveDungeon: () => set((state) => ({
                dungeons: state.dungeons.map(d => d.id === state.activeDungeonId ? {
                    ...d,
                    status: 'cleared' as const,
                    lastClearedAt: Date.now(),
                    stability: 100
                } : d)
            })),

            runDecayScan: () => set((state) => {
                const now = Date.now();
                return {
                    dungeons: state.dungeons.map(d => {
                        if (!d.lastClearedAt || d.status === 'locked') return d;
                        
                        // DECAY FORMULA: Lose 1% stability every 2 hours (12% per day)
                        const hoursElapsed = (now - d.lastClearedAt) / (1000 * 60 * 60);
                        const newStability = Math.max(0, Math.floor(100 - (hoursElapsed / 2)));
                        
                        let newStatus = d.status;
                        if (newStability < 50) newStatus = 'decayed';
                        else if (newStability === 100) newStatus = 'cleared';
                        else newStatus = 'available';

                        return { ...d, stability: newStability, status: newStatus as any };
                    })
                };
            }),

            setQuiz: (quiz, quizType) => {
                const subject = (quiz.title || '').toLowerCase();
                let detected: CourseType = 'default';
                if (subject.match(/it|computer|tech|code|software|programming|system|information/)) detected = 'it';
                else if (subject.match(/nurse|nurs|med|health|clinic|patient|doctor|biolog/)) detected = 'nursing';
                else if (subject.match(/engin|mech|struct|civil|blueprint|math|physics/)) detected = 'engineering';
                else if (subject.match(/law|poly|consti|legal|court|justice/)) detected = 'law';

                const newDungeonId = `dungeon-${Date.now()}`;
                const min = NODE_PADDING;
                const max = CANVAS_SIZE - NODE_PADDING;
                const safeX = Math.floor(Math.random() * (max - min + 1)) + min;
                const safeY = Math.floor(Math.random() * (max - min + 1)) + min;

                const newNode: DungeonNode = {
                    id: newDungeonId,
                    name: quiz.title || 'New Intel Sector',
                    subject: detected,
                    quizType: quizType,
                    status: 'available',
                    position: { x: safeX, y: safeY },
                    levelRequired: get().level,
                    lastClearedAt: null,
                    stability: 100
                };

                const currentAtk = get().stats.attack;
                const weapon = get().recipes.find(r => r.type === 'weapon' && r.targetId === get().appearance.weaponId);
                const weaponAtk = weapon?.bonuses.attack || 0;
                const waveHP = Math.floor((5 * (BASE_DAMAGE_TO_BOSS + (currentAtk * 5) + weaponAtk)) * 0.8);
                
                const firstLevel = quiz.levels[0];

                set((state) => ({
                    activeDungeonId: newDungeonId, dungeons: [...state.dungeons, newNode],
                    currentQuiz: quiz, courseType: detected, currentLevelIndex: 0, isLevelComplete: false,
                    mapNodes: firstLevel.questions.map((_: any, idx: number) => ({ id: idx, status: idx === 0 ? 'current' : 'upcoming' })),
                    pendingExtractedText: null, bossName: `Floor 1: ${firstLevel.topicName}`, bossQuote: 'Prepare for evaluation.',
                    currentWaveIndex: 0, playerHP: PLAYER_HEALTH_POOL, bossHP: waveHP, maxBossHP: waveHP,
                    currentQuestionIndex: 0, combo: 0, ultimateCharge: 0,
                    sessionStats: { questionsCorrect: 0, questionsAttempted: 0, totalDamageDealt: 0 },
                    wrongAnswers: [], showResults: false, sessionLoot: null, isGameOver: false, isBossSlain: false,
                    showBriefing: true, // TRIGGER STORY BRIEFING
                }));
            },

            nextLevel: () => set((state) => {
                if (!state.currentQuiz) return state;
                const nextLvlIdx = state.currentLevelIndex + 1;
                if (nextLvlIdx >= state.currentQuiz.levels.length) return state;

                const nextLevelData = state.currentQuiz.levels[nextLvlIdx];
                
                const currentAtk = state.stats.attack;
                const weapon = state.recipes.find(r => r.type === 'weapon' && r.targetId === state.appearance.weaponId);
                const weaponAtk = weapon?.bonuses.attack || 0;
                // Scale HP slightly for next level
                const waveHP = Math.floor((5 * (BASE_DAMAGE_TO_BOSS + (currentAtk * 5) + weaponAtk)) * (0.8 + nextLvlIdx * 0.2));

                return {
                    currentLevelIndex: nextLvlIdx,
                    isLevelComplete: false,
                    currentQuestionIndex: 0,
                    bossName: `Floor ${nextLvlIdx + 1}: ${nextLevelData.topicName}`,
                    bossHP: waveHP,
                    maxBossHP: waveHP,
                    mapNodes: nextLevelData.questions.map((_: any, idx: number) => ({ id: idx, status: idx === 0 ? 'current' : 'upcoming' })),
                };
            }),

            handleAnswer: (answer) => set((state) => {
                if (state.isGameOver || state.isBossSlain || !state.currentQuiz || state.isLevelComplete) return state;

                const currentLevel = state.currentQuiz.levels[state.currentLevelIndex];
                const currentQuestion = currentLevel.questions[state.currentQuestionIndex];
                const activeDungeon = state.dungeons.find(d => d.id === state.activeDungeonId);
                const quizType = activeDungeon?.quizType || 'multiple-choice';

                let isCorrect = false;
                if (quizType === 'enumeration') {
                    isCorrect = String(answer).toLowerCase().trim() === currentQuestion.options[currentQuestion.correctIdx].toLowerCase().trim();
                } else {
                    isCorrect = answer === currentQuestion.correctIdx;
                }

                if (!isCorrect) {
                    state.logMistake({
                        question: currentQuestion.q,
                        userChoice: typeof answer === 'number' ? currentQuestion.options[answer] : String(answer),
                        correctChoice: currentQuestion.options[currentQuestion.correctIdx],
                        rationale: (currentQuestion as any).explanation
                    });
                }

                const equippedArmor = state.recipes.find(r => r.type === 'armor' && r.targetId === state.appearance.armorId);
                const equippedWeapon = state.recipes.find(r => r.type === 'weapon' && r.targetId === state.appearance.weaponId);

                const bonusAtk = (equippedWeapon?.bonuses.attack || 0) + (equippedArmor?.bonuses.attack || 0);
                const bonusDef = (equippedArmor?.bonuses.defense || 0) + (equippedWeapon?.bonuses.defense || 0);

                const nextCombo = isCorrect ? state.combo + 1 : 0;
                const comboMultiplier = 1 + (Math.floor(nextCombo / 3) * 0.1);

                let finalDamage = isCorrect ? Math.floor((BASE_DAMAGE_TO_BOSS + (state.stats.attack * 5) + bonusAtk) * comboMultiplier) : 0;
                const isLastQuestion = state.currentQuestionIndex === currentLevel.questions.length - 1;
                if (isLastQuestion && isCorrect) finalDamage = state.bossHP;

                const damageToPlayer = isCorrect ? 0 : Math.max(5, BASE_DAMAGE_TO_PLAYER - (state.stats.defense * 2) - bonusDef);

                const nextBossHP = Math.max(0, state.bossHP - finalDamage);
                const nextPlayerHP = Math.max(0, state.playerHP - damageToPlayer);
                const nextQuestionIndex = state.currentQuestionIndex + 1;

                let activeWaveIdx = state.currentWaveIndex;
                let activeBossName = state.bossName;
                let activeBossQuote = state.bossQuote;
                let activeHP = nextBossHP;
                let activeMaxHP = state.maxBossHP;

                if ((nextBossHP <= 0 || nextQuestionIndex === 5 || nextQuestionIndex === 10) && !isLastQuestion) {
                    activeWaveIdx = Math.min(activeWaveIdx + 1, WAVES.length - 1);
                    const nextEnemy = WAVES[activeWaveIdx];
                    activeBossName = (activeWaveIdx >= 3) ? nextEnemy.title : `Wave ${activeWaveIdx + 1}: ${nextEnemy.title}`;
                    activeBossQuote = nextEnemy.quote;
                    const newWaveHP = Math.floor((BASE_DAMAGE_TO_BOSS + (state.stats.attack * 5) + bonusAtk) * (3.5 + (activeWaveIdx * 0.5)));
                    activeHP = newWaveHP;
                    activeMaxHP = newWaveHP;
                }

                const updatedStats = {
                    questionsAttempted: state.sessionStats.questionsAttempted + 1,
                    questionsCorrect: isCorrect ? state.sessionStats.questionsCorrect + 1 : state.sessionStats.questionsCorrect,
                    totalDamageDealt: state.sessionStats.totalDamageDealt + finalDamage
                };

                const nextXP = state.currentXP + (isCorrect ? XP_PER_CORRECT_ANSWER : 0);
                const nextLevelStats = Math.floor(nextXP / 100) + 1;

                if (nextPlayerHP <= 0) {
                    return {
                        playerHP: 0, bossHP: 0, isGameOver: true, isBossSlain: false,
                        currentXP: nextXP, level: nextLevelStats,
                        sessionStats: updatedStats, sessionLoot: {},
                        runSummary: { reason: 'defeated', stats: updatedStats }
                    };
                }
                
                if (isLastQuestion) {
                    const isFinalLevel = state.currentLevelIndex === state.currentQuiz.levels.length - 1;
                    if (isFinalLevel) {
                        get().clearActiveDungeon();
                        const lootDrop: Partial<LootInventory> = {
                            hardened_plate: Math.floor(Math.random() * 3) + 1,
                            neural_link: Math.random() > 0.5 ? 1 : 0,
                            data_shard: Math.floor(Math.random() * 2),
                            power_core: Math.random() > 0.8 ? 1 : 0
                        };
                        return {
                            playerHP: nextPlayerHP, bossHP: 0, isGameOver: true, isBossSlain: true,
                            currentXP: nextXP + VICTORY_BONUS_XP, level: nextLevelStats,
                            sessionStats: updatedStats, sessionLoot: lootDrop,
                            runSummary: { reason: 'victory', stats: updatedStats },
                            isLevelComplete: true
                        };
                    } else {
                        return {
                            playerHP: nextPlayerHP, bossHP: 0, isLevelComplete: true,
                            currentQuestionIndex: state.currentQuestionIndex, // keep it at last
                            combo: nextCombo, maxCombo: Math.max(state.maxCombo, nextCombo),
                            ultimateCharge: isCorrect ? Math.min(100, state.ultimateCharge + (5 + nextCombo * 2)) : state.ultimateCharge,
                            currentXP: nextXP, level: nextLevelStats, sessionStats: updatedStats,
                            skillPoints: nextLevelStats > state.level ? state.skillPoints + 1 : state.skillPoints,
                            pendingLevelUp: nextLevelStats > state.level || state.pendingLevelUp,
                        };
                    }
                }

                return {
                    bossHP: activeHP, maxBossHP: activeMaxHP, bossName: activeBossName, bossQuote: activeBossQuote,
                    currentWaveIndex: activeWaveIdx, playerHP: nextPlayerHP, currentQuestionIndex: nextQuestionIndex,
                    combo: nextCombo, maxCombo: Math.max(state.maxCombo, nextCombo),
                    ultimateCharge: isCorrect ? Math.min(100, state.ultimateCharge + (5 + nextCombo * 2)) : state.ultimateCharge,
                    currentXP: nextXP, level: nextLevelStats, sessionStats: updatedStats,
                    skillPoints: nextLevelStats > state.level ? state.skillPoints + 1 : state.skillPoints,
                    pendingLevelUp: nextLevelStats > state.level || state.pendingLevelUp,
                    mapNodes: state.mapNodes.map((n, i) => i <= state.currentQuestionIndex ? { ...n, status: 'cleared' as const } : i === nextQuestionIndex ? { ...n, status: 'current' as const } : n)
                };
            }),

            useUltimate: () => set((state) => {
                if (state.ultimateCharge < 100 || state.isGameOver) return state;
                return {
                    bossHP: Math.max(0, state.bossHP - 100), ultimateCharge: 0,
                    sessionStats: { ...state.sessionStats, totalDamageDealt: state.sessionStats.totalDamageDealt + 100 }
                };
            }),

            endRun: (reason) => {
                if (reason === 'victory') get().clearActiveDungeon();
                set({ isGameOver: true, runSummary: { reason, stats: get().sessionStats } });
            },

            upgradeStat: (statType) => set((state) =>
                state.skillPoints > 0 ? { skillPoints: state.skillPoints - 1, stats: { ...state.stats, [statType]: state.stats[statType] + 1 } } : state
            ),

            closeLevelUp: () => set({ showLevelUp: false }),
            closeBriefing: () => set({ showBriefing: false }),

            collectRewards: () => {
                const loot = get().sessionLoot;
                if (loot) get().addLoot(loot);
                set({
                    playerHP: PLAYER_HEALTH_POOL, isGameOver: false, runSummary: null, currentQuiz: null,
                    activeDungeonId: null, mapNodes: [], currentWaveIndex: 0, wrongAnswers: [],
                    showResults: false, sessionLoot: null, isLevelComplete: false, currentLevelIndex: 0
                });
            },

            resetGame: () => set({
                playerHP: PLAYER_HEALTH_POOL, currentQuestionIndex: 0, combo: 0, ultimateCharge: 0,
                isGameOver: false, isBossSlain: false, pendingExtractedText: null, currentQuiz: null,
                mapNodes: [], currentWaveIndex: 0, dungeons: [], wrongAnswers: [], showResults: false,
                sessionLoot: null, isLevelComplete: false, currentLevelIndex: 0
            }),
        }),
        {
            name: 'review-quest-v2',
            partialize: (state) => ({
                playerName: state.playerName,
                appearance: state.appearance,
                currentXP: state.currentXP,
                level: state.level,
                stats: state.stats,
                skillPoints: state.skillPoints,
                selectedPet: state.selectedPet,
                hasSeenOnboarding: state.hasSeenOnboarding,
                dungeons: state.dungeons,
                inventory: state.inventory,
                recipes: state.recipes
            }),
        }
    )
);

if (typeof window !== 'undefined') { (window as any).gameStore = useGameStore; }
export { WAVES };