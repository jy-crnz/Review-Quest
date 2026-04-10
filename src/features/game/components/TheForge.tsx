'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hammer,
    Cpu,
    Shield,
    Zap,
    Database,
    Package,
    Check,
    Lock,
    Binary,
    AlertCircle,
    Swords,
    ShieldCheck,
    TrendingUp,
    Sparkles,
    Settings,
    CheckCircle2,
    LucideIcon
} from 'lucide-react';
import { useGameStore, type FragmentType } from '../store';

/**
 * ARCHITECTURE: The Neural Forge (Ultimate Integrity Version)
 * Fix: Absolute Centering Fix. Wrapped Icon + Text in a flex-container to prevent drifting.
 * Features: Success notifications, multi-stat badges, AI asset rendering, material HUD.
 */
export const TheForge = () => {
    const { inventory, recipes, compileItem } = useGameStore();

    // UI State
    const [selectedId, setSelectedId] = useState<string>(recipes[0]?.id);
    const [isCrafting, setIsCrafting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const selectedRecipe = recipes.find(r => r.id === selectedId) || recipes[0];

    // Logic
    const canAfford = selectedRecipe && Object.entries(selectedRecipe.requirements || {}).every(
        ([type, req]) => (inventory[type as FragmentType] || 0) >= (req || 0)
    );

    const handleCompile = async () => {
        if (!canAfford || selectedRecipe?.isCompiled || isCrafting) return;
        setIsCrafting(true);
        await new Promise(res => setTimeout(res, 1000));
        compileItem(selectedRecipe.id);
        await new Promise(res => setTimeout(res, 1500));
        setIsCrafting(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (!selectedRecipe) return null;

    return (
        <div className="flex flex-col space-y-8 animate-in fade-in zoom-in-95 duration-700 relative">

            {/* --- 📦 MATERIAL HUD --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MaterialCard type="hardened_plate" count={inventory.hardened_plate} icon={Shield} color="blue" />
                <MaterialCard type="neural_link" count={inventory.neural_link} icon={Cpu} color="purple" />
                <MaterialCard type="power_core" count={inventory.power_core} icon={Zap} color="yellow" />
                <MaterialCard type="data_shard" count={inventory.data_shard} icon={Database} color="cyan" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* --- 📑 BLUEPRINT DIRECTORY --- */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                            <Binary className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Registry</span>
                        </div>
                        <Settings className="w-3 h-3 text-slate-800" />
                    </div>

                    <div className="space-y-3 max-h-125 overflow-y-auto no-scrollbar pr-1">
                        {recipes.map((recipe) => (
                            <button
                                key={recipe.id}
                                onClick={() => !isCrafting && setSelectedId(recipe.id)}
                                disabled={isCrafting}
                                className={`w-full group relative p-5 rounded-3xl border-2 transition-all duration-500 text-left overflow-hidden cursor-pointer
                                    ${selectedId === recipe.id
                                        ? 'bg-blue-600 border-blue-400 shadow-[0_20px_40px_rgba(37,99,235,0.25)] translate-x-1'
                                        : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-800/60'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex-1">
                                        <p className={`text-xs font-black uppercase tracking-tight ${selectedId === recipe.id ? 'text-white' : 'text-slate-300'}`}>
                                            {recipe.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${selectedId === recipe.id ? 'bg-white/20 text-white' : 'bg-slate-950 text-slate-500'}`}>
                                                {recipe.type}
                                            </span>
                                            {recipe.bonuses?.attack && <span className="text-[8px] font-black text-red-500/80">+{recipe.bonuses.attack} ATK</span>}
                                            {recipe.bonuses?.defense && <span className="text-[8px] font-black text-green-500/80">+{recipe.bonuses.defense} DEF</span>}
                                        </div>
                                    </div>
                                    {recipe.isCompiled ? (
                                        <div className={`p-1.5 rounded-full ${selectedId === recipe.id ? 'bg-white text-blue-600' : 'bg-green-500/20 text-green-500'}`}>
                                            <Check className="w-3 h-3 stroke-3" />
                                        </div>
                                    ) : (
                                        <Lock className={`w-3.5 h-3.5 ${selectedId === recipe.id ? 'text-blue-200' : 'text-slate-700'}`} />
                                    )}
                                </div>
                                {selectedId === recipe.id && (
                                    <motion.div layoutId="forge-active" className="absolute inset-0 bg-linear-to-r from-white/5 via-transparent to-transparent pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- 🏗️ THE CONSTRUCTION BAY --- */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col items-center min-h-137.5">

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3b82f6_0.5%,transparent_70%)] opacity-10 pointer-events-none" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[40px_40px]" />

                        <AnimatePresence mode="wait">
                            {isCrafting ? (
                                <CraftingOverlay key="crafting" name={selectedRecipe.name} assetPath={selectedRecipe.assetPath} />
                            ) : (
                                <motion.div
                                    key={selectedRecipe.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    className="w-full flex flex-col items-center relative z-10"
                                >
                                    {/* 📦 THE ITEM PREVIEW STAGE */}
                                    <div className="relative mb-12 group">
                                        <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
                                        <div className="relative w-56 h-56 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t border-b border-blue-500/20 rounded-full scale-110" />
                                            <div className="relative w-48 h-48 flex items-center justify-center">
                                                {(selectedRecipe.assetPath || (selectedRecipe.id === 'sentinel-armor' ? '/assets/armor/sentinel_armor.png' : null)) ? (
                                                    <motion.img
                                                        src={selectedRecipe.assetPath || '/assets/armor/sentinel_armor.png'}
                                                        className={`w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-1000 ${selectedRecipe.isCompiled ? 'grayscale-0 brightness-110' : 'grayscale brightness-50'}`}
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                    />
                                                ) : (
                                                    <Package className="w-20 h-20 text-blue-500 opacity-20" />
                                                )}
                                            </div>
                                            {selectedRecipe.isCompiled && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 bg-green-500 text-black p-3 rounded-2xl shadow-2xl z-20">
                                                    <CheckCircle2 className="w-6 h-6 font-black" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3">{selectedRecipe.name}</h2>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">{selectedRecipe.description}</p>
                                    </div>

                                    {/* 📊 PERFORMANCE SPECS */}
                                    <div className="flex gap-4 mb-12 flex-wrap justify-center">
                                        {selectedRecipe.bonuses?.attack && <StatBadge icon={<Swords className="w-3.5 h-3.5" />} label="DMG_OUT" value={`+${selectedRecipe.bonuses.attack}`} color="red" />}
                                        {selectedRecipe.bonuses?.defense && <StatBadge icon={<ShieldCheck className="w-3.5 h-3.5" />} label="SYS_STB" value={`+${selectedRecipe.bonuses.defense}`} color="green" />}
                                        {selectedRecipe.bonuses?.xpBoost && <StatBadge icon={<TrendingUp className="w-3.5 h-3.5" />} label="XP_LNK" value={`+${selectedRecipe.bonuses.xpBoost}%`} color="yellow" />}
                                    </div>

                                    {/* 🛠️ HARDWARE REQUIREMENTS */}
                                    <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                                        {Object.entries(selectedRecipe.requirements || {}).map(([type, req]) => {
                                            const has = inventory[type as FragmentType] || 0;
                                            const isMet = has >= (req || 0);
                                            const progress = Math.min(100, (has / (req || 1)) * 100);
                                            return (
                                                <div key={type} className="space-y-2 group/req">
                                                    <div className="flex justify-between items-end">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isMet ? 'text-green-400' : 'text-slate-500'}`}>{type.replace('_', ' ')}</span>
                                                        <span className="text-[10px] font-bold text-white">{has} <span className="text-slate-600">/ {req}</span></span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full transition-all duration-1000 ${isMet ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-blue-600 opacity-50'}`} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* 🎯 THE FIX: CONSOLIDATED INNER WRAPPER */}
                                    <div className="w-full max-w-md mt-auto">
                                        <button
                                            disabled={selectedRecipe.isCompiled || !canAfford}
                                            onClick={handleCompile}
                                            className={`
                                                w-full py-6 rounded-4xl transition-all duration-300 relative overflow-hidden shadow-2xl
                                                flex items-center justify-center 
                                                ${selectedRecipe.isCompiled
                                                    ? 'bg-green-500/10 border-2 border-green-500/20 text-green-500 cursor-default'
                                                    : canAfford
                                                        ? 'bg-white text-slate-950 hover:scale-[1.02] active:scale-95 cursor-pointer'
                                                        : 'bg-slate-800/50 text-slate-700 border-2 border-slate-800 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            {/* 🎯 WRAPPER: This div locks the icon and text together in the center */}
                                            <div className="flex items-center gap-4">
                                                {selectedRecipe.isCompiled ? (
                                                    <Check className="w-6 h-6 stroke-[3px]" />
                                                ) : (
                                                    canAfford
                                                        ? <Hammer className="w-6 h-6 animate-bounce text-slate-950" />
                                                        : <AlertCircle className="w-6 h-6 text-slate-700" />
                                                )}

                                                <span className="font-black uppercase text-xs tracking-[0.3em] text-center leading-tight">
                                                    {selectedRecipe.isCompiled
                                                        ? 'Hardware Online'
                                                        : (canAfford ? 'Initialize Compilation' : 'Insufficient Resources')
                                                    }
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- 🔔 GLOBAL SUCCESS NOTIFICATION --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center gap-3 whitespace-nowrap max-w-max"
                    >
                        <Sparkles className="w-4 h-4" />
                        System Integration Complete
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const MaterialCard = ({ type, count, icon: Icon, color }: { type: string, count: number, icon: LucideIcon, color: string }) => {
    const colors: Record<string, string> = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-yellow-500/5',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/5'
    };
    return (
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-4xl flex items-center gap-4 transition-all hover:border-white/10 group cursor-default shadow-xl">
            <div className={`p-2.5 rounded-xl border transition-all group-hover:scale-110 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">{type.replace('_', ' ')}</p>
                <p className="text-xl font-black text-white leading-none tracking-tighter">{count}</p>
            </div>
        </div>
    );
};

const StatBadge = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: 'red' | 'green' | 'yellow' }) => {
    const colors = {
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        green: 'text-green-400 bg-green-500/10 border-green-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    };
    return (
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all hover:scale-105 ${colors[color]}`}>
            {icon}
            <div className="flex flex-col text-left">
                <span className="text-[6px] font-black uppercase tracking-tighter opacity-70 leading-none mb-1">{label}</span>
                <span className="text-xs font-black leading-none">{value}</span>
            </div>
        </div>
    );
};

const CraftingOverlay = ({ name, assetPath }: { name: string, assetPath?: string }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full space-y-8 py-20">
        <div className="relative">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full shadow-[0_0_50px_rgba(59,130,246,0.3)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center">
                {assetPath ? (
                    <motion.img 
                        src={assetPath} 
                        className="w-full h-full object-contain brightness-125 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                ) : (
                    <Hammer className="w-12 h-12 text-white animate-pulse" />
                )}
            </div>
        </div>
        <div className="text-center">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 animate-pulse">Forging Hardware</h3>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.4em]">{name}</p>
        </div>
    </motion.div>
);