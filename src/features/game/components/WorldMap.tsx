'use client';

import React from 'react';
import { Lock, Skull, CheckCircle2, Flag, Mountain, AlertTriangle } from 'lucide-react';
import { useGameStore, DungeonNode } from '../store';

export const WorldMap = () => {
    const { dungeons, level, setActiveDungeon, activeDungeonId } = useGameStore();

    return (
        <div className="relative w-full h-100 bg-slate-950/50 rounded-[3rem] border border-slate-800 overflow-hidden shadow-inner">
            {/* ... (background and paths remain same) */}

            {/* Dungeon Nodes */}
            {dungeons.map((node) => {
                const isLocked = node.status === 'locked' || level < node.levelRequired;
                const isCleared = node.status === 'cleared';
                const isDecayed = node.status === 'decayed';
                const isActive = activeDungeonId === node.id;
                const stability = node.stability ?? 100;

                return (
                    <button
                        key={node.id}
                        disabled={isLocked}
                        onClick={() => setActiveDungeon(node.id)}
                        style={{ left: `${node.position.x / 20}%`, top: `${node.position.y / 20}%` }}
                        className={`
                            absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl border-2 transition-all duration-500 group
                            ${isLocked ? 'bg-slate-900 border-slate-800 opacity-50 grayscale' : ''}
                            ${node.status === 'available' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-110' : ''}
                            ${isCleared ? 'bg-green-600/20 border-green-500' : ''}
                            ${isDecayed ? 'bg-red-600/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''}
                            ${isActive ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-950 scale-110' : ''}
                        `}
                    >
                        <div className="relative">
                            {isLocked ? <Lock className="w-5 h-5 text-slate-600" /> :
                             isDecayed ? <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> :
                             isCleared ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
                             <Skull className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-400'} animate-pulse`} />}

                            {/* Label Popup & Stability Bar */}
                            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 whitespace-nowrap pointer-events-none">
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border ${isActive ? 'bg-white text-black border-white' : isDecayed ? 'bg-red-950 text-red-400 border-red-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                                    {node.name}
                                </span>
                                {!isLocked && (
                                    <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${stability < 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${stability}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-6 flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Front</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Conquered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Neural Decay</span>
                </div>
            </div>
        </div>
    );
};