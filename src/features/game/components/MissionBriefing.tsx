'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Terminal, Play, Cpu, Globe, Database } from 'lucide-react';
import { useGameStore } from '../store';

/**
 * COMPONENT: MissionBriefing
 * Role: Provides procedural narrative context before a battle.
 * Fix: Forced viewport lockdown to prevent background "leaking" on various screen sizes.
 */
export const MissionBriefing = () => {
    const { currentQuiz, closeBriefing, showBriefing, courseType } = useGameStore();

    if (!currentQuiz || !showBriefing) return null;

    return (
        /* ✅ ARCHITECTURAL FIX: 
           - Fixed at -2vh/vw to provide a "bleed" area.
           - h-[104dvh] covers dynamic browser bars.
           - z-[999] ensures total dominance over background UI.
        */
        <div className="fixed -inset-[2vh] left-[-2vw] w-[104vw] h-[104dvh] z-999 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl">

            {/* Background VFX: Scaled to 115% to guarantee pattern coverage */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] bg-size-[40px_40px] scale-115" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-slate-900 border-2 border-blue-500/30 p-10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] max-w-2xl w-full overflow-hidden"
            >
                {/* Header Scanner Effect */}
                <motion.div
                    animate={{ y: [0, 500, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-px bg-blue-500/30 z-0 pointer-events-none"
                />

                <div className="relative z-10 flex flex-col items-center text-center">

                    {/* Icon Stack */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                        <div className="relative w-24 h-24 rounded-3xl bg-slate-950 border border-blue-500/50 flex items-center justify-center">
                            <ShieldAlert className="w-12 h-12 text-blue-500 animate-pulse" />
                        </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex gap-3 mb-6">
                        <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center gap-2">
                            <Cpu className="w-3 h-3 text-blue-400" />
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                {courseType || 'Tactical'} Sector
                            </span>
                        </div>
                        <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full flex items-center gap-2">
                            <Database className="w-3 h-3 text-red-400" />
                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Priority: Critical</span>
                        </div>
                    </div>

                    {/* Target Identity */}
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">
                        {currentQuiz.title}
                    </h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10">
                        Target Identified // Threat Level: High
                    </p>

                    {/* Terminal Text Block */}
                    <div className="w-full bg-slate-950/60 border border-white/5 p-8 rounded-4xl mb-10 relative group">
                        <Terminal className="absolute top-4 left-4 w-4 h-4 text-blue-500/30" />
                        <p className="text-lg font-bold text-slate-200 leading-relaxed italic">
                            "Intel reveals a critical sector compromise. Your objective is to de-encrypt the target's logic gates across multiple floors."
                        </p>
                    </div>

                    {/* Deployment Control */}
                    <button
                        onClick={closeBriefing}
                        className="group relative w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-4xl font-black uppercase tracking-[0.3em] text-sm transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
                    >
                        <motion.div
                            className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                            style={{ skewX: -45 }}
                        />
                        <Play className="w-5 h-5 fill-current" />
                        Commence Mission
                    </button>

                    {/* Status Footer */}
                    <p className="mt-8 text-[8px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-3 h-3" /> System Synchronized // Neural Link Established
                    </p>
                </div>
            </motion.div>
        </div>
    );
};