'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useGameStore, WAVES } from '../store';
import { ShieldAlert, Skull, Ghost, Bot, Activity } from 'lucide-react';

/**
 * COMPONENT: EnemySprite
 * Role: Visual representation of the Sector Boss.
 * Features: Holographic Wireframe aesthetic, Dynamic Threat Signature, Wave-Safe Visuals.
 */
interface EnemySpriteProps {
    isHit?: boolean;
    isAttacking?: boolean;
}

// 🎨 VISUAL ENGINE: Maps spriteIds to icons (Maintains Outlined Look)
const ENEMY_VISUALS: Record<string, { icon: any; color: string; glow: string }> = {
    vanguard_scout: { icon: Bot, color: 'text-blue-400', glow: 'bg-blue-500/20' },
    elite_sentinel: { icon: ShieldAlert, color: 'text-cyan-400', glow: 'bg-cyan-500/20' },
    academic_overlord: { icon: Skull, color: 'text-purple-500', glow: 'bg-purple-500/40' },
    chaos_guard: { icon: Ghost, color: 'text-red-500', glow: 'bg-red-500/30' },
};

export const EnemySprite = ({ isHit, isAttacking }: EnemySpriteProps) => {
    const { currentWaveIndex, bossQuote, bossHP, maxBossHP } = useGameStore();

    // 🛡️ ARCHITECTURE: Context & HP calculations
    const currentWave = WAVES[currentWaveIndex] || WAVES[0];
    const visual = ENEMY_VISUALS[currentWave.spriteId] || ENEMY_VISUALS.vanguard_scout;
    const Icon = visual.icon;
    const hpPercent = (bossHP / maxBossHP) * 100;

    // 🎯 DYNAMIC THREAT LOGIC: Maps boss HP to tactical threat reports
    const getThreatStatus = () => {
        if (bossHP <= 0) return { label: 'NEUTRALIZED', color: 'text-slate-500', bg: 'bg-slate-500/10', pulse: false };
        if (hpPercent <= 25) return { label: 'CRITICAL FAILURE', color: 'text-red-600', bg: 'bg-red-600/20', pulse: true };
        if (hpPercent <= 50) return { label: 'LETHAL THREAT', color: 'text-red-500', bg: 'bg-red-500/10', pulse: true };
        if (hpPercent < 100) return { label: 'HOSTILE', color: 'text-orange-500', bg: 'bg-orange-500/10', pulse: false };
        return { label: 'SCANNING', color: 'text-red-400', bg: 'bg-red-500/5', pulse: false };
    };

    const threat = getThreatStatus();

    // 🎬 ANIMATION VARIANTS
    const enemyVariants: Variants = {
        idle: {
            y: [0, -8, 0],
            scale: [1, 1.02, 1],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        },
        hit: {
            x: [0, -10, 10, -10, 10, 0],
            filter: ["brightness(1)", "brightness(3) saturate(0)", "brightness(1)"],
            transition: { duration: 0.4, ease: "linear" }
        },
        attack: {
            x: [0, -60, 0],
            scale: [1, 1.2, 1],
            transition: { duration: 0.5, ease: "anticipate" }
        }
    };

    const currentAction = isHit ? 'hit' : isAttacking ? 'attack' : 'idle';

    return (
        <div className="relative flex flex-col items-center">
            {/* 💬 BOSS TALK bubble (Contextual Quote) */}
            <AnimatePresence>
                {!isHit && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-16 right-0 max-w-45 z-30"
                    >
                        <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-2xl rounded-tr-none shadow-2xl backdrop-blur-md">
                            <p className="text-[9px] font-bold text-slate-300 italic leading-tight">
                                "{bossQuote}"
                            </p>
                        </div>
                        <div className="w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45 ml-auto -mt-1.5 mr-4" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 👹 THE SPRITE STACK */}
            <motion.div
                variants={enemyVariants}
                animate={currentAction}
                className="relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center z-20"
            >
                {/* Layer 0: Tactical shadow pedestal */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-950/60 rounded-full blur-xl -z-10" />

                {/* Layer 1: Glow Aura (Holographic projection effect) */}
                <div className={`absolute inset-4 rounded-full blur-3xl opacity-20 animate-pulse ${visual.glow}`} />

                {/* 🎯 Layer 2: Main Icon (Outline Aesthetic - NO fill-current) */}
                <div className={`${visual.color} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                    <Icon className="w-full h-full" size={120} strokeWidth={1.5} />
                </div>

                {/* Layer 3: Sub-Visual Core Pulse */}
                <motion.div
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <Activity className="w-1/4 h-1/4 text-white/5" />
                </motion.div>

                {/* DAMAGE FLASH OVERLAY */}
                {isHit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0] }}
                        className="absolute inset-0 bg-white/20 rounded-full blur-2xl"
                    />
                )}
            </motion.div>

            {/* BOSS IDENTITY PLATE */}
            <div className="mt-6 flex flex-col items-center gap-1">
                <div className="px-4 py-1 bg-red-500/10 border border-red-500/20 rounded-full backdrop-blur-sm">
                    <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.4em]">
                        Threat Identified
                    </p>
                </div>

                {/* 🛡️ DYNAMIC THREAT PLATE: Reacts to Boss HP Status */}
                <div className={`mt-2 px-3 py-1 ${threat.bg} border border-white/5 rounded-full shadow-lg transition-all duration-500 ${threat.pulse ? 'animate-pulse border-red-500/40' : ''}`}>
                    <p className="text-[7px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="text-slate-500">Threat Signature:</span>
                        <span className={`${threat.color} transition-colors duration-500`}>
                            {threat.label}
                        </span>
                    </p>
                </div>

                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 opacity-30">
                    Sector Guardian
                </h4>
            </div>
        </div>
    );
};