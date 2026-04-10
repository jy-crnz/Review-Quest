'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Zap, Brain, Loader2, XCircle } from 'lucide-react';
import { useGameStore, type QuizType } from '../store';

/**
 * COMPONENT: ModeSelector
 * Role: Bridges the gap between scanned text and active battle.
 * Features: Integrated loading states, RPG-tier hover juice, and API synchronization.
 */
export const ModeSelector = () => {
    const { pendingExtractedText, setQuiz } = useGameStore();
    const [loading, setLoading] = useState<QuizType | null>(null);

    const startEncounter = async (type: QuizType) => {
        if (!pendingExtractedText) return;
        setLoading(type);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: pendingExtractedText, quizType: type }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // 🎯 Success: Generates the procedural node and starts battle
            setQuiz(data, type);
        } catch (err) {
            console.error("Uplink Error:", err);
            alert("The AI Boss jammed the frequency. Re-initialize scan.");
        } finally {
            setLoading(null);
        }
    };

    if (!pendingExtractedText) return null;

    return (
        <div className="w-full space-y-8 py-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Text */}
            <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-px w-8 bg-blue-500/30" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Intel Scanned</span>
                    <div className="h-px w-8 bg-blue-500/30" />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Select Encounter Protocol</h3>
            </div>

            {/* Mode Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ModeCard
                    title="Skirmish"
                    mode="Multiple Choice"
                    icon={<Sword />}
                    isLoading={loading === 'multiple-choice'}
                    isLocked={!!loading && loading !== 'multiple-choice'}
                    onClick={() => startEncounter('multiple-choice')}
                />
                <ModeCard
                    title="Logic Gate"
                    mode="True / False"
                    icon={<Zap />}
                    isLoading={loading === 'true-false'}
                    isLocked={!!loading && loading !== 'true-false'}
                    onClick={() => startEncounter('true-false')}
                />
                <ModeCard
                    title="Deep Abyss"
                    mode="Enumeration"
                    icon={<Brain />}
                    isLoading={loading === 'enumeration'}
                    isLocked={!!loading && loading !== 'enumeration'}
                    onClick={() => startEncounter('enumeration')}
                />
            </div>

            {/* Cancel Trigger (As seen in your screenshot) */}
            {!loading && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => useGameStore.setState({ pendingExtractedText: null, activeDungeonId: null })}
                        className="group flex items-center gap-2 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <XCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Cancel Selection</span>
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * SUB-COMPONENT: ModeCard
 * Handles the internal "Juice" and loading state transformations.
 */
const ModeCard = ({ title, mode, icon, onClick, isLoading, isLocked }: any) => (
    <motion.button
        onClick={onClick}
        disabled={isLoading || isLocked}
        whileHover={!isLocked ? { y: -5, scale: 1.02 } : {}}
        whileTap={!isLocked ? { scale: 0.98 } : {}}
        className={`
            relative p-8 rounded-4xl border-2 text-left transition-all duration-300 overflow-hidden cursor-pointer
            ${isLoading
                ? 'bg-slate-900 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                : isLocked
                    ? 'bg-slate-950/50 border-slate-900 opacity-20 grayscale cursor-not-allowed'
                    : 'bg-slate-900/50 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 shadow-xl'
            }
        `}
    >
        {/* Animated Loading Bar */}
        {isLoading && (
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                className="absolute bottom-0 left-0 h-1 bg-blue-500 shadow-[0_0_10px_#3b82f6]"
            />
        )}

        {/* Icon logic: Swaps for spinner when loading */}
        <div className={`
            p-4 rounded-2xl w-fit mb-6 transition-all duration-500
            ${isLoading ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-blue-400 group-hover:bg-slate-700 group-hover:text-white border border-blue-500/10'}
        `}>
            {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
                React.cloneElement(icon, { size: 24 })
            )}
        </div>

        <div className="space-y-1">
            <h4 className={`font-black uppercase text-sm tracking-widest transition-colors ${isLoading ? 'text-white' : 'text-slate-200'}`}>
                {title}
            </h4>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                {mode}
            </p>
        </div>

        {/* Decorative corner glow */}
        <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl transition-opacity duration-500 ${isLoading ? 'bg-blue-500/20 opacity-100' : 'bg-blue-500/5 opacity-0'}`} />
    </motion.button>
);