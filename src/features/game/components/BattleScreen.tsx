'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sword,
    Zap,
    Info,
    RotateCcw,
    Shield,
    AlertTriangle,
    Wand2,
    Target,
    Trophy,
    BookOpen,
    X,
    Map as MapIcon,
    CheckCircle2,
    Skull,
    Database,
    RefreshCcw,
    Terminal,
    Swords,
    ShieldCheck,
    Sparkles
} from 'lucide-react';
import { useGameStore } from '../store';

// 🛡️ ARCHITECTURE: Feature-First modular components
import { StudyBuddy } from './StudyBuddy';
import { GauntletProgress } from './GauntletProgress';
import { EnumerationInput } from './EnumerationInput';
import { PlayerSprite } from './PlayerSprite';
import { EnemySprite } from './EnemySprite';
import { IntelLog } from './IntelLog';
import { MissionDebrief } from './MissionDebrief';
import { MissionBriefing } from './MissionBriefing'; // NEW: Story component

/**
 * COMPONENT: BattleScreen
 * Role: Main tactical combat interface.
 * Logic: Coordinates real-time state from the store into visual combat sequences.
 * Features: Forge-Aware Stat Math, High-Priority Overlays, Canonical Logic.
 */
export const BattleScreen = () => {
    const {
        currentQuiz, playerHP, bossHP, maxBossHP, bossName, bossQuote, currentQuestionIndex,
        currentXP, stats, combo, ultimateCharge, dungeons, activeDungeonId,
        isBossSlain, isGameOver, wrongAnswers, showInGameMap, playerName,
        showResults, setShowResults, recipes, appearance, showBriefing, courseType,
        handleAnswer, useUltimate, toggleInGameMap, endRun, collectRewards, resetGame
    } = useGameStore();

    // --- 1. JUICE & UI STATES ---
    const [screenEffect, setScreenEffect] = useState<'hit' | 'damage' | 'none'>('none');
    const [xpPopup, setXpPopup] = useState<boolean>(false);
    const [damageNumber, setDamageNumber] = useState<{ val: number; id: number; isUlt?: boolean } | null>(null);
    const [showTelemetry, setShowTelemetry] = useState(false);

    // --- 2. BOSS PHASE LOGIC ---
    const bossHPPercentage = Math.max(0, (bossHP / maxBossHP) * 100);
    const isPhaseTwo = bossHPPercentage < 50;
    const isPhaseCritical = bossHPPercentage < 20;

    // --- 3. INTERACTION & ANIMATION LOCKS ---
    const [isAnimating, setIsAnimating] = useState(false);
    const [isConfirmingRetreat, setIsConfirmingRetreat] = useState(false);

    // --- 🛡️ ARCHITECTURE: DYNAMIC CONTEXT LOOKUPS ---
    const activeDungeon = dungeons.find(d => d.id === activeDungeonId);
    const challengeType = activeDungeon?.quizType || 'multiple-choice';
    const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

    // UI Progress Math
    const progress = currentQuiz ? ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100 : 0;

    // 🎯 FORGE BONUS CALCULATION: Reflecting Jay's crafted gear in live combat math
    const equippedBonuses = useMemo(() => {
        const armor = recipes.find(r => r.type === 'armor' && r.targetId === appearance.armorId);
        const weapon = recipes.find(r => r.type === 'weapon' && r.targetId === appearance.weaponId);
        return {
            atk: (armor?.bonuses.attack || 0) + (weapon?.bonuses.attack || 0),
            def: (armor?.bonuses.defense || 0) + (weapon?.bonuses.defense || 0)
        };
    }, [recipes, appearance]);

    // --- 3. JUICE LOGIC: VISUAL FEEDBACK ---
    useEffect(() => {
        // Trigger red screen flash when player takes damage
        if (playerHP > 0 && playerHP < 100 && screenEffect === 'none') {
            setScreenEffect('damage');
            const timer = setTimeout(() => setScreenEffect('none'), 400);
            return () => clearTimeout(timer);
        }
    }, [playerHP]);

    // --- 4. COMBAT SEQUENCING ---
    const onExecuteAttack = async (answer: number | string) => {
        if (isAnimating || !currentQuestion || isGameOver) return;

        setIsAnimating(true);

        let isCorrect = false;
        if (challengeType === 'enumeration') {
            isCorrect = String(answer).toLowerCase().trim() === currentQuestion.options[currentQuestion.correctIdx].toLowerCase().trim();
        } else {
            isCorrect = answer === currentQuestion.correctIdx;
        }

        if (isCorrect) {
            setXpPopup(true);
            setTimeout(() => setXpPopup(false), 1000);

            // DAMAGE MATH: Base (25) + Stats + Forge Bonuses * Combo Multiplier
            const nextCombo = combo + 1;
            const comboMultiplier = 1 + (Math.floor(nextCombo / 3) * 0.1);
            const baseAtk = 25 + (stats.attack * 5);
            const totalDmg = Math.floor((baseAtk + equippedBonuses.atk) * comboMultiplier);

            setDamageNumber({ val: totalDmg, id: Date.now() });
            setScreenEffect('hit');

            // Allow animation to play out before updating store
            await new Promise(res => setTimeout(res, 600));
        } else {
            setScreenEffect('damage');
            await new Promise(res => setTimeout(res, 400));
        }

        handleAnswer(answer);

        // Reset visual state after store update
        setTimeout(() => {
            setIsAnimating(false);
            setDamageNumber(null);
            setScreenEffect('none');
        }, 400);
    };

    const onActivateUltimate = async () => {
        if (ultimateCharge < 100 || isAnimating || isGameOver) return;

        setScreenEffect('hit');
        setDamageNumber({ val: 100, id: Date.now(), isUlt: true });
        setIsAnimating(true);

        await new Promise(res => setTimeout(res, 800));
        useUltimate();

        setTimeout(() => {
            setIsAnimating(false);
            setDamageNumber(null);
            setScreenEffect('none');
        }, 1000);
    };

    if (!currentQuestion || !currentQuiz) return null;

    const sectorNames = {
        it: "CYBER-PHYSICAL SECTOR",
        nursing: "BIOLOGICAL INTELLIGENCE WARD",
        engineering: "MECHANICAL CONSTRUCT DEPOT",
        law: "JUDICIAL LOGIC CORE",
        default: "NEURAL NETWORK PERIMETER"
    };

    return (
        <div className={`theme-${courseType} relative flex flex-col h-full space-y-8 animate-in fade-in duration-500 overflow-hidden ${screenEffect === 'damage' ? 'bg-red-900/10' : ''}`}>

            {/* Arena Ambient VFX */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 course-pattern opacity-20" />
                
                {/* Subject-Colored Ambient Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 course-bg opacity-5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 course-bg opacity-5 blur-[120px] rounded-full animate-pulse delay-1000" />

                {/* Phase Critical Glitch Overlay */}
                {isPhaseCritical && !isGameOver && (
                    <motion.div 
                        animate={{ opacity: [0.1, 0.3, 0.1], x: [-2, 2, -2] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500/5 mix-blend-overlay"
                    />
                )}
            </div>

            {/* --- LAYER: MISSION STATUS MAP OVERLAY (Z-90) --- */}
            <AnimatePresence>
                {showInGameMap && (
                    <div className="fixed inset-0 z-90 flex items-center justify-center p-4 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleInGameMap}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-5xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <GauntletProgress />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- LAYER: TERMINAL GAME OVER MODAL (Z-100) --- */}
            <AnimatePresence>
                {isGameOver && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-950/90 backdrop-blur-xl absolute inset-0"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative bg-slate-900 border-2 border-slate-800 p-10 rounded-5xl shadow-2xl flex flex-col items-center max-w-md w-full text-center"
                        >
                            <div className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center mb-6 shadow-2xl 
                                ${isBossSlain ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                                {isBossSlain
                                    ? <Trophy className="w-10 h-10 text-yellow-500 animate-bounce" />
                                    : <Skull className="w-10 h-10 text-red-500 animate-pulse" />
                                }
                            </div>

                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">
                                {isBossSlain ? 'Sector Secured' : 'Signal Lost'}
                            </h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
                                Operator {playerName} // Mission Result
                            </p>

                            <div className="grid grid-cols-2 gap-3 w-full mb-8">
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Earned</p>
                                    <p className="text-xl font-bold text-yellow-500">{currentXP}</p>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Corruptions</p>
                                    <p className={`text-xl font-bold ${wrongAnswers.length > 0 ? 'text-red-500' : 'text-green-500'}`}>{wrongAnswers.length}</p>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={() => setShowResults(true)}
                                    className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 cursor-pointer shadow-lg"
                                >
                                    Continue to Results
                                </button>

                                {wrongAnswers.length > 0 && (
                                    <button
                                        onClick={() => setShowTelemetry(true)}
                                        className="w-full py-4 bg-slate-800 text-slate-300 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-slate-700 hover:bg-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                                    >
                                        <Terminal className="w-4 h-4 text-green-500" /> Analyze Telemetry
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- LAYER: STORY BRIEFING OVERLAY (Z-150) --- */}
            <AnimatePresence>
                {showBriefing && <MissionBriefing />}
            </AnimatePresence>

            {/* --- 3. HUD: TACTICAL TELEMETRY --- */}
            <div className="relative z-20">
                <div className="grid grid-cols-3 items-center pb-8">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black uppercase course-text tracking-widest leading-none">
                            {sectorNames[courseType as keyof typeof sectorNames] || sectorNames.default}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isPhaseCritical ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                            <p className="text-[7px] font-bold text-slate-700 uppercase tracking-tighter">
                                {isPhaseCritical ? "CRITICAL INSTABILITY" : isPhaseTwo ? "REACTIVE PHASE ACTIVE" : "TELEMETRY STABLE"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={toggleInGameMap}
                            className={`group flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer 
                                ${showInGameMap ? 'bg-white text-black border-white shadow-lg' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                        >
                            <MapIcon className={`w-3 h-3 ${showInGameMap ? 'animate-pulse' : ''}`} />
                            {showInGameMap ? 'Viewing Intel' : 'Mission Status'}
                        </button>
                    </div>

                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Potential Reward</p>
                        <p className="text-sm font-black text-yellow-500 italic mt-1">{currentXP} XP</p>
                    </div>
                </div>

                {/* ENCOUNTER PROGRESS BAR */}
                <div className="relative pt-2">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full flex items-center gap-2 z-10 shadow-xl">
                        <Target className="w-2.5 h-2.5 course-text" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none">Encounter Progress</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                            className="h-full course-bg transition-all duration-1000 shadow-[0_0_10px_var(--course-primary)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* --- 4. THE RPG STAGE (BATTLE ARENA) --- */}
            <div className={`relative z-10 flex items-center justify-between gap-4 px-2 sm:px-12 py-12 bg-slate-950/20 border-y border-slate-800/30 rounded-4xl min-h-60 shadow-inner transition-colors duration-1000 ${isPhaseCritical ? 'border-red-500/20 bg-red-950/5' : ''}`}>

                {/* PLAYER UNIT SIDE */}
                <div className="flex flex-col items-center gap-6 flex-1 max-w-50">
                    <div className="relative flex items-center justify-center">
                        {/* Companion drone / Study Buddy */}
                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 scale-75 opacity-70 z-10 hidden sm:block">
                            <StudyBuddy />
                        </div>

                        {/* High-Fidelity Customized Operator */}
                        <PlayerSprite
                            isAttacking={isAnimating && damageNumber !== null}
                            isHit={screenEffect === 'damage'}
                        />
                    </div>

                    {/* PLAYER STABILITY BARS */}
                    <div className="w-full space-y-2">
                        <div className="flex justify-between items-baseline">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-green-500" />
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Stability</span>
                                {equippedBonuses.def > 0 && (
                                    <span className="text-[7px] text-green-400 font-black animate-pulse">+{equippedBonuses.def}</span>
                                )}
                            </div>
                            <span className={`text-[9px] font-bold ${playerHP < 30 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                                {playerHP}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                            <div
                                className="h-full bg-green-500 transition-all duration-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                                style={{ width: `${playerHP}%` }}
                            />
                        </div>
                        {/* Ultimate Meter */}
                        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-700 ${ultimateCharge === 100 ? 'bg-yellow-400 shadow-[0_0_15px_#eab308] animate-pulse' : 'course-bg opacity-20'}`}
                                style={{ width: `${ultimateCharge}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* CENTRAL VS DIVIDER & DYNAMIC DAMAGE NUMBERS */}
                <div className="flex flex-col items-center justify-center gap-3 relative h-32 px-4 shrink-0">
                    <span className="text-2xl font-black italic text-slate-800 select-none animate-pulse uppercase tracking-tighter">vs</span>
                    <div className="w-px h-full bg-linear-to-b from-transparent via-slate-800/50 to-transparent" />

                    {/* DAMAGE FEEDBACK LAYER */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        <AnimatePresence>
                            {damageNumber && (
                                <motion.div
                                    key={damageNumber.id}
                                    initial={{ y: 20, opacity: 0, scale: 0.5 }}
                                    animate={{ y: -60, opacity: 1, scale: 1.2 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className={`text-6xl font-black italic drop-shadow-[0_0_30px_rgba(0,0,0,1)] ${damageNumber.isUlt ? 'text-yellow-400' : 'text-white'}`}>
                                        -{damageNumber.val}
                                    </span>
                                    {!damageNumber.isUlt && equippedBonuses.atk > 0 && (
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-1 shadow-2xl">
                                            <Sparkles className="w-2 h-2" /> Forge Boost Active
                                        </span>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ENEMY UNIT SIDE */}
                <div className="flex flex-col items-center gap-6 flex-1 max-w-50">
                    <EnemySprite
                        isHit={isAnimating && damageNumber !== null}
                        isAttacking={screenEffect === 'damage'}
                    />
                    <div className="w-full space-y-2 text-right">
                        <div className="flex justify-between items-baseline flex-row-reverse">
                            <span className={`text-[8px] font-black uppercase tracking-widest leading-none truncate max-w-[80%] ${isPhaseCritical ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                                {bossName}
                            </span>
                            <span className={`text-[9px] font-bold ${bossHP === 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                {Math.ceil(bossHPPercentage)}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                            <div
                                className={`h-full ml-auto transition-all duration-500 ${isPhaseCritical ? 'bg-red-600 animate-pulse' : 'bg-red-500'}`}
                                style={{ width: `${bossHPPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 5. ENCOUNTER CARD: INTEL CONTENT --- */}
            <div className="flex-1 flex flex-col justify-center py-2 relative z-10 min-h-32">
                <div className={`relative bg-slate-900/40 border border-slate-800/60 p-8 rounded-4xl shadow-2xl backdrop-blur-xs transition-all duration-1000 ${isPhaseCritical ? 'border-red-500/30' : ''}`}>
                    <p className="text-xl font-bold tracking-tight text-slate-100 leading-snug text-center">
                        {currentQuestion.q}
                    </p>

                    {/* XP NOTIFICATION POPUP */}
                    <AnimatePresence>
                        {xpPopup && (
                            <motion.div
                                initial={{ y: 0, opacity: 0 }}
                                animate={{ y: -10, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-4 right-8 bg-yellow-500 px-3 py-1 rounded-full shadow-lg z-20"
                            >
                                <span className="text-[10px] font-black text-black uppercase tracking-tighter">+20 XP SECURED</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 text-center opacity-30 italic text-[10px] text-slate-400">
                        "{bossQuote}"
                    </div>
                </div>
            </div>

            {/* --- 6. RESPONSE HUB: TACTICAL INPUTS --- */}
            <div className="relative z-10">
                {challengeType === 'enumeration' ? (
                    <EnumerationInput
                        disabled={isAnimating || isGameOver}
                        onExecute={(val) => onExecuteAttack(val)}
                    />
                ) : (
                    <div className={`grid gap-3 ${challengeType === 'true-false' ? 'grid-cols-2 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {currentQuestion.options.map((option, idx) => {
                            if (!option || option.trim() === '') return null;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => onExecuteAttack(idx)}
                                    disabled={isAnimating || isGameOver}
                                    className={`p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] cursor-pointer 
                                    ${challengeType === 'true-false' ? 'text-center font-black text-base py-8' : 'text-sm font-medium'}
                                    bg-slate-900/50 border-slate-800/50 text-slate-400 hover:border-blue-500 hover:bg-blue-600/10 hover:text-white 
                                    disabled:opacity-50 disabled:cursor-not-allowed shadow-xl group`}
                                >
                                    <span className="inline-block w-5 text-[10px] font-black text-slate-600 group-hover:course-text uppercase mr-2 transition-colors">
                                        {challengeType === 'true-false' ? (idx === 0 ? 'T' : 'F') : `0${idx + 1}`}
                                    </span>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- 7. FOOTER ACTION BAR --- */}
            <div className="pt-6 flex items-center justify-between border-t border-slate-800/50 relative z-10">
                {/* Retreat Control */}
                <button
                    onClick={() => setIsConfirmingRetreat(true)}
                    className="p-3 text-slate-700 hover:text-red-500 transition-all hover:bg-red-500/5 rounded-xl cursor-pointer"
                    title="Abort Mission"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                    {/* Visual Power Matrix */}
                    <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-slate-900/80 border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-2">
                            <Swords className="w-3.5 h-3.5 text-red-500/80" />
                            <span className="text-[10px] font-black text-white tracking-widest">{stats.attack + equippedBonuses.atk}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500/80" />
                            <span className="text-[10px] font-black text-white tracking-widest">{stats.defense + equippedBonuses.def}</span>
                        </div>
                    </div>

                    {/* Streak Indicator */}
                    {combo > 1 && !isGameOver && (
                        <motion.div
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                            className="px-4 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                        >
                            {combo}X STREAK
                        </motion.div>
                    )}

                    {/* Ultimate Ability Control */}
                    {ultimateCharge === 100 && !isGameOver && (
                        <button
                            onClick={onActivateUltimate}
                            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl transition-all shadow-[0_0_25px_rgba(234,179,8,0.5)] active:scale-95 font-black text-[10px] uppercase italic flex items-center gap-2 cursor-pointer border-b-4 border-yellow-700 hover:border-yellow-600"
                        >
                            <Wand2 className="w-4 h-4 animate-pulse" /> ACTIVATE NUKE
                        </button>
                    )}
                </div>
            </div>

            {/* --- ABANDON CONFIRMATION OVERLAY (Z-110) --- */}
            <AnimatePresence>
                {isConfirmingRetreat && (
                    <div className="fixed inset-0 z-110 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-slate-900 border border-slate-700 p-8 rounded-4xl shadow-2xl max-w-xs w-full text-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-white font-black uppercase italic text-xl tracking-tighter leading-none">Abort Mission?</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Unsaved progress will be lost to the void.</p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => { endRun('abandoned'); setIsConfirmingRetreat(false); }}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] rounded-2xl cursor-pointer shadow-lg transition-all active:scale-95"
                                >
                                    Confirm & Terminate
                                </button>
                                <button
                                    onClick={() => setIsConfirmingRetreat(false)}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black uppercase text-[10px] rounded-2xl cursor-pointer transition-all"
                                >
                                    Return to Combat
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SECONDARY MODAL REGISTRY */}
            <AnimatePresence>
                {showTelemetry && <IntelLog onClose={() => setShowTelemetry(false)} />}
            </AnimatePresence>

            <AnimatePresence>
                {showResults && <MissionDebrief />}
            </AnimatePresence>
        </div>
    );
};