'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type CourseType } from '../store';
import {
    Sword,
    Lock,
    CheckCircle2,
    Shield,
    BookOpen,
    Grab,
    Zap,
    Radar,
    Activity,
    Terminal,
    AlertTriangle
} from 'lucide-react';

/**
 * COMPONENT: CampaignMap
 * Role: Draggable tactical dashboard for sector selection.
 * Fixes: Expanded boundaries for "Limited Space", stabilized Ref constraints, canonical classes.
 */
export const CampaignMap = () => {
    const { dungeons, setActiveDungeon, level } = useGameStore();

    // 🛡️ STABILITY FIX: Use the parent as the direct constraint reference
    const mapViewportRef = useRef<HTMLDivElement>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const getSubjectIcon = (subject: CourseType) => {
        switch (subject) {
            case 'it': return <Sword className="w-5 h-5" />;
            case 'nursing': return <Shield className="w-5 h-5" />;
            case 'law': return <BookOpen className="w-5 h-5" />;
            default: return <Zap className="w-5 h-5" />;
        }
    };

    return (
        /* 🛠️ SPACE FIX: Increased height to h-200 (800px) for a massive viewing window */
        <div
            ref={mapViewportRef}
            className="relative w-full h-200 bg-slate-950/40 rounded-5xl border border-slate-800/60 overflow-hidden backdrop-blur-xl shadow-2xl touch-none"
        >
            {/* 🖥️ TACTICAL OVERLAY: Pinned to viewport edges */}
            <div className="absolute top-10 inset-x-10 z-50 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <Radar className="w-7 h-7 text-blue-500 animate-pulse" />
                        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Campaign Map</h2>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-10">
                        Global Front // Operational View
                    </p>
                </div>

                <div className="px-5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md pointer-events-auto">
                    <Grab className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hold to Pan</span>
                </div>
            </div>

            {/* 🛡️ BOUNDARY FIX: Canonical -inset-200 (800px) allows much deeper exploration of the map */}
            <div className="absolute -inset-200 pointer-events-none" />

            {/* 🎨 THE DRAGGABLE CANVAS: Expanded to min-w-400 (1600px) and min-h-300 (1200px) */}
            <motion.div
                drag
                dragConstraints={mapViewportRef}
                dragElastic={0.08}
                dragMomentum={true}
                /* 🎬 VISUAL JUICE: Scale down slightly when dragging to feel more "open" */
                whileDrag={{ scale: 0.98 }}
                initial={{ x: 0, y: 0 }}
                className="relative w-full h-full min-w-400 min-h-300 cursor-grab active:cursor-grabbing origin-center transition-transform duration-500"
            >
                {/* Visual Grid Pattern (Larger scale for better depth) */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(#475569 1px, transparent 1px), 
                            linear-gradient(90deg, #475569 1px, transparent 1px)
                        `,
                        backgroundSize: '120px 120px'
                    }}
                />

                {/* Tactical Scanlines: Canonical bg-size */}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-500/5 to-transparent bg-size-[100%_6px] pointer-events-none" />

                {/* PROCEDURAL NODES */}
                {dungeons.map((node) => {
                    const isLocked = level < (node.levelRequired || 0);
                    const isCleared = node.status === 'cleared';
                    const isHovered = hoveredNode === node.id;

                    return (
                        <motion.div
                            key={node.id}
                            style={{
                                left: `${node.position.x}%`,
                                top: `${node.position.y}%`,
                                position: 'absolute'
                            }}
                            className="z-20 -translate-x-1/2 -translate-y-1/2"
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                        >
                            <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => !isLocked && setActiveDungeon(node.id)}
                                className={`
                                    relative p-8 rounded-4xl border-2 transition-all duration-500 group
                                    ${isCleared
                                        ? 'bg-green-500/5 border-green-500/30'
                                        : 'bg-slate-900/90 border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)]'}
                                    ${isLocked ? 'grayscale opacity-30 cursor-not-allowed border-slate-700' : 'cursor-pointer hover:border-white shadow-2xl'}
                                `}
                            >
                                <AnimatePresence>
                                    {isHovered && !isLocked && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1.3 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -z-10"
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="relative z-10">
                                    {isLocked ? (
                                        <Lock className="w-8 h-8 text-slate-600" />
                                    ) : isCleared ? (
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    ) : (
                                        <div className="text-blue-400 group-hover:text-white transition-colors scale-110">
                                            {getSubjectIcon(node.subject)}
                                        </div>
                                    )}
                                </div>

                                {!isCleared && !isLocked && (
                                    <div className="absolute inset-0 rounded-4xl border-2 border-blue-500/20 animate-ping pointer-events-none" />
                                )}

                                {/* Floating Data Label: Canonical min-w-40 */}
                                <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 min-w-40 pointer-events-none">
                                    <span className={`text-[11px] font-black uppercase tracking-[0.25em] whitespace-nowrap px-5 py-2 rounded-xl border transition-all duration-300 shadow-2xl
                                        ${isCleared
                                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                            : isLocked
                                                ? 'bg-slate-950 border-slate-900 text-slate-700'
                                                : 'bg-slate-900 border-slate-700 text-slate-200 group-hover:border-blue-500 group-hover:text-white group-hover:bg-blue-600/20'
                                        }
                                    `}>
                                        {node.name}
                                    </span>

                                    {!isLocked && !isCleared && isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-1.5"
                                        >
                                            <Terminal className="w-3 h-3 text-blue-500" />
                                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Connect Link</span>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* FOG OF WAR */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(2,6,23,0.95)]" />

            {/* FOOTER INTELLIGENCE */}
            <div className="absolute bottom-10 left-10 z-50 flex gap-8 bg-slate-950/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-2xl pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Front</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secured</span>
                </div>
            </div>
        </div>
    );
};