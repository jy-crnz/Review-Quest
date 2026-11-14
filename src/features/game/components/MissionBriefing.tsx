'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Terminal, Play, Cpu, Globe, Database,
    BookOpen, Layers, CheckCircle2, ChevronRight, X, AlertTriangle, Sparkles
} from 'lucide-react';
import { useGameStore } from '../store';

/**
 * COMPONENT: MissionBriefing (Tactical Intel Dossier & Study Guide)
 * Role: Provides a comprehensive study guide of all extracted topics and key concepts
 *       before entering the Active Recall Gauntlet battle.
 */
export const MissionBriefing = () => {
    const { currentQuiz, closeBriefing, showBriefing, courseType, currentLevelIndex, currentQuestionIndex } = useGameStore();
    const [selectedTopicIdx, setSelectedTopicIdx] = useState<number>(currentLevelIndex || 0);

    if (!currentQuiz || !showBriefing) return null;

    const totalQuestions = currentQuiz.levels.reduce((acc, lvl) => acc + lvl.questions.length, 0);
    const activeLevel = currentQuiz.levels[selectedTopicIdx] || currentQuiz.levels[0];
    const isMidBattle = currentQuestionIndex > 0 || currentLevelIndex > 0;

    return (
        <div className="fixed -inset-[2vh] left-[-2vw] w-[104vw] h-[104dvh] z-999 flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-2xl">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] bg-size-[40px_40px] scale-115 pointer-events-none" />

            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                className="relative bg-slate-900/95 border-2 border-blue-500/30 rounded-4xl sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-left"
            >
                {/* Header Scanner Sweep */}
                <motion.div
                    animate={{ y: [0, 600, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-px bg-blue-500/30 z-0 pointer-events-none"
                />

                {/* --- TOP BAR --- */}
                <div className="relative z-10 px-6 sm:px-8 pt-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            <BookOpen className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">
                                Tactical Intel & Study Guide
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black italic text-white uppercase tracking-tight line-clamp-1">
                                {currentQuiz.title}
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={closeBriefing}
                        className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Close Briefing"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* --- DOSSIER STATS STRIP --- */}
                <div className="relative z-10 px-6 sm:px-8 py-3 bg-slate-950/60 border-b border-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>Sectors: <strong className="text-white">{currentQuiz.levels.length} Floors</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Question Pool: <strong className="text-white">{totalQuestions} Challenges</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Protocol: <strong className="text-emerald-300">100% Active Recall Mastery</strong></span>
                    </div>
                </div>

                {/* --- MAIN CONTENT BODY (SCROLLABLE) --- */}
                <div className="relative z-10 p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                    {/* Executive Summary */}
                    {currentQuiz.summary && (
                        <div className="bg-slate-950/50 border border-blue-500/20 p-5 rounded-3xl relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-2">
                                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                    Executive Learning Brief
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-300 leading-relaxed italic">
                                "{currentQuiz.summary}"
                            </p>
                        </div>
                    )}

                    {/* TOPIC SELECTION & CONCEPT BREAKDOWN */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3 text-blue-400" />
                                Material Breakdown & Learning Syllabus
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                Floor {selectedTopicIdx + 1} of {currentQuiz.levels.length}
                            </span>
                        </div>

                        {/* Floor Navigation Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {currentQuiz.levels.map((level, idx) => (
                                <button
                                    key={level.id || idx}
                                    onClick={() => setSelectedTopicIdx(idx)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer border ${
                                        selectedTopicIdx === idx
                                            ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                >
                                    Floor {idx + 1}: {level.topicName}
                                </button>
                            ))}
                        </div>

                        {/* Selected Topic Detail Card */}
                        {activeLevel && (
                            <motion.div
                                key={activeLevel.id || selectedTopicIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-slate-950/70 border border-slate-800 p-6 rounded-3xl space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                                    <div>
                                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                                            Sector Objective
                                        </span>
                                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight">
                                            {activeLevel.topicName}
                                        </h3>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-widest rounded-lg w-fit">
                                        {activeLevel.questions.length} Question Nodes
                                    </span>
                                </div>

                                {activeLevel.summary && (
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        {activeLevel.summary}
                                    </p>
                                )}

                                {/* Key Concepts / Bullet Points to Learn */}
                                {activeLevel.keyConcepts && activeLevel.keyConcepts.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-yellow-300">
                                                Essential Concepts to Master
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {activeLevel.keyConcepts.map((concept, cIdx) => (
                                                <div
                                                    key={cIdx}
                                                    className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl"
                                                >
                                                    <span className="w-5 h-5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 text-[10px] font-black">
                                                        {cIdx + 1}
                                                    </span>
                                                    <p className="text-xs text-slate-200 leading-snug font-medium">
                                                        {concept}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* GAUNTLET RULES CALLOUT */}
                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest">
                                Active Recall Gauntlet Protocol
                            </span>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                Combat will continue until <strong>all questions</strong> in the material are mastered. Any question missed will automatically re-queue at the end of the floor until answered correctly. Emergency Shield Reboot activates if system stability drops to 0.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER ACTION BUTTON --- */}
                <div className="relative z-10 p-6 sm:p-8 border-t border-slate-800/80 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden sm:flex items-center gap-2">
                        <Globe className="w-3 h-3 text-blue-500" />
                        Knowledge Grid Ready // Zero Early Termination
                    </p>

                    <button
                        onClick={closeBriefing}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 cursor-pointer shrink-0"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        {isMidBattle ? "Resume Gauntlet Battle" : "Initiate Incursion"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};