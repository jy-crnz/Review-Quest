'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Skull,
    RefreshCcw,
    Terminal,
    Map as MapIcon,
    AlertTriangle,
    Database,
    Activity
} from 'lucide-react';
import { useGameStore } from '../store';
import { IntelLog } from './IntelLog';

/**
 * COMPONENT: DefeatModal
 * Role: Tactical failure report with learning integration (Intel Log).
 * Update: Now routes "Abort" to the Mission Debrief for XP sync.
 */
export const DefeatModal = () => {
    const {
        resetGame,
        playerName,
        currentWaveIndex,
        wrongAnswers,
        setShowResults // 🎯 NEW: Required for the Mission Debrief transition
    } = useGameStore();

    const [showTelemetry, setShowTelemetry] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-500">

            {/* 🛑 DEFEAT CONTAINER */}
            <motion.div
                role="alertdialog"
                aria-labelledby="defeat-title"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md bg-slate-900 border-2 border-red-500/20 rounded-4xl p-8 md:p-10 shadow-[0_0_60px_rgba(239,68,68,0.15)] overflow-hidden"
            >
                {/* Visual Background Atmosphere */}
                <div className="absolute inset-0 bg-linear-to-b from-red-500/5 to-transparent pointer-events-none" />

                {/* HEADER: Mission Status */}
                <div className="text-center space-y-4 mb-8">
                    <div className="inline-flex p-4 bg-red-500/10 rounded-3xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <Skull className="w-12 h-12 text-red-500 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h2 id="defeat-title" className="text-4xl font-black italic text-white uppercase tracking-tighter">
                            Signal Lost
                        </h2>
                        <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.4em]">
                            Operator: {playerName} // Connection Severed
                        </p>
                    </div>
                </div>

                {/* MISSION BRIEFING (Stat Grid) */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Waves Survived</p>
                        <p className="text-2xl font-bold text-white tracking-tighter">{currentWaveIndex}</p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Data Corruption</p>
                        <p className="text-2xl font-bold text-red-500 tracking-tighter">{wrongAnswers.length}</p>
                    </div>
                </div>

                {/* TACTICAL ACTIONS */}
                <div className="space-y-4">
                    {/* PRIMARY: Retry Encounter (Immediate Restart) */}
                    <button
                        onClick={resetGame}
                        className="group w-full py-4 px-8 bg-white text-black hover:bg-red-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        Retry Encounter
                    </button>

                    {/* SECONDARY: Analyze Telemetry (The Learning Link) */}
                    {wrongAnswers.length > 0 && (
                        <button
                            onClick={() => setShowTelemetry(true)}
                            className="group w-full py-4 px-8 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <Terminal className="w-4 h-4 text-green-500 group-hover:animate-pulse" />
                            Analyze Telemetry
                            <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">
                                <Database className="w-2 h-2 text-green-500" />
                                <span className="text-[8px] text-green-500">{wrongAnswers.length}</span>
                            </div>
                        </button>
                    )}

                    {/* TERTIARY: Return to Map (Via Mission Debrief) */}
                    <button
                        /* 🎯 FIXED: Now goes to Results screen instead of jumping to Dashboard */
                        onClick={() => setShowResults(true)}
                        className="w-full py-2 text-slate-500 hover:text-slate-300 font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <MapIcon className="w-3 h-3" />
                        Abort Mission & Sync XP
                    </button>
                </div>

                {/* FOOTER: System Warning */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 justify-center">
                    <AlertTriangle className="w-3 h-3 text-red-500/40" />
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                        Neural integrity compromised // Analysis Advised
                    </p>
                </div>
            </motion.div>

            {/* 📟 INTEL TERMINAL OVERLAY */}
            <AnimatePresence>
                {showTelemetry && (
                    <IntelLog onClose={() => setShowTelemetry(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};