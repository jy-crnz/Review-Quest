'use client';

import React from 'react';
import { Target, Zap, Sword, Trophy, Skull, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/features/game/store';

export const RunSummaryModal = () => {
    const { runSummary, resetGame, maxCombo } = useGameStore();

    if (!runSummary) return null;

    const { stats, reason } = runSummary;
    const accuracy = stats.questionsAttempted > 0
        ? Math.round((stats.questionsCorrect / stats.questionsAttempted) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />

            <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-8">
                {/* Header Section */}
                <div className="space-y-2">
                    <div className="flex justify-center mb-4">
                        {reason === 'defeated' ? (
                            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                                <Skull className="w-8 h-8 text-red-500" />
                            </div>
                        ) : (
                            <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                                <RotateCcw className="w-8 h-8 text-blue-400" />
                            </div>
                        )}
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                        {reason === 'defeated' ? 'Quest Failed' : 'Review Interrupted'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Session Performance Log</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                        <Target className="w-4 h-4 text-blue-400 mb-2 mx-auto" />
                        <p className="text-[9px] text-slate-500 font-black uppercase">Accuracy</p>
                        <p className="text-xl font-black text-white">{accuracy}%</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                        <Zap className="w-4 h-4 text-yellow-500 mb-2 mx-auto" />
                        <p className="text-[9px] text-slate-500 font-black uppercase">Max Combo</p>
                        <p className="text-xl font-black text-white">{maxCombo}x</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl col-span-2 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <Sword className="w-4 h-4 text-red-500" />
                            <p className="text-[9px] text-slate-500 font-black uppercase">Total Damage Dealt</p>
                        </div>
                        <p className="text-xl font-black text-white">{stats.totalDamageDealt}</p>
                    </div>
                </div>

                <button
                    onClick={resetGame}
                    className="w-full py-4 bg-white hover:bg-blue-500 text-black hover:text-white font-black uppercase text-xs tracking-widest rounded-full transition-all active:scale-95 shadow-lg"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};