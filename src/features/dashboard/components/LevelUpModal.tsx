    'use client';

    import React from 'react';
    import { Trophy, Star, Sparkles, Zap } from 'lucide-react';
    import { useGameStore } from '@/features/game/store';

    /**
     * Presentation Layer: Level Up Celebration
     * Engineering Standard: Pull state directly from the Logic Layer (Zustand).
     * Design Standard: High-contrast action triggers for accessibility.
     */
    export const LevelUpModal = () => {
        // 1. Logic Layer: Connect to global game state
        const {
            level,
            currentXP,
            showLevelUp,
            closeLevelUp
        } = useGameStore();

        // Guard Clause: Don't render if the logic layer hasn't triggered a level up
        if (!showLevelUp) return null;

        return (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-500">
                <div
                    role="alertdialog"
                    aria-labelledby="levelup-title"
                    /* 2. Visual Layer: Cleaned up shadow to remove "black blur" effect */
                    className="relative bg-slate-900 border-2 border-[--color-xp-gold] p-10 rounded-3xl border-t-white/10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 shadow-2xl"
                >
                    {/* Visual Decor: Icon Stack */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                        <div className="relative">
                            <Trophy className="text-[--color-xp-gold] w-16 h-16 filter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            <Star className="absolute -top-2 -left-4 text-yellow-400 fill-yellow-400 w-6 h-6 animate-pulse" />
                            <Sparkles className="absolute -bottom-2 -right-4 text-blue-400 w-6 h-6 animate-bounce" />
                        </div>
                    </div>

                    {/* 3. Content Area */}
                    <h2
                        id="levelup-title"
                        className="text-4xl font-black italic tracking-tighter mt-6 mb-2 bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent uppercase"
                    >
                        RANK UP!
                    </h2>

                    <div className="space-y-4 mb-8">
                        <p className="text-slate-400 text-xs leading-relaxed font-medium">
                            Your academic prowess has evolved. You have successfully ascended to:
                        </p>

                        <div className="inline-flex items-center justify-center px-6 py-2 bg-[--color-xp-gold]/10 border border-[--color-xp-gold]/20 rounded-full">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[--color-xp-gold] mr-2">Level</span>
                            <span className="text-2xl font-black text-white">{level}</span>
                        </div>

                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Total Power: <span className="text-[--color-xp-gold]">{currentXP} XP</span>
                        </p>
                    </div>

                    {/* 4. Action Layer: High-Visibility White Button */}
                    <button
                        onClick={closeLevelUp}
                        className="group relative w-full py-4 bg-white text-slate-950 font-black uppercase text-[11px] tracking-[0.2em] rounded-xl hover:bg-yellow-400 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Zap className="w-3 h-3 fill-current" />
                        Continue Quest
                    </button>

                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/5 opacity-20" />
                </div>
            </div>
        );
    };