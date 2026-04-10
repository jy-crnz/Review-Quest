'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Target,
    Zap,
    TrendingUp,
    ChevronRight,
    Award,
    ShieldCheck,
    Cpu,
    Activity,
    Package,
    Shield,
    Database,
    Binary
} from 'lucide-react';
import { useGameStore } from '../store';

/**
 * COMPONENT: MissionDebrief
 * Role: Tactical RPG summary screen displayed after combat.
 * Features: XP Ascension, Combat Stats, and NEW Salvaged Hardware (Loot) display.
 */
export const MissionDebrief = () => {
    const {
        sessionStats,
        currentXP,
        level,
        playerName,
        sessionLoot,
        collectRewards,
        setShowResults,
        isBossSlain,
        currentQuiz // NEW: Accessing the quiz for narrative text
    } = useGameStore();

    // 🛡️ ARCHITECTURE: Progress Logic
    const levelProgress = currentXP % 100;
    const accuracy = sessionStats.questionsAttempted > 0
        ? Math.round((sessionStats.questionsCorrect / sessionStats.questionsAttempted) * 100)
        : 0;

    // Narrative Logic: Fallback to schema defaults if AI missed fields
    const aarText = isBossSlain 
        ? "Sector secured. Intelligence successfully integrated."
        : "Mission failed. Tactical retreat necessary.";

    const handleFinish = () => {
        setShowResults(false);
        collectRewards(); // Persists sessionLoot to permanent inventory and resets active run
    };

    return (
        <div className="fixed inset-0 z-200 bg-slate-950 flex items-center justify-center p-4 sm:p-8 overflow-hidden">

            {/* 🌌 BACKGROUND AESTHETIC */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] bg-size-[32px_32px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-4xl bg-slate-900/50 border border-white/10 backdrop-blur-3xl rounded-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
                {/* 🎖️ LEFT RAIL: Visual Rank & Ascension */}
                <div className="w-full md:w-1/3 bg-linear-to-b from-blue-600/10 to-transparent p-10 border-r border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-8">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-blue-500 blur-3xl rounded-full"
                        />

                        <div className="relative w-36 h-36 rounded-4xl bg-slate-900 border-2 border-blue-500/50 flex items-center justify-center shadow-2xl">
                            <Trophy className={`w-16 h-16 ${isBossSlain ? 'text-yellow-400' : 'text-slate-600'}`} />
                        </div>

                        <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-blue-600 border-4 border-slate-900 flex flex-col items-center justify-center shadow-xl">
                            <span className="text-[8px] font-black text-blue-200 leading-none uppercase">Lvl</span>
                            <span className="text-xl font-black text-white leading-none">{level}</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-1">Rank Status</h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-10">Operator {playerName}</p>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-blue-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Sync</span>
                            </div>
                            <span className="text-xs font-black text-white">{levelProgress}%</span>
                        </div>

                        <div className="h-4 w-full bg-slate-950 rounded-full border border-white/5 overflow-hidden p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress}%` }}
                                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                className="h-full bg-linear-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                            />
                        </div>

                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                            {100 - levelProgress} XP to Milestone
                        </p>
                    </div>
                </div>

                {/* 📊 RIGHT RAIL: Combat Intelligence */}
                <div className="flex-1 p-10 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Cpu className="w-3 h-3 text-blue-500" />
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em]">Analysis Complete</span>
                            </div>
                            <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Mission Results</h2>
                        </div>

                        <div className={`px-5 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest flex items-center gap-2
                            ${isBossSlain
                                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                                : 'bg-red-500/10 border-red-500/30 text-red-500'}
                        `}>
                            <Activity className="w-3 h-3" />
                            {isBossSlain ? 'Secured' : 'Partial Sync'}
                        </div>
                    </div>

                    {/* 📝 STORY DEBRIEF: Procedural After-Action Report */}
                    <div className="mb-8 p-6 bg-slate-950/40 border border-white/5 rounded-4xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors" />
                        <div className="flex items-center gap-2 mb-3">
                            <Binary className="w-3 h-3 text-blue-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">After-Action Report</span>
                        </div>
                        <p className="text-sm font-bold text-slate-200 leading-relaxed italic">
                            "{aarText}"
                        </p>
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-5 rounded-4xl bg-slate-950/40 border border-white/5 group">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <Target className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Accuracy</span>
                            </div>
                            <p className="text-2xl font-black text-white tracking-tighter">{accuracy}%</p>
                        </div>

                        <div className="p-5 rounded-4xl bg-slate-950/40 border border-white/5 group">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <Zap className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Energy</span>
                            </div>
                            <p className="text-2xl font-black text-white tracking-tighter">{sessionStats.totalDamageDealt}</p>
                        </div>
                    </div>

                    {/* 💎 RECOVERED HARDWARE (The Loot Display) */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <Package className="w-3 h-3 text-slate-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Salvaged Hardware</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {sessionLoot && Object.entries(sessionLoot).map(([type, count]) => {
                                if (!count || count <= 0) return null;
                                return (
                                    <motion.div
                                        key={type}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1 group hover:border-blue-500/30 transition-all"
                                    >
                                        <div className="text-blue-400 group-hover:scale-110 transition-transform">
                                            {type === 'hardened_plate' && <Shield className="w-4 h-4" />}
                                            {type === 'neural_link' && <Cpu className="w-4 h-4" />}
                                            {type === 'power_core' && <Zap className="w-4 h-4" />}
                                            {type === 'data_shard' && <Database className="w-4 h-4" />}
                                        </div>
                                        <p className="text-[10px] font-black text-white leading-none">+{count}</p>
                                        <p className="text-[6px] font-black text-slate-600 uppercase tracking-tighter">{type.replace('_', ' ')}</p>
                                    </motion.div>
                                );
                            })}
                            {(!sessionLoot || Object.values(sessionLoot).every(v => v === 0)) && (
                                <div className="col-span-full py-4 text-center border border-dashed border-white/5 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">No Materials Recovered</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🛠️ FOOTER GROUP: Unified container to prevent collision */}
                    <div className="mt-auto space-y-4">
                        {/* Progression Hint */}
                        <div className="p-5 rounded-3xl bg-linear-to-r from-blue-600/10 via-blue-600/5 to-transparent border border-blue-500/20 flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-xl">
                                    <Binary className="w-6 h-6 text-blue-400 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Neural Blueprint Active</p>
                                    <p className="text-sm font-bold text-white tracking-tight">Access Forge to Compile Gear</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </div>

                        {/* Exit Protocol */}
                        <button
                            onClick={handleFinish}
                            className="w-full py-5 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase tracking-[0.25em] text-xs transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 cursor-pointer group"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Return to Tactical Map
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};