'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Crown } from 'lucide-react';
import { SPRITE_ASSETS, PLAYER_ASSETS } from '../constants/sprites';

interface CharacterPreviewProps {
    appearance: {
        gender: 'male' | 'female';
        skinColorId: number;
        hairId: string;
        hairColor: string;
        faceId: string;      // Modular Optics
        faceColor: string;   // Optic Glow
        noseId: string;      // Modular Nose
        mouthId: string;     // Modular Mouth
        armorId: number;
    };
    skinColor: string;
    isOverlord: boolean;
    equippedArmorAsset?: string | null;
    scale?: number;
    yOffset?: number;
}

/**
 * ARCHITECTURE: High-Fidelity Modular Engine (Precision Calibration Build)
 * * COORDINATE SYSTEM: Normalized to 1189x649 viewbox.
 * * ASSET NOTE: Armor PNGs are pre-masked in Photoshop to allow neck visibility.
 * * FIX: Switched to relative positioning + top for armor nudging to ensure movement.
 */
export const CharacterPreview = ({
    appearance,
    skinColor,
    isOverlord,
    equippedArmorAsset,
    scale = 2,      // Jay's Titan Scale
    yOffset = 7     // Jay's Framing Calibration
}: CharacterPreviewProps) => {

    // --- 1. METADATA LOOKUP ---
    const hairMeta = (PLAYER_ASSETS.hairs || []).find(h => String(h.id) === appearance.hairId);
    const faceMeta = (PLAYER_ASSETS.faces || []).find(f => String(f.id) === appearance.faceId);
    const noseMeta = (PLAYER_ASSETS.noses || []).find(n => String(n.id) === appearance.noseId);
    const mouthMeta = (PLAYER_ASSETS.mouths || []).find(m => String(m.id) === appearance.mouthId);

    // --- ✅ UPDATED: ARMOR CALIBRATION ---
    // Number() ensures we match the ID regardless of it being a string or number in the store.
    // Negative = Move UP | Positive = Move DOWN
    // Start with -15 and adjust as needed.
    const armorNudge = Number(appearance.armorId) === 3 ? -25 : 0;

    // --- 2. CALIBRATION CONSTANTS ---
    const hairY = hairMeta?.yOffset ?? -150;
    const hairS = hairMeta?.scale ?? 1;
    const faceY = faceMeta?.yOffset ?? -75;
    const faceS = faceMeta?.scale ?? 1;
    const noseY = noseMeta?.yOffset ?? -60;
    const noseS = noseMeta?.scale ?? 1;
    const mouthY = mouthMeta?.yOffset ?? -55;
    const mouthS = mouthMeta?.scale ?? 1;

    // --- 3. ARMOR ASSET ROUTING ---
    const armorImgSrc = (SPRITE_ASSETS as any).armorImages?.[appearance.armorId]?.[appearance.gender];
    const armorPath = (SPRITE_ASSETS as any).armors?.[appearance.armorId]?.[appearance.gender] || "";

    // The Sentinel Plate (ID 3) and others might be PNGs or SVGs.
    // Let's ensure we check both.
    const finalArmorAsset = equippedArmorAsset || armorImgSrc;

    // --- 4. DESIGN TOKENS ---
    const neutralLineColor = "rgba(0,0,0,0.3)";
    const anatomyShadowColor = "rgba(0,0,0,0.12)";
    const hairDetailColor = "rgba(0,0,0,0.2)";
    const jawShadowColor = "rgba(0,0,0,0.25)";

    return (
        <div className="relative w-full h-full z-10 flex items-center justify-center overflow-hidden">

            {/* --- ✅ DYNAMIC VIEWPORT (TITAN ZOOM) --- */}
            <div
                className="relative w-full h-full origin-center transition-transform duration-500"
                style={{
                    transform: `scale(${scale}) translateY(${yOffset}px)`
                }}
            >

                {/* --- LAYER 0: BASE BODY Foundation --- */}
                <motion.div
                    key={`body-${appearance.gender}`}
                    className="absolute inset-0 flex items-center justify-center z-0"
                >
                    <svg viewBox="0 0 1189 649" className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <path
                            d={SPRITE_ASSETS.bodies[appearance.gender]}
                            fill={skinColor}
                            className="transition-colors duration-700 ease-in-out"
                        />
                        <path
                            d={(SPRITE_ASSETS as any).anatomy?.[appearance.gender] || ""}
                            fill={anatomyShadowColor}
                        />
                    </svg>
                </motion.div>

                {/* --- LAYER 1: TACTICAL PLATING --- */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <AnimatePresence mode="wait">
                        {finalArmorAsset ? (
                            <motion.img
                                key={`armor-png-${appearance.armorId}-${appearance.gender}`}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                src={finalArmorAsset}
                                className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(0,0,0,0.4)]"
                                // ✅ FORCE MOVE: Use relative + top to bypass Flexbox centering
                                style={{ position: 'relative', top: `${armorNudge}px` }}
                                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                            />
                        ) : armorPath ? (
                            <motion.div
                                key={`armor-svg-${appearance.armorId}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full h-full flex items-center justify-center"
                                // ✅ FORCE MOVE: Applied to the SVG wrapper
                                style={{ position: 'relative', top: `${armorNudge}px` }}
                            >
                                <svg viewBox="0 0 1189 649" className="w-full h-full">
                                    <path
                                        d={armorPath}
                                        fill="#1e293b"
                                        stroke={isOverlord ? "#fbbf24" : "#38bdf8"}
                                        strokeWidth="1.5"
                                        className="transition-all duration-700"
                                        style={{ filter: `drop-shadow(0 0 10px ${isOverlord ? 'rgba(251, 191, 36, 0.4)' : 'rgba(56, 189, 248, 0.3)'})` }}
                                    />
                                </svg>
                            </motion.div>
                        ) : (
                            <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex items-center justify-center opacity-20">
                                {Number(appearance.armorId) === 1 && <Shield className="w-20 h-20 text-blue-400/40" />}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- LAYER 2: NECK FILL (Skin Fill behind the head) --- */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
                    <svg viewBox="0 0 1189 649" className="w-full h-full">
                        <path
                            d={(SPRITE_ASSETS as any).necks?.[appearance.gender] || ""}
                            fill={skinColor}
                            className="transition-colors duration-700"
                        />
                    </svg>
                </div>

                {/* --- LAYER 3: JAWLINE DEPTH --- */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-18">
                    <svg viewBox="0 0 1189 649" className="w-full h-full">
                        <path
                            d={(SPRITE_ASSETS as any).jawlines?.[appearance.gender] || ""}
                            fill="none"
                            stroke={jawShadowColor}
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{ filter: 'blur(2px)' }}
                        />
                    </svg>
                </div>

                {/* --- LAYER 4: FACIAL HARDWARE --- */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <svg viewBox="0 0 1189 649" className="w-full h-full">
                        <g transform={`translate(270, ${mouthY}) scale(${mouthS})`} style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
                            <path
                                d={SPRITE_ASSETS.mouths[appearance.mouthId as keyof typeof SPRITE_ASSETS.mouths] || ""}
                                fill="none"
                                stroke={neutralLineColor}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </g>
                        <g transform={`translate(270, ${noseY}) scale(${noseS})`} style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
                            <path
                                d={SPRITE_ASSETS.noses[appearance.noseId as keyof typeof SPRITE_ASSETS.noses] || ""}
                                fill="none"
                                stroke={neutralLineColor}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </g>
                    </svg>
                </div>

                {/* --- LAYER 5: NEURAL INTERFACE (OPTICS) --- */}
                <motion.div
                    key={`face-${appearance.faceId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-24"
                >
                    <svg viewBox="0 0 1189 649" className="w-full h-full">
                        <defs>
                            <filter id="optics-glow-master" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        <g transform={`translate(270, ${faceY}) scale(${faceS})`} style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
                            <path
                                d={SPRITE_ASSETS.faces[appearance.faceId as keyof typeof SPRITE_ASSETS.faces] || ""}
                                fill={appearance.faceColor}
                                filter="url(#optics-glow-master)"
                                className="transition-colors duration-500"
                            />
                        </g>
                    </svg>
                </motion.div>

                {/* --- LAYER 6: NEURAL LINKAGE (HAIR) --- */}
                <motion.div
                    key={`hair-${appearance.hairId}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-30"
                >
                    <svg viewBox="0 0 1189 649" className="w-full h-full drop-shadow-md">
                        <g transform={`translate(270, ${hairY}) scale(${hairS})`} style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
                            <path
                                d={SPRITE_ASSETS.hair[appearance.hairId as keyof typeof SPRITE_ASSETS.hair] || ""}
                                fill={appearance.hairColor}
                                className="transition-colors duration-500"
                            />
                            <path
                                d={(SPRITE_ASSETS as any).hairDetails?.[appearance.hairId] || ""}
                                fill={hairDetailColor}
                                className="transition-all duration-500"
                            />
                        </g>
                    </svg>
                </motion.div>

            </div>

            {/* --- OVERLORD RADIANCE AURA --- */}
            {isOverlord && (
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-yellow-500/10 blur-[60px] rounded-full -z-10"
                />
            )}
        </div>
    );
};