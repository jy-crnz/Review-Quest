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
    Sparkles,
    ChevronRight,
    Lightbulb,
    Cat,
    Dog,
    Bird,
    Egg,
    HelpCircle
} from 'lucide-react';
import { useGameStore } from '../store';
import { isKindAnswerMatch } from '@/lib/answerMatcher';

// 🛡️ ARCHITECTURE: Feature-First modular components
import { StudyBuddy } from './StudyBuddy';
import { GauntletProgress } from './GauntletProgress';
import { EnumerationInput } from './EnumerationInput';
import { PlayerSprite } from './PlayerSprite';
import { EnemySprite } from './EnemySprite';
import { IntelLog } from './IntelLog';
import { MissionDebrief } from './MissionDebrief';
import { MissionBriefing } from './MissionBriefing';

export const BattleScreen = () => {
    const {
        currentQuiz, playerHP, bossHP, maxBossHP, bossName, bossQuote, currentQuestionIndex,
        currentXP, stats, combo, ultimateCharge, dungeons, activeDungeonId,
        isBossSlain, isGameOver, wrongAnswers, showInGameMap, playerName,
        showResults, setShowResults, recipes, appearance, showBriefing, courseType,
        handleAnswer, useUltimate, toggleInGameMap, endRun, collectRewards, resetGame,
        currentLevelIndex, isLevelComplete, nextLevel, repeatFloor, openBriefing,
        currentSyllabus, currentStageIndex, advanceToNextStage, repeatCurrentStage,
        selectedPet
    } = useGameStore();

    const [screenEffect, setScreenEffect] = useState<'hit' | 'damage' | 'none'>('none');
    const [xpPopup, setXpPopup] = useState<boolean>(false);
    const [damageNumber, setDamageNumber] = useState<{ val: number; id: number; isUlt?: boolean } | null>(null);
    const [showTelemetry, setShowTelemetry] = useState(false);

    const [showHint, setShowHint] = useState<boolean>(false);
    const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);

    const bossHPPercentage = Math.max(0, (bossHP / maxBossHP) * 100);
    const isPhaseTwo = bossHPPercentage < 50;
    const isPhaseCritical = bossHPPercentage < 20;

    const [isAnimating, setIsAnimating] = useState(false);
    const [isConfirmingRetreat, setIsConfirmingRetreat] = useState(false);
    const [answerFeedback, setAnswerFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

    const activeDungeon = dungeons.find(d => d.id === activeDungeonId);
    const challengeType = activeDungeon?.quizType || 'multiple-choice';
    const currentLevel = currentQuiz?.levels[currentLevelIndex];
    const currentQuestion = currentLevel?.questions[currentQuestionIndex];

    const progress = currentLevel ? ((currentQuestionIndex + 1) / currentLevel.questions.length) * 100 : 0;

    // Reset Hint and Lifelines on Question / Floor change
    useEffect(() => {
        setShowHint(false);
        setEliminatedOptions([]);
    }, [currentQuestionIndex, currentLevelIndex]);

    const PetIcon = useMemo(() => {
        switch (selectedPet) {
            case 'dog': return Dog;
            case 'bird': return Bird;
            case 'owl': return Egg;
            default: return Cat;
        }
    }, [selectedPet]);

    const playHintSound = () => {
        const soundMap: Record<string, string> = {
            cat: '/assets/audio/pet/purr.mp3',
            dog: '/assets/audio/pet/bark.mp3',
            bird: '/assets/audio/pet/chirp.mp3',
            owl: '/assets/audio/pet/owlchirp.mp3',
        };
        try {
            const soundFile = soundMap[selectedPet] || '/assets/audio/pet/chirp.mp3';
            const audio = new Audio(soundFile);
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch {
            // ignore audio restriction errors
        }
    };

    const handleToggleHint = () => {
        if (!showHint) {
            playHintSound();
        }
        setShowHint(prev => !prev);
    };

    const handleUse5050 = () => {
        if (!currentQuestion || challengeType !== 'multiple-choice') return;
        if (eliminatedOptions.length > 0) return;

        const wrongIndices = currentQuestion.options
            .map((opt, idx) => ({ opt, idx }))
            .filter(item => item.opt && item.opt.trim() !== '' && item.idx !== currentQuestion.correctIdx)
            .map(item => item.idx);

        const shuffled = [...wrongIndices].sort(() => 0.5 - Math.random());
        const toEliminate = shuffled.slice(0, 2);
        setEliminatedOptions(toEliminate);
    };

    const hintData = useMemo(() => {
        if (!currentQuestion) return null;

        const rawHint = (currentQuestion as any).hint?.trim();
        const correctAnswerText = currentQuestion.options[currentQuestion.correctIdx] || '';

        let letterClue = '';
        let wordCountClue = '';

        if (challengeType === 'enumeration') {
            const targetWords = correctAnswerText.split(/\s+/).filter(Boolean);
            const firstLetter = correctAnswerText.charAt(0).toUpperCase();
            letterClue = `Nagsisimula sa letrang: "${firstLetter}..."`;
            wordCountClue = `${targetWords.length} ${targetWords.length === 1 ? 'salita' : 'mga salita'} (${correctAnswerText.length} titik)`;
        }

        let clueText = rawHint;
        if (!clueText) {
            if (challengeType === 'true-false') {
                clueText = currentQuestion.explanation
                    ? `Pansinin: Suriin kung may mga salita o detalye sa pangungusap na sadyang binago o pinalitan kaugnay ng paksa.`
                    : `Suriing maigi ang buong pahayag bago magpasya kung ito ay totoo o gawa-gawa.`;
            } else if (challengeType === 'enumeration') {
                clueText = currentQuestion.explanation
                    ? `May kaugnayan ito sa: ${currentQuestion.explanation.replace(/^[Ii]to ang\s*/, '')}`
                    : `Tandaan ang mga terminolohiya, tao, o pangyayaring tinalakay sa seksyong ito.`;
            } else {
                clueText = currentQuestion.explanation
                    ? `Pahiwatig: Pag-isipan ang konteksto kaugnay ng: ${currentQuestion.explanation.replace(/^[Ii]to ang\s*/, '')}`
                    : `Basahing mabuti ang bawat opsyon at piliin ang pinakatumpak sa tinalakay sa aralin.`;
            }
        }

        return {
            clueText,
            letterClue,
            wordCountClue,
            targetAnswer: correctAnswerText
        };
    }, [currentQuestion, challengeType]);

    const equippedBonuses = useMemo(() => {
        const armor = recipes.find(r => r.type === 'armor' && r.targetId === appearance.armorId);
        const weapon = recipes.find(r => r.type === 'weapon' && r.targetId === appearance.weaponId);
        return {
            atk: (armor?.bonuses.attack || 0) + (weapon?.bonuses.attack || 0),
            def: (armor?.bonuses.defense || 0) + (weapon?.bonuses.defense || 0)
        };
    }, [recipes, appearance]);

    useEffect(() => {
        if (playerHP > 0 && playerHP < 100 && screenEffect === 'none') {
            setScreenEffect('damage');
            const timer = setTimeout(() => setScreenEffect('none'), 400);
            return () => clearTimeout(timer);
        }
    }, [playerHP]);

    const onExecuteAttack = async (answer: number | string) => {
        if (isAnimating || !currentQuestion || isGameOver || isLevelComplete) return;

        setIsAnimating(true);

        let isCorrect = false;
        const explanation = (currentQuestion as any).explanation || '';
        if (challengeType === 'enumeration') {
            const targetAnswer = currentQuestion.options[currentQuestion.correctIdx] || '';
            const accepted = currentQuestion.acceptedAnswers || [];
            isCorrect = isKindAnswerMatch(String(answer), targetAnswer, accepted, explanation);
        } else {
            isCorrect = answer === currentQuestion.correctIdx;
        }

        if (explanation) {
            setAnswerFeedback({ isCorrect, explanation });
        }

        if (isCorrect) {
            setXpPopup(true);
            setTimeout(() => setXpPopup(false), 1000);

            const nextCombo = combo + 1;
            const comboMultiplier = 1 + (Math.floor(nextCombo / 3) * 0.1);
            const baseAtk = 25 + (stats.attack * 5);
            const totalDmg = Math.floor((baseAtk + equippedBonuses.atk) * comboMultiplier);

            setDamageNumber({ val: totalDmg, id: Date.now() });
            setScreenEffect('hit');

            await new Promise(res => setTimeout(res, 800));
        } else {
            setScreenEffect('damage');
            await new Promise(res => setTimeout(res, 1800));
        }

        handleAnswer(answer);
        setAnswerFeedback(null);

        setTimeout(() => {
            setIsAnimating(false);
            setDamageNumber(null);
            setScreenEffect('none');
        }, 300);
    };

    const onActivateUltimate = async () => {
        if (ultimateCharge < 100 || isAnimating || isGameOver || isLevelComplete) return;

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

    if (!currentQuestion || !currentQuiz || !currentLevel) return null;

    const sectorNames = {
        it: "CYBER-PHYSICAL SECTOR",
        nursing: "BIOLOGICAL INTELLIGENCE WARD",
        engineering: "MECHANICAL CONSTRUCT DEPOT",
        law: "JUDICIAL LOGIC CORE",
        default: "NEURAL NETWORK PERIMETER"
    };

    return (
        <div className={`theme-${courseType} relative flex flex-col h-full space-y-8 animate-in fade-in duration-500 overflow-hidden ${screenEffect === 'damage' ? 'bg-red-900/10' : ''}`}>

            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 course-pattern opacity-20" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 course-bg opacity-5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 course-bg opacity-5 blur-[120px] rounded-full animate-pulse delay-1000" />
                {isPhaseCritical && !isGameOver && (
                    <motion.div 
                        animate={{ opacity: [0.1, 0.3, 0.1], x: [-2, 2, -2] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500/5 mix-blend-overlay"
                    />
                )}
            </div>

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

            <AnimatePresence>
                {isLevelComplete && !isGameOver && (
                    <div className="fixed inset-0 z-105 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-4xl shadow-2xl max-w-md w-full text-center space-y-6"
                        >
                            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase mb-2">
                                    {currentSyllabus ? `Stage ${currentStageIndex + 1} Cleared!` : "Sector Cleared!"}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {currentSyllabus && currentStageIndex < currentSyllabus.stages.length - 1
                                        ? `Next Up: ${currentSyllabus.stages[currentStageIndex + 1]?.title}`
                                        : "Curriculum Objectives Mastered"}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                {/* Proceed to Next Stage */}
                                <button
                                    onClick={currentSyllabus ? advanceToNextStage : nextLevel}
                                    className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest text-xs rounded-2xl cursor-pointer transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>
                                        {currentSyllabus && currentStageIndex < currentSyllabus.stages.length - 1
                                            ? `Proceed to Stage ${currentStageIndex + 2}`
                                            : currentSyllabus
                                            ? "Claim Campaign Victory"
                                            : `Initiate Floor ${currentLevelIndex + 2}`}
                                    </span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                {/* Retake / Repeat Current Stage */}
                                <button
                                    onClick={currentSyllabus ? repeatCurrentStage : repeatFloor}
                                    className="w-full py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-slate-700/80 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <RotateCcw className="w-4 h-4 text-amber-400" />
                                    <span>
                                        {currentSyllabus
                                            ? `Retake Stage ${currentStageIndex + 1}`
                                            : `Retake Floor ${currentLevelIndex + 1}`}
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                {isBossSlain ? 'Dungeon Secured' : 'Signal Lost'}
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

            <AnimatePresence>
                {showBriefing && <MissionBriefing />}
            </AnimatePresence>

            <div className="relative z-20">
                <div className="grid grid-cols-3 items-center pb-8">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black uppercase course-text tracking-widest leading-none">
                            {currentLevel.topicName || sectorNames[courseType as keyof typeof sectorNames] || sectorNames.default}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isPhaseCritical ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                            <p className="text-[7px] font-bold text-slate-700 uppercase tracking-tighter">
                                {isPhaseCritical ? "CRITICAL INSTABILITY" : isPhaseTwo ? "REACTIVE PHASE ACTIVE" : "TELEMETRY STABLE"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={toggleInGameMap}
                            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer 
                                ${showInGameMap ? 'bg-white text-black border-white shadow-lg' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                        >
                            <MapIcon className={`w-3 h-3 ${showInGameMap ? 'animate-pulse' : ''}`} />
                            {showInGameMap ? 'Viewing Map' : 'Map'}
                        </button>
                        <button
                            onClick={openBriefing}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-black text-[9px] uppercase tracking-widest bg-blue-950/40 text-blue-300 border-blue-800/60 hover:bg-blue-900/50 hover:border-blue-500 transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                            <BookOpen className="w-3 h-3 text-blue-400" />
                            Study Notes
                        </button>
                        <button
                            onClick={handleToggleHint}
                            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-sm
                                ${showHint 
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]' 
                                    : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50 hover:border-amber-500'}`}
                        >
                            <Lightbulb className={`w-3 h-3 ${showHint ? 'animate-bounce text-slate-950 fill-current' : 'text-amber-400'}`} />
                            {showHint ? 'Hide Hint' : 'Hint'}
                        </button>
                    </div>

                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Potential Reward</p>
                        <p className="text-sm font-black text-yellow-500 italic mt-1">{currentXP} XP</p>
                    </div>
                </div>

                <div className="relative pt-2">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full flex items-center gap-2 z-10 shadow-xl">
                        <Target className="w-2.5 h-2.5 course-text" />
                        <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest leading-none">
                            {currentSyllabus
                                ? `Stage ${currentStageIndex + 1}/${currentSyllabus.stages.length} • Q${currentQuestionIndex + 1}/${currentLevel.questions.length}`
                                : `Floor ${currentLevelIndex + 1}/${currentQuiz.levels.length} • Q${currentQuestionIndex + 1}/${currentLevel.questions.length}`}
                        </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                            className="h-full course-bg transition-all duration-1000 shadow-[0_0_10px_var(--course-primary)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={`relative z-10 flex items-center justify-between gap-4 px-2 sm:px-12 py-12 bg-slate-950/20 border-y border-slate-800/30 rounded-4xl min-h-60 shadow-inner transition-colors duration-1000 ${isPhaseCritical ? 'border-red-500/20 bg-red-950/5' : ''}`}>

                <div className="flex flex-col items-center gap-6 flex-1 max-w-50">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 scale-75 opacity-70 z-10 hidden sm:block">
                            <StudyBuddy />
                        </div>
                        <PlayerSprite
                            isAttacking={isAnimating && damageNumber !== null}
                            isHit={screenEffect === 'damage'}
                        />
                    </div>

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
                        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-700 ${ultimateCharge === 100 ? 'bg-yellow-400 shadow-[0_0_15px_#eab308] animate-pulse' : 'course-bg opacity-20'}`}
                                style={{ width: `${ultimateCharge}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 relative h-32 px-4 shrink-0">
                    <span className="text-2xl font-black italic text-slate-800 select-none animate-pulse uppercase tracking-tighter">vs</span>
                    <div className="w-px h-full bg-linear-to-b from-transparent via-slate-800/50 to-transparent" />

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

            <div className="flex-1 flex flex-col justify-center py-2 relative z-10 min-h-32">
                <div className={`relative bg-slate-900/40 border border-slate-800/60 p-8 rounded-4xl shadow-2xl backdrop-blur-xs transition-all duration-1000 ${isPhaseCritical ? 'border-red-500/30' : ''}`}>
                    <p className="text-xl font-bold tracking-tight text-slate-100 leading-snug text-center">
                        {currentQuestion.q}
                    </p>

                    {/* Hint Button Prompt (when hint is not open) */}
                    {!showHint && !answerFeedback && (
                        <div className="mt-4 flex justify-center">
                            <button
                                type="button"
                                onClick={handleToggleHint}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm group"
                            >
                                <Lightbulb className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                                <span>Clueless? Tap for a Hint</span>
                            </button>
                        </div>
                    )}

                    {/* Interactive Animated Hint Card */}
                    <AnimatePresence>
                        {showHint && !answerFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                className="mt-5 p-4 sm:p-5 rounded-3xl bg-linear-to-r from-amber-950/70 via-slate-900/90 to-amber-950/70 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] text-left backdrop-blur-md relative"
                            >
                                <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/20">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                                            <PetIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3 text-amber-400" />
                                                Study Buddy's Clue
                                            </p>
                                            <p className="text-[8px] font-bold uppercase tracking-wider text-amber-400/60">
                                                {selectedPet.toUpperCase()} COMPANION WHISPER
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowHint(false)}
                                        className="p-1 rounded-lg text-amber-400/70 hover:text-amber-200 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                        title="Dismiss Hint"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="pt-3 space-y-3">
                                    <p className="text-xs font-semibold leading-relaxed text-amber-100 flex items-start gap-2.5">
                                        <span className="text-amber-400 font-black text-sm select-none shrink-0">💡</span>
                                        <span>{hintData?.clueText}</span>
                                    </p>

                                    {challengeType === 'enumeration' && hintData && (
                                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-bold">
                                            {hintData.letterClue && (
                                                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300">
                                                    {hintData.letterClue}
                                                </span>
                                            )}
                                            {hintData.wordCountClue && (
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                                                    {hintData.wordCountClue}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {challengeType === 'multiple-choice' && (
                                        <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={handleUse5050}
                                                disabled={eliminatedOptions.length > 0}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                                    eliminatedOptions.length > 0
                                                        ? 'bg-amber-950/40 border border-amber-800/40 text-amber-400/50 cursor-not-allowed'
                                                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                                }`}
                                            >
                                                <Zap className="w-3 h-3 fill-current" />
                                                {eliminatedOptions.length > 0 ? '✓ 2 Wrong Choices Eliminated' : '50/50 Lifeline (Eliminate 2)'}
                                            </button>
                                            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">
                                                Tactical Lifeline
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {answerFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                className={`mt-4 p-4 rounded-2xl border text-center transition-all ${
                                    answerFeedback.isCorrect
                                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                        : 'bg-red-950/90 border-red-500/60 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                                }`}
                            >
                                <div className="text-[11px] font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                                    {answerFeedback.isCorrect ? '✓ Wasto! Critical Strike' : '❌ Mali! System Damage Taken'}
                                </div>
                                <p className="text-xs font-semibold leading-relaxed text-slate-100">
                                    {answerFeedback.explanation}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

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

            <div className="relative z-10">
                {challengeType === 'enumeration' ? (
                    <EnumerationInput
                        disabled={isAnimating || isGameOver || isLevelComplete}
                        onExecute={(val) => onExecuteAttack(val)}
                    />
                ) : (
                    <div className={`grid gap-3 ${challengeType === 'true-false' ? 'grid-cols-2 max-w-sm mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {currentQuestion.options.map((option, idx) => {
                            if (!option || option.trim() === '') return null;
                            const isEliminated = challengeType === 'multiple-choice' && eliminatedOptions.includes(idx);

                            if (isEliminated) {
                                return (
                                    <button
                                        key={idx}
                                        disabled={true}
                                        className="p-5 rounded-2xl border text-left opacity-25 line-through grayscale border-red-950/40 bg-slate-950/60 text-slate-600 cursor-not-allowed shadow-none relative overflow-hidden transition-all"
                                    >
                                        <span className="inline-block w-5 text-[10px] font-black text-slate-700 uppercase mr-2">
                                            0{idx + 1}
                                        </span>
                                        {option}
                                        <span className="ml-2 text-[9px] font-black text-red-500 uppercase tracking-widest no-underline">
                                            [ELIMINATED]
                                        </span>
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => onExecuteAttack(idx)}
                                    disabled={isAnimating || isGameOver || isLevelComplete}
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

            <div className="pt-6 flex items-center justify-between border-t border-slate-800/50 relative z-10">
                <button
                    onClick={() => setIsConfirmingRetreat(true)}
                    className="p-3 text-slate-700 hover:text-red-500 transition-all hover:bg-red-500/5 rounded-xl cursor-pointer"
                    title="Abort Mission"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
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

                    {combo > 1 && !isGameOver && (
                        <motion.div
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                            className="px-4 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                        >
                            {combo}X STREAK
                        </motion.div>
                    )}

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

            <AnimatePresence>
                {showTelemetry && <IntelLog onClose={() => setShowTelemetry(false)} />}
            </AnimatePresence>

            <AnimatePresence>
                {showResults && <MissionDebrief />}
            </AnimatePresence>
        </div>
    );
};
