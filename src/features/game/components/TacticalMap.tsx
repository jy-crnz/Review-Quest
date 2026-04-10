'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from 'framer-motion';
import { useGameStore, type CourseType } from '../store';
import {
    Sword,
    Lock,
    CheckCircle2,
    Shield,
    BookOpen,
    Zap,
    Plus,
    Minus,
    Maximize,
    Radar,
    Navigation,
    AlertTriangle
} from 'lucide-react';

/**
 * SUB-COMPONENT: OffScreenIndicator
 */
const OffScreenIndicator = ({ node, mapX, mapY, scaleValue, viewportW, viewportH }: any) => {
    const screenX = useTransform([mapX, scaleValue], ([latestX, latestScale]: any) => {
        return (node.position.x - 1000) * latestScale + latestX;
    });
    const screenY = useTransform([mapY, scaleValue], ([latestY, latestScale]: any) => {
        return (node.position.y - 1000) * latestScale + latestY;
    });

    const [isVisible, setIsVisible] = useState(false);
    const [style, setStyle] = useState({ x: 0, y: 0, rotate: 0 });

    useEffect(() => {
        const updatePosition = () => {
            const sx = screenX.get();
            const sy = screenY.get();

            const padding = 40;
            const halfW = (viewportW / 2) - padding;
            const halfH = (viewportH / 2) - padding;

            const isOff = Math.abs(sx) > halfW || Math.abs(sy) > halfH;
            setIsVisible(isOff);

            if (isOff) {
                const clampedX = Math.min(Math.max(sx, -halfW), halfW);
                const clampedY = Math.min(Math.max(sy, -halfH), halfH);
                const angle = Math.atan2(sy, sx) * (180 / Math.PI);
                setStyle({ x: clampedX, y: clampedY, rotate: angle + 90 });
            }
        };

        const unsubX = screenX.on('change', updatePosition);
        const unsubY = screenY.on('change', updatePosition);
        return () => { unsubX(); unsubY(); };
    }, [viewportW, viewportH, screenX, screenY]);

    if (!isVisible) return null;

    return (
        <motion.div
            style={{ x: style.x, y: style.y, rotate: `${style.rotate}deg` }}
            className="absolute z-50 pointer-events-none"
        >
            <div className="flex flex-col items-center gap-2">
                <div className={`p-1.5 rounded-full shadow-2xl animate-pulse ${node.status === 'decayed' ? 'bg-red-500 shadow-red-500/80' : 'bg-blue-500 shadow-blue-500/80'}`}>
                    <Navigation className="w-3 h-3 text-white fill-current" />
                </div>
                <span
                    className={`bg-slate-900/90 border px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter whitespace-nowrap ${node.status === 'decayed' ? 'border-red-500/30 text-red-400' : 'border-blue-500/30 text-blue-400'}`}
                    style={{ rotate: `${-style.rotate}deg` }}
                >
                    {node.name}
                </span>
            </div>
        </motion.div>
    );
};

export const TacticalMap = () => {
    const { dungeons, setActiveDungeon, level, runDecayScan } = useGameStore();

    // Run decay scan on mount
    useEffect(() => {
        runDecayScan();
    }, [runDecayScan]);

    // 📐 CONFIGURATION
    const WORLD_SIZE = 2000;
    const VIEWPORT_H = 600;
    const VIEWPORT_W = 800;

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1);
    const [displayScale, setDisplayScale] = useState(1);

    const handleZoomIn = () => {
        const next = Math.min(scale.get() + 0.4, 3);
        animate(scale, next, { type: 'spring', stiffness: 300, damping: 30 });
        setDisplayScale(next);
    };

    const handleZoomOut = () => {
        const next = Math.max(scale.get() - 0.4, 0.4);
        animate(scale, next, { type: 'spring', stiffness: 300, damping: 30 });
        setDisplayScale(next);
    };

    const handleResetZoom = () => {
        animate(scale, 1, { type: 'spring', stiffness: 300, damping: 30 });
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
        animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
        setDisplayScale(1);
    };

    const bounds = useMemo(() => {
        const scaledSize = WORLD_SIZE * displayScale;
        const hLimit = Math.max(0, (scaledSize - VIEWPORT_W) / 2);
        const vLimit = Math.max(0, (scaledSize - VIEWPORT_H) / 2);
        return { left: -hLimit, right: hLimit, top: -vLimit, bottom: vLimit };
    }, [displayScale]);

    useEffect(() => {
        const currentX = x.get();
        const currentY = y.get();
        const clampedX = Math.min(Math.max(currentX, bounds.left), bounds.right);
        const clampedY = Math.min(Math.max(currentY, bounds.top), bounds.bottom);
        if (clampedX !== currentX || clampedY !== currentY) {
            animate(x, clampedX, { type: 'spring', stiffness: 300, damping: 30 });
            animate(y, clampedY, { type: 'spring', stiffness: 300, damping: 30 });
        }
    }, [displayScale, bounds, x, y]);

    const getSubjectIcon = (subject: CourseType) => {
        switch (subject) {
            case 'it': return <Sword className="w-5 h-5" />;
            case 'nursing': return <Shield className="w-5 h-5" />;
            case 'law': return <BookOpen className="w-5 h-5" />;
            default: return <Zap className="w-5 h-5" />;
        }
    };

    return (
        <div className="relative w-full h-150 bg-slate-950 rounded-[40px] border border-slate-800/60 overflow-hidden backdrop-blur-xl cursor-grab active:cursor-grabbing flex items-center justify-center">

            {dungeons.map(node => (
                <OffScreenIndicator
                    key={`guide-${node.id}`}
                    node={node}
                    mapX={x}
                    mapY={y}
                    scaleValue={scale}
                    viewportW={VIEWPORT_W}
                    viewportH={VIEWPORT_H}
                />
            ))}

            <div className="absolute top-6 right-6 z-50 flex flex-col gap-2">
                <div className="flex flex-col bg-slate-900/95 border border-slate-700/50 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
                    <button onClick={handleZoomIn} className="p-3 hover:bg-blue-600/20 hover:text-blue-400 text-slate-400 transition-all rounded-xl cursor-pointer"><Plus className="w-4 h-4" /></button>
                    <div className="h-px bg-slate-800 mx-2" />
                    <button onClick={handleZoomOut} className="p-3 hover:bg-blue-600/20 hover:text-blue-400 text-slate-400 transition-all rounded-xl cursor-pointer"><Minus className="w-4 h-4" /></button>
                </div>
                <button onClick={handleResetZoom} className="p-3 bg-slate-900/95 border border-slate-700/50 hover:border-blue-500/50 text-slate-400 hover:text-white transition-all rounded-2xl shadow-2xl backdrop-blur-md cursor-pointer flex items-center justify-center"><Maximize className="w-4 h-4" /></button>
            </div>

            <motion.div
                drag
                dragConstraints={bounds}
                dragElastic={0.05}
                style={{ x, y, scale, width: `2000px`, height: `2000px`, position: 'absolute' }}
                className="origin-center flex items-center justify-center shrink-0"
            >
                <div className="absolute inset-0 pointer-events-none w-full h-full">
                    <div
                        className="w-full h-full opacity-[0.15]"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, #1e293b 1px, transparent 1px),
                                linear-gradient(to bottom, #1e293b 1px, transparent 1px),
                                linear-gradient(to right, #334155 2px, transparent 2px),
                                linear-gradient(to bottom, #334155 2px, transparent 2px)
                            `,
                            backgroundSize: '40px 40px, 40px 40px, 200px 200px, 200px 200px',
                            backgroundRepeat: 'repeat'
                        }}
                    />
                </div>

                <AnimatePresence>
                    {dungeons.length === 0 && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="z-30">
                            <div className="flex flex-col items-center justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setActiveDungeon('DEBUG_SECTOR')}
                                    className="mb-4 relative rounded-full border border-slate-800 bg-slate-900/90 p-8 shadow-2xl cursor-pointer hover:border-blue-500/50 transition-colors group"
                                >
                                    <Radar className="w-10 h-10 text-blue-500 group-hover:text-blue-400" />
                                    <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">No Active Sectors</h3>
                                <p className="mt-2 text-[10px] font-bold uppercase text-slate-500">Establish Tactical Uplink</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {dungeons.map((node) => {
                    const isLocked = level < node.levelRequired;
                    const isCleared = node.status === 'cleared';
                    const isDecayed = node.status === 'decayed';
                    const stability = node.stability ?? 100;
                    const safeX = Math.min(Math.max(node.position.x, 200), 1800);
                    const safeY = Math.min(Math.max(node.position.y, 200), 1800);

                    return (
                        <motion.div
                            key={node.id}
                            style={{ left: `${safeX}px`, top: `${safeY}px`, position: 'absolute' }}
                            className="z-20 -translate-x-1/2 -translate-y-1/2"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => !isLocked && setActiveDungeon(node.id)}
                                className={`
                                    relative p-6 rounded-3xl border-2 transition-all duration-300
                                    ${isCleared ? 'bg-green-500/5 border-green-500/40 shadow-green-500/10' : 'bg-slate-900/80 border-blue-500/40 shadow-blue-500/10'}
                                    ${isDecayed ? 'border-red-500/50 bg-red-500/5 shadow-red-500/20' : ''}
                                    ${isLocked ? 'grayscale opacity-40 cursor-not-allowed border-slate-700' : 'cursor-pointer hover:border-white shadow-2xl'}
                                `}
                            >
                                {isDecayed && (
                                    <motion.div 
                                        animate={{ opacity: [0, 0.5, 0] }}
                                        transition={{ duration: 0.2, repeat: Infinity }}
                                        className="absolute inset-0 bg-red-500/10 rounded-3xl pointer-events-none"
                                    />
                                )}
                                <div className="relative z-10 flex items-center justify-center">
                                    {isLocked ? <Lock className="w-5 h-5 text-slate-500" /> : 
                                     isDecayed ? <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> :
                                     isCleared ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                                     <div className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{getSubjectIcon(node.subject)}</div>}
                                </div>
                                <div className="absolute top-full mt-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
                                    <span className={`whitespace-nowrap rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${isCleared ? 'border-green-500/20 bg-green-500/10 text-green-500' : isDecayed ? 'border-red-500/20 bg-red-500/10 text-red-500' : 'border-slate-700 bg-slate-900/90 text-slate-400'}`}>{node.name}</span>
                                    {!isLocked && (
                                        <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${stability < 50 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`}
                                                style={{ width: `${stability}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.button>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="absolute bottom-8 left-8 z-50 flex gap-6 rounded-2xl border border-slate-800/50 bg-slate-900/90 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Active Front</span></div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Conquered</span></div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Neural Decay</span></div>
            </div>
        </div>
    );
};