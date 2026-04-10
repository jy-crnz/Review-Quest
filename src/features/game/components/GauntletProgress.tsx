'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Target,
    X,
    Activity,
    Flag,
    Zap,
    ChevronDown,
    Database
} from 'lucide-react';
import { useGameStore } from '../store';

/**
 * COMPONENT: GauntletProgress
 * Role: Tactical breakdown of mission progress.
 * Features: Horizontal Sector Track (Legacy) + Vertical Data Log (New), 
 * Fix: Scrollable area for long question lists, Fixed layout hierarchy.
 */
export const GauntletProgress = () => {
    const { mapNodes, currentQuestionIndex, toggleInGameMap } = useGameStore();

    if (!mapNodes || mapNodes.length === 0) return null;

    // Logic for efficiency calculation
    const efficiency = Math.round((currentQuestionIndex / mapNodes.length) * 100);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-900 shadow-2xl">

            {/* --- 1. MODAL HEADER (Static) --- */}
            <div className="p-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-30">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">
                            Mission Telemetry
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1.5">
                            Sector Analysis // Operational Status
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggleInGameMap}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all text-slate-400 hover:text-white cursor-pointer group active:scale-90"
                >
                    <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
                </button>
            </div>

            {/* --- 2. HORIZONTAL TRACKER (Preserved Legacy Feature) --- */}
            <div className="px-8 py-6 bg-slate-950/40 border-b border-slate-800/50">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-3 h-3 text-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Synchronization Track</span>
                </div>
                <div className="flex items-center gap-0 overflow-x-auto no-scrollbar py-2">
                    {mapNodes.map((node, idx) => {
                        const isCleared = idx < currentQuestionIndex;
                        const isCurrent = idx === currentQuestionIndex;
                        const isLast = idx === mapNodes.length - 1;

                        return (
                            <React.Fragment key={idx}>
                                <div className="relative shrink-0">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10
                                        ${isCleared ? 'bg-green-500/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : ''}
                                        ${isCurrent ? 'bg-blue-600 border-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : ''}
                                        ${idx > currentQuestionIndex ? 'bg-slate-900 border-slate-800 text-slate-700' : 'text-white'}
                                    `}>
                                        {isCleared ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        ) : isCurrent ? (
                                            <Target className="w-4 h-4 animate-pulse" />
                                        ) : (
                                            <span className="text-[9px] font-black">{idx + 1}</span>
                                        )}
                                    </div>
                                </div>
                                {!isLast && (
                                    <div className="flex-1 min-w-8 h-0.5 bg-slate-800 relative">
                                        <div className={`absolute inset-0 transition-all duration-1000 ${isCleared ? 'bg-green-500 shadow-[0_0_8px_#4ade80]' : 'bg-slate-800'}`} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* --- 3. VERTICAL LOG AREA (New Feature: Scrollable) --- */}
            <div className="flex-1 overflow-y-auto p-8 space-y-3 custom-scrollbar bg-slate-950/20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Database className="w-3 h-3 text-slate-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Data Log</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Total Blocks: {mapNodes.length}</span>
                </div>

                <div className="grid gap-3">
                    {mapNodes.map((node, idx) => {
                        const isCurrent = idx === currentQuestionIndex;
                        const isCleared = idx < currentQuestionIndex;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className={`flex items-center gap-5 p-5 rounded-3xl border transition-all duration-300
                                    ${isCurrent
                                        ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)] scale-[1.02]'
                                        : isCleared
                                            ? 'bg-slate-900/40 border-green-500/20 opacity-80'
                                            : 'bg-slate-900/20 border-slate-800 opacity-40'
                                    }
                                `}
                            >
                                <div className="shrink-0">
                                    {isCleared ? (
                                        <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        </div>
                                    ) : isCurrent ? (
                                        <div className="relative w-10 h-10">
                                            <div className="absolute inset-0 bg-blue-500 blur-md animate-pulse rounded-full" />
                                            <div className="relative w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                                                <Target className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                                            <Circle className="w-4 h-4 text-slate-700" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest
                                            ${isCurrent ? 'text-blue-400' : isCleared ? 'text-green-500/70' : 'text-slate-600'}
                                        `}>
                                            Data Block {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        {isCurrent && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 rounded border border-blue-500/30">
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">
                                                    Active Link
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-sm font-bold tracking-tight ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                                        {isCleared ? 'Verification Successful' : isCurrent ? 'Analyzing Core Data...' : 'Encryption Pending'}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* --- 4. FOOTER STATUS (Static) --- */}
            <div className="p-8 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Sector Progress</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white leading-none">
                                {currentQuestionIndex}
                            </span>
                            <span className="text-sm font-bold text-slate-600 uppercase">/ {mapNodes.length} Blocks</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-slate-800 hidden sm:block" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Efficiency</span>
                        <span className={`text-2xl font-black leading-none ${efficiency > 70 ? 'text-green-500' : efficiency > 40 ? 'text-blue-400' : 'text-red-500'}`}>
                            {efficiency}%
                        </span>
                    </div>
                </div>

                <button
                    onClick={toggleInGameMap}
                    className="w-full sm:w-auto px-10 py-4 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 cursor-pointer group"
                >
                    Resume Encounter
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};