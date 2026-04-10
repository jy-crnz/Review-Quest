'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Cat, Dog, Bird, Egg,
    Sword, Wand2, GraduationCap,
    Sparkles, Heart
} from 'lucide-react';
import { useGameStore } from '../store';
import { PetType } from '@/lib/schemas';

/**
 * COMPONENT: StudyBuddy
 * Role: A reactive visual companion that reflects player progress.
 * Logic: 
 * - Equips hats based on Stats (Viking/Wizard/Scholar).
 * - Plays subject-specific audio from /public/assets/audio/pet/ on Level Up.
 * - Prevents audio trigger on initial mount using prevLevelRef.
 */
export const StudyBuddy = () => {
    const { selectedPet, stats, level } = useGameStore();
    const [isReacting, setIsReacting] = useState(false);

    // 🛡️ Engineering Standard: Track previous level to ensure 
    // audio only plays on a REAL level increase, not on mount.
    const prevLevelRef = useRef(level);

    // 1. REACTION ENGINE: Audio & Visuals
    useEffect(() => {
        // Trigger only if current level is higher than the last known level
        if (level > prevLevelRef.current) {
            setIsReacting(true);

            // --- THE VOICE ENGINE ---
            const soundMap: Record<PetType, string> = {
                cat: '/assets/audio/pet/purr.mp3',
                dog: '/assets/audio/pet/bark.mp3',
                bird: '/assets/audio/pet/chirp.mp3',
                owl: '/assets/audio/pet/owlchirp.mp3', // Fallback for owl
            };

            const playLevelUpSound = async () => {
                // 1. Identify the source
                const soundMap: Record<PetType, string> = {
                    cat: '/assets/audio/pet/purr.mp3',
                    dog: '/assets/audio/pet/bark.mp3',
                    bird: '/assets/audio/pet/chirp.mp3',
                    owl: '/assets/audio/pet/owlchirp.mp3',
                };

                try {
                    const audio = new Audio(soundMap[selectedPet]);
                    audio.volume = 0.4;

                    // 2. 🛡️ The Shield: audio.play() returns a promise. 
                    // If the user hasn't clicked yet, this promise will REJECT.
                    await audio.play();

                } catch (err: any) {
                    // 3. Instead of a red error, we log a helpful hint or just stay silent.
                    if (err.name === 'NotAllowedError') {
                        console.warn("🐾 Companion: 'I wanted to purr, but I need you to click the page first!'");
                    } else {
                        console.error("🐾 Companion Voice Error:", err);
                    }
                }
            };

            playLevelUpSound();

            const timer = setTimeout(() => setIsReacting(false), 3000);
            prevLevelRef.current = level;
            return () => clearTimeout(timer);
        }

        // Keep ref in sync if levels are equal or reset
        prevLevelRef.current = level;
    }, [level, selectedPet]);

    // 2. LOGIC: Equipment Selection (Derived State)
    const equipment = useMemo(() => {
        const { attack, defense } = stats;
        if (attack === 0 && defense === 0) return null;

        if (attack > defense) return {
            icon: Sword,
            color: 'text-red-500',
            label: 'Viking',
            class: '-rotate-45 -translate-x-1'
        };

        if (defense > attack) return {
            icon: Wand2,
            color: 'text-purple-400',
            label: 'Wizard',
            class: 'rotate-12 translate-x-1'
        };

        return {
            icon: GraduationCap,
            color: 'text-blue-400',
            label: 'Scholar',
            class: 'translate-y-[-2px]'
        };
    }, [stats]);

    // 3. LOGIC: Visual Mapping
    const PET_SOUNDS: Record<PetType, string> = {
        cat: 'Purr...',
        dog: 'Woof!',
        bird: 'Chirp!',
        owl: 'Hoot!'
    };

    const PetIcon = useMemo(() => {
        switch (selectedPet) {
            case 'dog': return Dog;
            case 'bird': return Bird;
            case 'owl': return Egg;
            default: return Cat;
        }
    }, [selectedPet]);

    const reactionText = PET_SOUNDS[selectedPet] || 'Yay!';

    return (
        <div className="relative group flex flex-col items-center select-none">

            {/* --- HAT LAYER --- */}
            <div className="absolute -top-4 z-10 transition-all duration-500 ease-out">
                {equipment && (
                    <div className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] animate-bounce-subtle">
                        <equipment.icon
                            className={`w-7 h-7 ${equipment.color} fill-current ${equipment.class}`}
                        />
                    </div>
                )}
            </div>

            {/* --- PET BODY --- */}
            <div className={`
                relative p-4 rounded-3xl border-2 transition-all duration-500
                ${isReacting
                    ? 'scale-110 border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                    : 'border-slate-800 bg-slate-900/40 backdrop-blur-md group-hover:border-slate-600'}
            `}>
                <PetIcon
                    className={`w-10 h-10 transition-colors duration-500 ${isReacting ? 'text-pink-400' : 'text-slate-300 group-hover:text-white'
                        }`}
                />

                {/* Level Up Sparkles & Text Popup */}
                {isReacting && (
                    <>
                        <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-pulse" />
                        <div className="absolute -left-12 top-0 flex flex-col items-end">
                            <span className="bg-pink-500 text-white text-[9px] font-black px-2 py-1 rounded-full animate-float-up-fade uppercase tracking-tighter shadow-lg">
                                {reactionText}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* --- BASE / SHADOW --- */}
            <div className="mt-2 text-center">
                <div className="h-1.5 w-10 bg-black/40 rounded-full blur-xs mx-auto" />
                <p className="mt-1 text-[7px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    {equipment?.label || 'Novice'} Companion
                </p>
            </div>

            {/* Hidden Stat Tooltip on Hover */}
            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg pointer-events-none z-50">
                <p className="text-[8px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-widest">
                    ATK {stats.attack} | DEF {stats.defense}
                </p>
            </div>
        </div>
    );
};