// src/features/leveling/components/StudyBuffs.tsx
'use client';

import React from 'react';
import { Sword, Shield, Sparkles } from 'lucide-react';
import { useGameStore } from '@/features/game/store';

export const StudyBuffs = () => {
    const { skillPoints, stats, upgradeStat } = useGameStore();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    Available Skill Points: <span className="text-white">{skillPoints}</span>
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Attack Upgrade */}
                <button
                    onClick={() => upgradeStat('attack')}
                    disabled={skillPoints === 0}
                    className="group relative p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-left hover:border-blue-500/50 hover:bg-slate-800/80 transition-all disabled:opacity-40 active:scale-95 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                            <Sword className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-1 rounded-md">
                            Rank {stats.attack}
                        </span>
                    </div>
                    <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-tight">Focus Strike</h4>
                    <p className="text-[9px] text-slate-500 font-medium mt-1 leading-tight">
                        Increase answer damage by <span className="text-blue-400">+5</span>
                    </p>
                </button>

                {/* Defense Upgrade */}
                <button
                    onClick={() => upgradeStat('defense')}
                    disabled={skillPoints === 0}
                    className="group relative p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-left hover:border-green-500/50 hover:bg-slate-800/80 transition-all disabled:opacity-40 active:scale-95 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                            <Shield className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-1 rounded-md">
                            Rank {stats.defense}
                        </span>
                    </div>
                    <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-tight">Mental Shield</h4>
                    <p className="text-[9px] text-slate-500 font-medium mt-1 leading-tight">
                        Reduce damage taken by <span className="text-green-400">-2</span>
                    </p>
                </button>
            </div>
        </div>
    );
};