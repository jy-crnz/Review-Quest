'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Swords, Shield, ChevronRight, Loader2,
    Sparkles, AlertCircle, ArrowLeft, Layers, Trophy, CheckCircle2, Bookmark, RotateCcw, Zap
} from 'lucide-react';
import { useGameStore } from '../store';

/**
 * COMPONENT: StageStudyScreen
 * Role: The pre-combat study station. Displays the exact section concepts and descriptions
 *       extracted from the reviewer before synthesizing questions just-in-time.
 */
export const StageStudyScreen = () => {
    const {
        currentSyllabus,
        currentStageIndex,
        activeQuizType,
        stageQuestionsCache,
        startStageCombat,
        cancelStageStudy,
        setStageIndex
    } = useGameStore();

    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!currentSyllabus || !currentSyllabus.stages[currentStageIndex]) {
        return null;
    }

    const currentStage = currentSyllabus.stages[currentStageIndex];
    const totalStages = currentSyllabus.stages.length;

    const hasCachedQuestions = Boolean(stageQuestionsCache?.[currentStageIndex]?.length);

    const handleInitiateStage = async (forceFresh = false) => {
        // ⚡ INSTANT CACHE HIT: If questions were already synthesized for this stage, reuse them immediately!
        const cachedQuestions = stageQuestionsCache?.[currentStageIndex];
        if (!forceFresh && cachedQuestions && cachedQuestions.length > 0) {
            startStageCombat(cachedQuestions);
            return;
        }

        setIsLoadingQuestions(true);
        setErrorMsg(null);

        try {
            const response = await fetch('/api/generate-stage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stage: currentStage,
                    quizType: activeQuizType
                })
            });

            const data = await response.json();
            if (!response.ok) {
                const message = data.error?.message || data.error || 'Failed to synthesize questions for this stage.';
                throw new Error(message);
            }

            // 🎯 JIT Questions Ready -> Begin Stage Combat!
            startStageCombat(data.questions);
        } catch (err: any) {
            console.error("Stage Generation Failed:", err);
            setErrorMsg(err.message || "Failed to initialize battle questions.");
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 text-left">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 border border-slate-800/80 p-4 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={cancelStageStudy}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                        title="Return to Base"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">
                            Sector Study Chamber
                        </span>
                        <h2 className="text-base font-black italic text-white uppercase tracking-tight line-clamp-1">
                            {currentSyllabus.title}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider">
                            Stage {currentStageIndex + 1} of {totalStages}
                        </span>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                            {currentStage.items.length} Concepts
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stage Switcher */}
            {totalStages > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl backdrop-blur-md">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-2 shrink-0">
                        Stages:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {currentSyllabus.stages.map((stg, idx) => (
                            <button
                                key={idx}
                                onClick={() => setStageIndex(idx)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                    idx === currentStageIndex
                                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/50'
                                        : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/60'
                                }`}
                            >
                                <span>Stage {idx + 1}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stage Title Banner */}
            <div className="bg-linear-to-r from-blue-950/40 via-slate-900/60 to-slate-950/40 border border-blue-500/20 p-6 sm:p-8 rounded-4xl relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
                        Target Curriculum Phase
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black italic text-white uppercase tracking-tight mb-2">
                    {currentStage.title}
                </h1>
                {currentStage.summary && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed max-w-2xl italic">
                        "{currentStage.summary}"
                    </p>
                )}
            </div>

            {/* Error Banner */}
            <AnimatePresence>
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-semibold"
                    >
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{errorMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Concept Table & Study Cards */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            Konsepto at Paglalarawan (Reviewer Items)
                        </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Study First, Battle Next
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                    {currentStage.items.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03, duration: 0.3 }}
                            className="bg-slate-950/70 hover:bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 p-4 sm:p-5 rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                        >
                            {/* Term Badge */}
                            <div className="sm:w-1/3 shrink-0 flex items-center gap-3">
                                <span className="w-6 h-6 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0">
                                    {idx + 1}
                                </span>
                                <span className="text-sm font-black text-white uppercase tracking-tight">
                                    {item.term}
                                </span>
                            </div>

                            {/* Description / Definition */}
                            <div className="sm:w-2/3 border-t sm:border-t-0 sm:border-l border-slate-800/60 pt-2 sm:pt-0 sm:pl-4">
                                <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Action Bar: Initiate JIT Combat */}
            <div className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/60">
                <div className="text-center sm:text-left space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Protocol: {activeQuizType.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                        {hasCachedQuestions
                            ? "Questions locked in memory. Instant battle deployment ready."
                            : "Questions will be synthesized strictly based on this stage's concepts."}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {hasCachedQuestions && (
                        <button
                            onClick={() => handleInitiateStage(true)}
                            disabled={isLoadingQuestions}
                            className="px-4 py-5 rounded-3xl font-black uppercase tracking-[0.15em] text-[10px] bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                            title="Synthesize fresh questions from AI"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                            <span>New Questions</span>
                        </button>
                    )}

                    <button
                        onClick={() => handleInitiateStage(false)}
                        disabled={isLoadingQuestions}
                        className={`w-full sm:w-auto px-8 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shrink-0 shadow-2xl active:scale-95 ${
                            isLoadingQuestions
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : hasCachedQuestions
                                ? 'bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-400/40'
                                : 'bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/40'
                        }`}
                    >
                        {isLoadingQuestions ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                <span>Synthesizing Stage {currentStageIndex + 1} Combat...</span>
                            </>
                        ) : hasCachedQuestions ? (
                            <>
                                <Zap className="w-4 h-4 text-emerald-300" />
                                <span>Retake Stage {currentStageIndex + 1} (Instant)</span>
                            </>
                        ) : (
                            <>
                                <Swords className="w-4 h-4" />
                                <span>Ready for Battle — Test Stage {currentStageIndex + 1}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
