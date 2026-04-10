'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import {
    Terminal,
    ShieldAlert,
    Cpu,
    Database,
    RefreshCcw,
    X,
    Activity,
    Lock
} from 'lucide-react';

/**
 * COMPONENT: IntelLog
 * Role: Retro-style terminal for reviewing wrong answers (Corrupted Data).
 * Fixes: Canonical Tailwind classes, Elevated Z-index (z-[150]), Backdrop exit logic.
 */
export const IntelLog = ({ onClose }: { onClose: () => void }) => {
    const { wrongAnswers, resetIntelLog, playerName } = useGameStore();
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    // Simulate system "decryption" sequence
    useEffect(() => {
        const timer = setTimeout(() => setIsAnalyzing(false), 1800);
        return () => clearTimeout(timer);
    }, []);

    const handleExit = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        resetIntelLog();
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            /* 🛠️ FIXED: Priority Z-index and backdrop click handler */
            className="fixed inset-0 z-150 bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 cursor-pointer"
            onClick={() => handleExit()}
        >
            {/* 📺 CRT SCANLINE OVERLAY */}
            <div className="absolute inset-0 pointer-events-none bg-size-[100%_4px] bg-linear-to-b from-transparent via-green-500/5 to-transparent opacity-30" />

            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                /* 🛡️ ARCHITECTURE: Stop propagation to prevent closing when clicking inside */
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl h-150 bg-black border border-green-500/30 rounded-4xl shadow-[0_0_80px_rgba(34,197,94,0.2)] overflow-hidden flex flex-col cursor-default"
            >

                {/* 🛠️ TERMINAL HEADER */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-green-500/20 bg-green-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-green-500/10 rounded border border-green-500/30">
                            <Terminal className="w-4 h-4 text-green-500 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xs font-mono font-black text-green-500 uppercase tracking-[0.3em]">
                                Intel Recovery // Post-Mortem
                            </h2>
                            <p className="text-[7px] font-mono text-green-500/40 uppercase tracking-widest mt-0.5">
                                User: {playerName} // Status: Analysis In Progress
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleExit()}
                        className="p-2 hover:bg-green-500/10 rounded-lg text-green-500/50 hover:text-green-400 transition-all active:scale-90 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 🖥️ TERMINAL CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8 font-mono space-y-10 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {isAnalyzing ? (
                            <motion.div
                                key="analyzing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center space-y-6"
                            >
                                <div className="relative">
                                    <Cpu className="w-16 h-16 text-green-500 animate-[spin_4s_linear_infinite]" />
                                    <Activity className="absolute inset-0 w-8 h-8 text-green-400 m-auto animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.4em] animate-pulse">
                                        Restoring Corrupted Neural Blocks...
                                    </p>
                                    <div className="mt-4 w-48 h-1 bg-green-950 rounded-full overflow-hidden mx-auto">
                                        <motion.div
                                            /* 🛡️ CANONICAL FIX: Ensuring initial state is off-screen */
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "0%" }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                            className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-12"
                            >
                                {wrongAnswers.length === 0 ? (
                                    <div className="text-center py-20 border border-dashed border-green-500/10 rounded-3xl">
                                        <Database className="w-12 h-12 text-green-500/20 mx-auto mb-4" />
                                        <p className="text-green-500/40 uppercase font-black tracking-widest text-[10px]">
                                            No Data Corruption Detected.
                                        </p>
                                        <p className="text-green-500/20 text-[8px] uppercase mt-2">Operator Performance: 100%</p>
                                    </div>
                                ) : (
                                    wrongAnswers.map((entry, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.12 }}
                                            className="relative space-y-5"
                                        >
                                            {/* 🛡️ CANONICAL FIX 1 & 2: Swapped bracket values for -left-5.25 and w-0.5 */}
                                            <div className="absolute -left-5.25 top-0 bottom-0 w-0.5 bg-green-500/20" />

                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 flex flex-col items-center">
                                                    <span className="text-[9px] bg-green-500 text-black px-2 py-0.5 font-black rounded-sm shadow-[2px_2px_0px_#052e16]">
                                                        LOG_{String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-green-400 font-bold leading-relaxed tracking-tight">
                                                    {entry.question}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ml-4">
                                                <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/20 group hover:border-red-500/40 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ShieldAlert className="w-3 h-3 text-red-500" />
                                                        <p className="text-[8px] text-red-500 font-black uppercase tracking-widest">Corrupted Choice</p>
                                                    </div>
                                                    <p className="text-[11px] text-red-300/80 italic line-through font-medium">
                                                        {entry.userChoice}
                                                    </p>
                                                </div>

                                                <div className="bg-green-500/5 p-4 rounded-2xl border border-green-500/20 group hover:border-green-500/40 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <RefreshCcw className="w-3 h-3 text-green-500 animate-spin-slow" />
                                                        <p className="text-[8px] text-green-500 font-black uppercase tracking-widest">Restored Data</p>
                                                    </div>
                                                    <p className="text-[11px] text-green-200 font-bold tracking-wide">
                                                        {entry.correctChoice}
                                                    </p>
                                                </div>
                                            </div>

                                            {entry.rationale && (
                                                <div className="ml-4 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                                        <Lock className="w-2 h-2" /> Logic Trace
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 italic leading-normal">
                                                        {entry.rationale}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 📑 TERMINAL FOOTER */}
                <div className="p-6 bg-green-500/5 border-t border-green-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-widest">
                            <span className="text-green-500/40">Total Anomalies:</span>
                            <span className="text-red-500 ml-2">{wrongAnswers.length}</span>
                        </div>
                        <div className="w-px h-3 bg-green-500/20 hidden sm:block" />
                        <div className="text-[9px] font-mono font-bold uppercase tracking-widest">
                            <span className="text-green-500/40">Integrity:</span>
                            <span className="text-green-400 ml-2">
                                {wrongAnswers.length === 0 ? '100%' : `${Math.max(0, 100 - (wrongAnswers.length * 10))}%`}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleExit()}
                        className="w-full sm:w-auto px-8 py-4 bg-green-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all active:scale-95 cursor-pointer"
                    >
                        Initialize Recovery Shutdown
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};