// src/features/leveling/components/ExperienceBar.tsx
'use client';

import React from 'react';
import { useGameStore } from '@/features/game/store';
import { Star } from 'lucide-react';

export const ExperienceBar = () => {
    const { currentXP, level } = useGameStore();

    // Logic Layer: Calculate progress toward the next 100 XP bracket
    const progress = currentXP % 100;

    return (
        <div className="w-full space-y-3 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-xs">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Star className="w-5 h-5 text-[--color-xp-gold] fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Rank</span>
                        <span className="text-xl font-black text-white italic">LVL {level}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tabular-nums">
                        {progress} <span className="text-slate-600">/ 100 XP</span>
                    </span>
                </div>
            </div>

            {/* The XP Track */}
            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                <div
                    className="h-full bg-linear-to-r from-yellow-500 to-amber-300 shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};