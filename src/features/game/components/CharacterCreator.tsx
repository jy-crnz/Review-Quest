'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
    Shield,
    Lock,
    CheckCircle2,
    IdCard,
    Palette,
    Zap,
    Hammer,
    ChevronRight,
    Mars,   // ✅ Technical Male Icon
    Venus,  // ✅ Technical Female Icon
    Scissors,
    Droplets,
    Eye,
    Dna
} from 'lucide-react';
import { useGameStore } from '../store';
import { PLAYER_ASSETS } from '../constants/sprites';
import { CharacterPreview } from './CharacterPreview';

/**
 * ARCHITECTURE: Asset Metadata
 * Links visual tiers to Level requirements and Forge recipes.
 */
const ARMOR_OPTIONS = [
    { id: 1, label: 'Novice Tunic', level: 1, recipeId: null },
    { id: 2, label: 'Sentinel Plate', level: 5, recipeId: 'sentinel-armor' },
    { id: 3, label: 'Vanguard Exosuit', level: 15, recipeId: 'vanguard-armor' },
    { id: 4, label: 'Overlord Regalia', level: 30, recipeId: 'overlord-armor' },
];

/** 🎨 Natural Melanin Palette */
const HAIR_COLORS = [
    { label: 'Raven', color: '#090806' },
    { label: 'Espresso', color: '#2C1B18' },
    { label: 'Walnut', color: '#4E352E' },
    { label: 'Cinnamon', color: '#8B4513' },
    { label: 'Sand', color: '#B89778' },
    { label: 'Honey', color: '#D6C4A2' },
    { label: 'Silver', color: '#918E87' },
    { label: 'White', color: '#E5E5E5' },
];

/** 💡 High-intensity neon palette for cybernetic optics */
const OPTIC_COLORS = [
    { label: 'Cyan', color: '#00f2ff' },
    { label: 'Crimson', color: '#ff003c' },
    { label: 'Lime', color: '#39ff14' },
    { label: 'Amber', color: '#ffb300' },
    { label: 'Violet', color: '#bc13fe' },
];

export const CharacterCreator = () => {
    const {
        appearance,
        playerName,
        level,
        recipes,
        updateAppearance,
        setPlayerName
    } = useGameStore();

    // Logic for visual context
    const currentSkin = PLAYER_ASSETS.skins.find(s => s.id === appearance.skinColorId) || PLAYER_ASSETS.skins[0];
    const isOverlord = appearance.armorId === 4;
    const equippedArmor = recipes.find(r => r.type === 'armor' && r.targetId === appearance.armorId);

    /**
     * 🎬 POSE ENGINE: Levitating logic for high-rank armor
     */
    const poseVariants: Variants = {
        ready: { y: 0 },
        victory: {
            y: [0, -12, 0],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in zoom-in-95 duration-700">

            {/* --- 1. CHARACTER LIVE PREVIEW (The Pedestal) --- */}
            <div className="relative group bg-slate-950/40 border border-slate-800/50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-125 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-size-[100%_4px] bg-linear-to-b from-transparent via-white/2 to-transparent pointer-events-none opacity-20" />
                <div className="absolute bottom-24 w-48 h-12 bg-blue-500/10 border border-blue-500/20 rounded-[100%] blur-sm animate-pulse" />

                <motion.div
                    variants={poseVariants}
                    animate={isOverlord ? "victory" : "ready"}
                    className="relative w-44 h-44 z-10"
                >
                    <CharacterPreview
                        appearance={appearance}
                        skinColor={currentSkin.color}
                        isOverlord={isOverlord}
                    />
                </motion.div>

                <div className="w-32 h-4 bg-slate-900/80 rounded-[100%] blur-md mt-6 opacity-40" />

                <div className="mt-8 text-center z-10">
                    <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">
                        {playerName || "NO_NAME"}
                    </h4>
                    <p className={`text-[9px] font-black uppercase tracking-[0.4em] mt-1 transition-colors duration-500 ${isOverlord ? 'text-yellow-500 animate-pulse' : 'text-blue-400/60'}`}>
                        {isOverlord ? "Ascended Overlord" : `Rank ${level} Operator`}
                    </p>
                </div>
            </div>

            {/* --- 2. CUSTOMIZATION HUB (Right Rail) --- */}
            <div className="flex flex-col space-y-6 max-h-150 overflow-y-auto no-scrollbar pr-2">

                {/* Identity Input */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 px-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <IdCard className="w-3 h-3" /> Designation
                    </label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                        placeholder="Enter Callsign..."
                    />
                </div>

                <div className="h-px bg-slate-800/40 w-full" />

                {/* --- 🧬 BIO-SIGNATURE (Gender & Skin) --- */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 px-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Zap className="w-3 h-3" /> Profile
                        </label>
                        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                            {(['male', 'female'] as const).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => updateAppearance({ gender: g })}
                                    className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer
                                        ${appearance.gender === g ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {/* ✅ Updated to Gender Icons */}
                                    {g === 'male' ? <Mars className="w-4 h-4" /> : <Venus className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 px-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Palette className="w-3 h-3" /> Skin Tone
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PLAYER_ASSETS.skins.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => updateAppearance({ skinColorId: s.id })}
                                    className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer hover:scale-110
                                        ${appearance.skinColorId === s.id ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-800'}
                                    `}
                                    style={{ backgroundColor: s.color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- 💇 NEURAL LINKAGE (Hair Style & Color) --- */}
                <div className="space-y-5 bg-slate-900/30 p-6 rounded-4xl border border-white/5 shadow-inner">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Scissors className="w-3 h-3" /> Neural Linkage (Hair)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {PLAYER_ASSETS.hairs.map((h) => (
                                <button
                                    key={h.id}
                                    onClick={() => updateAppearance({ hairId: String(h.id) })}
                                    className={`py-3 px-4 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-tight text-left flex items-center justify-between group
                                        ${appearance.hairId === String(h.id)
                                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}
                                    `}
                                >
                                    <span>{h.label}</span>
                                    {appearance.hairId === String(h.id) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Droplets className="w-3 h-3" /> Chroma Interface (Hair)
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {HAIR_COLORS.map((hc) => (
                                <button
                                    key={hc.color}
                                    onClick={() => updateAppearance({ hairColor: hc.color })}
                                    className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer
                                        ${appearance.hairColor === hc.color
                                            ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20'
                                            : 'border-slate-800'}`}
                                    style={{ backgroundColor: hc.color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- 👁️ NEURAL INTERFACE (Face Optics & Glow) --- */}
                <div className="space-y-5 bg-slate-900/30 p-6 rounded-4xl border border-white/5 shadow-inner">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Eye className="w-3 h-3" /> Neural Interface (Optics)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {PLAYER_ASSETS.faces.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => updateAppearance({ faceId: String(f.id) })}
                                    className={`py-3 px-4 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-tight text-left flex items-center justify-between group
                                        ${appearance.faceId === String(f.id)
                                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}
                                    `}
                                >
                                    <span>{f.label}</span>
                                    {appearance.faceId === String(f.id) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Droplets className="w-3 h-3" /> Chroma Interface (Optics)
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {OPTIC_COLORS.map((oc) => (
                                <button
                                    key={oc.color}
                                    onClick={() => updateAppearance({ faceColor: oc.color })}
                                    className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer shadow-sm
                                        ${appearance.faceColor === oc.color
                                            ? 'border-blue-500 scale-110 ring-4 ring-blue-500/10'
                                            : 'border-slate-800'}`}
                                    style={{
                                        backgroundColor: oc.color,
                                        boxShadow: appearance.faceColor === oc.color ? `0 0 15px ${oc.color}44` : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- 👃 NEURAL HARDWARE (Nose & Mouth) --- */}
                <div className="space-y-5 bg-slate-900/30 p-6 rounded-4xl border border-white/5 shadow-inner">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Dna className="w-3 h-3" /> Nose Architecture
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {PLAYER_ASSETS.noses.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => updateAppearance({ noseId: String(n.id) })}
                                    className={`py-3 px-4 rounded-xl border transition-all text-[10px] font-bold uppercase text-left
                                        ${appearance.noseId === String(n.id)
                                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-600'}
                                    `}
                                >
                                    {n.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Zap className="w-3 h-3" /> Vocal Interface (Mouth)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {PLAYER_ASSETS.mouths.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => updateAppearance({ mouthId: String(m.id) })}
                                    className={`py-3 px-4 rounded-xl border transition-all text-[10px] font-bold uppercase text-left
                                        ${appearance.mouthId === String(m.id)
                                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-600'}
                                    `}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🛡️ TACTICAL PLATING List */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 px-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Shield className="w-3 h-3" /> Tactical Plating
                    </label>

                    <div className="flex flex-col gap-3 pb-10">
                        {ARMOR_OPTIONS.map((a) => {
                            const recipe = recipes.find(r => r.id === a.recipeId);
                            const isLevelLocked = level < a.level;
                            const isForgeLocked = a.recipeId !== null && !recipe?.isCompiled;
                            const isLocked = isLevelLocked || isForgeLocked;
                            const isSelected = appearance.armorId === a.id;

                            return (
                                <button
                                    key={a.id}
                                    disabled={isLocked}
                                    onClick={() => updateAppearance({ armorId: a.id })}
                                    className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all group overflow-hidden
                                        ${isLocked ? 'bg-slate-950/20 border-slate-900/50 cursor-not-allowed opacity-50' : 'bg-slate-900/40 border-slate-800 cursor-pointer hover:border-blue-500/40'}
                                        ${isSelected && !isLocked ? 'border-blue-600 bg-blue-600/5 shadow-lg' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`p-2.5 rounded-xl transition-all 
                                            ${isSelected ? 'bg-blue-600 text-white' : isLocked ? 'bg-slate-900 text-slate-700' : 'bg-slate-800 text-slate-500'}`}>
                                            {isLevelLocked ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                        </div>

                                        <div className="text-left">
                                            <p className={`text-xs font-black uppercase tracking-tight ${isSelected ? 'text-white' : isLocked ? 'text-slate-600' : 'text-slate-300'}`}>
                                                {a.label}
                                            </p>

                                            <div className="mt-1">
                                                {isLevelLocked ? (
                                                    <span className="text-[7px] font-black text-red-500/80 uppercase px-1.5 py-0.5 bg-red-500/10 rounded tracking-widest">
                                                        Locked: LVL {a.level}
                                                    </span>
                                                ) : isForgeLocked ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Hammer className="w-2.5 h-2.5 text-orange-500" />
                                                        <span className="text-[7px] font-black text-orange-500 uppercase tracking-widest">Requires Forge Compilation</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[7px] font-black text-green-500 uppercase px-1.5 py-0.5 bg-green-500/10 rounded tracking-widest">
                                                        Hardware Online
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected && !isLocked && <CheckCircle2 className="w-4 h-4 text-blue-500 relative z-10" />}
                                    {!isLocked && !isSelected && (
                                        <ChevronRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-x-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};