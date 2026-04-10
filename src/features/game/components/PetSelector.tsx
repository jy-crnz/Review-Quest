'use client';

import React from 'react';
import { Cat, Dog, Bird, Egg, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { useGameStore } from '../store';
import { PetType } from '@/lib/schemas';

/**
 * COMPONENT: PetSelector
 * Role: Tactical companion recruitment.
 * Features: 
 * - Sound Previews on click.
 * - Onboarding "Confirm" mode.
 * - Responsive grid layout.
 */
export const PetSelector = ({ isOnboarding = false }: { isOnboarding?: boolean }) => {
    const { selectedPet, setPetType, completeOnboarding } = useGameStore();

    // Configuration for available pets
    const companions: { type: PetType; label: string; icon: any; bio: string }[] = [
        {
            type: 'cat',
            label: 'The Scholar Cat',
            icon: Cat,
            bio: 'Purrs during long study sessions. Prefers quiet environments.'
        },
        {
            type: 'dog',
            label: 'The Hype Dog',
            icon: Dog,
            bio: 'High energy. Will celebrate every XP gain with a bark!'
        },
        {
            type: 'bird',
            label: 'The Intel Bird',
            icon: Bird,
            bio: 'Quick eyes. Great for spotting small details in PDFs.'
        },
        {
            type: 'owl',
            label: 'The Wise Owl',
            icon: Egg,
            bio: 'A nocturnal guardian for late-night review marathons.'
        },
    ];

    /**
     * FEATURE: Sound Preview
     * Plays the pet's unique voice when they are selected in the menu.
     */
    const playPreviewSound = (type: PetType) => {
        const soundMap: Record<PetType, string> = {
            cat: '/assets/audio/pet/purr.mp3',
            dog: '/assets/audio/pet/bark.mp3',
            bird: '/assets/audio/pet/chirp.mp3',
            owl: '/assets/audio/pet/owlchirp.mp3',
        };

        try {
            const audio = new Audio(soundMap[type]);
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Silently catch autoplay blocks
                console.log("Sound preview buffered.");
            });
        } catch (err) {
            console.warn("Audio preview failed", err);
        }
    };

    const handleSelect = (type: PetType) => {
        setPetType(type);
        playPreviewSound(type);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            {/* --- HEADER --- */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">
                        {isOnboarding ? "Initial Recruitment" : "Squad Assembly"}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {isOnboarding ? "Choose your first tactical companion" : "Select your moral support companion"}
                    </p>
                </div>
            </div>

            {/* --- GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companions.map((pet) => {
                    const isActive = selectedPet === pet.type;
                    const Icon = pet.icon;

                    return (
                        <button
                            key={pet.type}
                            onClick={() => handleSelect(pet.type)}
                            className={`
                                relative p-6 rounded-4xl border-2 text-left transition-all duration-300 group cursor-pointer
                                ${isActive
                                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15)]'
                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'}
                            `}
                        >
                            {/* Selection Indicator */}
                            {isActive && (
                                <div className="absolute top-4 right-4 p-1 bg-blue-500 rounded-full animate-in zoom-in duration-300">
                                    <Check className="w-3 h-3 text-white stroke-4" />
                                </div>
                            )}

                            <div className="flex items-start gap-5">
                                {/* Pet Visual */}
                                <div className={`
                                    p-4 rounded-2xl transition-all duration-500
                                    ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}
                                `}>
                                    <Icon className="w-8 h-8" />
                                </div>

                                {/* Pet Text */}
                                <div className="space-y-1">
                                    <h4 className={`text-sm font-black uppercase tracking-tight transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                        {pet.label}
                                    </h4>
                                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                                        {pet.bio}
                                    </p>
                                </div>
                            </div>

                            {/* Hover "Juice" Effect */}
                            <div className={`
                                absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-blue-500 rounded-t-full transition-all duration-300
                                ${isActive ? 'w-1/2 opacity-100' : 'w-0 opacity-0 group-hover:w-1/4 group-hover:opacity-50'}
                            `} />
                        </button>
                    );
                })}
            </div>

            {/* --- ONBOARDING CONFIRMATION --- */}
            {isOnboarding ? (
                <button
                    onClick={completeOnboarding}
                    className="group w-full py-5 bg-white hover:bg-blue-600 text-black hover:text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
                >
                    <ShieldCheck className="w-5 h-5" />
                    Deploy with {selectedPet}
                </button>
            ) : (
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        Companion Active: {selectedPet} is synced to your profile.
                    </p>
                </div>
            )}
        </div>
    );
};