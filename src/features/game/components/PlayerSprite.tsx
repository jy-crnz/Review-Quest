'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useGameStore } from '../store';
import { Shield, Sword, Zap, Sparkles, Crown } from 'lucide-react';
import { CharacterPreview } from './CharacterPreview';
import { PLAYER_ASSETS } from '../constants/sprites';

/**
 * COMPONENT: PlayerSprite (Ultimate Battle Edition)
 * Role: The high-fidelity visual representation of Jay's Operator in combat.
 * Logic: Overrides the Titan Zoom of the modular engine to provide standard battle framing.
 */
interface PlayerSpriteProps {
    isAttacking?: boolean;
    isHit?: boolean;
}

export const PlayerSprite = ({ isAttacking, isHit }: PlayerSpriteProps) => {
    const { appearance, playerHP, recipes } = useGameStore();

    // --- 🛡️ ARCHITECTURE: DATA RESOLUTION ---
    // Resolve the hex color for the skin to pass to the sub-engine
    const skinColor = PLAYER_ASSETS.skins.find(s => s.id === appearance.skinColorId)?.color || '#F6E4D9';

    // Resolve equipped items for VFX and stats
    const equippedArmor = recipes.find(r => r.type === 'armor' && r.targetId === appearance.armorId);
    const equippedWeapon = recipes.find(r => r.type === 'weapon' && r.targetId === appearance.weaponId);

    const isOverlord = appearance.armorId === 4;
    const isSentinel = appearance.armorId === 3;

    // --- 🎯 STABILITY HUD LOGIC ---
    const getStabilityStatus = () => {
        if (playerHP <= 0) return { label: 'DEFEATED', color: 'text-red-600', bg: 'bg-red-500/10', pulse: false };
        if (playerHP <= 30) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/20', pulse: true };
        if (playerHP <= 60) return { label: 'UNSTABLE', color: 'text-yellow-500', bg: 'bg-yellow-500/10', pulse: false };
        if (playerHP < 100) return { label: 'STABLE', color: 'text-blue-400', bg: 'bg-blue-500/10', pulse: false };
        return { label: 'OPTIMAL', color: 'text-cyan-400', bg: 'bg-cyan-500/10', pulse: false };
    };

    const status = getStabilityStatus();

    // --- 🎬 BATTLE ANIMATION VARIANTS ---
    const spriteVariants: Variants = {
        idle: {
            y: isOverlord ? [0, -6, 0] : [0, -10, 0],
            transition: {
                duration: isOverlord ? 4 : 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        attack: {
            x: [0, 80, 0],
            rotate: [0, 15, -5, 0],
            scale: [1, 1.1, 1],
            transition: { duration: 0.5, ease: "backOut" }
        },
        hit: {
            x: [0, -20, 10, 0],
            filter: ["brightness(1)", "brightness(2) saturate(0)", "brightness(1)"],
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    };

    const currentAction = isAttacking ? 'attack' : isHit ? 'hit' : 'idle';

    return (
        <div className="relative flex flex-col items-center">

            {/* 🎭 THE BATTLE STACK */}
            <motion.div
                variants={spriteVariants}
                animate={currentAction}
                className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center z-20"
            >
                {/* LAYER 0: Dynamic Shadow */}
                <motion.div
                    animate={isOverlord ? { scale: [1, 0.8, 1], opacity: [0.4, 0.2, 0.4] } : { scale: 1, opacity: 0.4 }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950/60 rounded-full blur-lg -z-10"
                />

                {/* ✅ LAYER 1: MODULAR OPERATOR (Context-Aware Battle Scale) */}
                {/* We override the Titan zoom by passing scale 1.1 and yOffset 0 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <CharacterPreview
                        appearance={appearance}
                        skinColor={skinColor}
                        isOverlord={isOverlord}
                        scale={1.4}
                        yOffset={0}
                    />
                </div>

                {/* ✅ LAYER 2: BATTLE-ONLY VFX */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-25">
                    {/* Sentinel Zap Effect */}
                    {isSentinel && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Zap className="absolute top-1/4 -left-2 w-6 h-6 text-blue-300 animate-pulse blur-sm" />
                            <Zap className="absolute bottom-1/4 -right-2 w-4 h-4 text-cyan-300 animate-bounce" />
                        </motion.div>
                    )}

                    {/* Overlord Legendary VFX */}
                    {isOverlord && (
                        <>
                            {/* Rotating Data Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute w-44 h-44 border border-dashed border-yellow-500/20 rounded-full blur-[1px]"
                            />
                            {/* Floating Crown & Sparkles */}
                            <Crown className="absolute -top-6 w-8 h-8 text-yellow-200 animate-mini-bounce drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                            <Sparkles className="absolute -bottom-2 -left-4 w-6 h-6 text-yellow-400 animate-pulse" />
                        </>
                    )}
                </div>

                {/* LAYER 3: WEAPON STRIKE OVERLAY */}
                <AnimatePresence>
                    {isAttacking && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0, x: -20, rotate: -45 }}
                            animate={{ opacity: 1, scale: 1.2, x: 20, rotate: 15 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute -right-8 top-0 z-30"
                        >
                            {equippedWeapon?.assetPath ? (
                                <img
                                    src={equippedWeapon.assetPath}
                                    className="w-20 h-20 object-contain drop-shadow-[0_0_15px_white]"
                                    alt="Weapon"
                                />
                            ) : (
                                <Sword className={`w-12 h-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] ${isOverlord ? 'text-yellow-200' : 'text-white'}`} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HIT DAMAGE FLASH */}
                {isHit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.6, 0] }}
                        className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl z-40 pointer-events-none"
                    />
                )}
            </motion.div>

            {/* 🛡️ DYNAMIC STATUS PLATE (Unit Integrity) */}
            <div className={`mt-6 px-5 py-2.5 ${status.bg} border border-white/5 rounded-xl backdrop-blur-md shadow-2xl transition-all duration-500 ${status.pulse ? 'animate-pulse border-red-500/50' : ''}`}>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.3em]">Unit Integrity</p>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${status.color}`}>
                        {status.label}
                    </p>
                </div>
            </div>
        </div>
    );
};