'use client';

import React, { useState, useRef } from 'react';
import { Upload, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store';

/**
 * COMPONENT: IntelScanner
 * Role: Functional File Gateway.
 * Logic: Stylish Button -> Triggers Hidden Input -> Store Update.
 */
export const IntelScanner = () => {
    const { setPendingText } = useGameStore(); // 🎯 Connect to sandbox state
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Trigger the hidden file picker
    const triggerPicker = () => {
        fileInputRef.current?.click();
    };

    // 2. Handle the file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        try {
            // NOTE: Here is where you integrate your PDF extraction logic
            // For now, we simulate the 'reading' process
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;

                // 🎯 Architecture Bridge: Move data to the store's sandbox
                // In a real app, use a PDF library here to get the raw text
                setPendingText("Extracted Intel from: " + file.name);

                setIsProcessing(false);
            };
            reader.readAsText(file);
        } catch (error) {
            console.error("Scanner Malfunction:", error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-12">
            {/* 🛡️ THE SECRET GEARS: Hidden browser input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt"
                className="hidden"
            />

            <button
                onClick={triggerPicker}
                disabled={isProcessing}
                className="group relative w-full p-10 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-4xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer overflow-hidden shadow-2xl"
            >
                <div className="relative z-10 flex flex-col items-center gap-4">
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">
                                Decrypting Intel...
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="p-5 bg-slate-800 rounded-2xl group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500 shadow-xl">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-white" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                    Initialize Uplink
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2 group-hover:text-blue-400 transition-colors">
                                    Drop PDF or Click to Begin Scan
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </button>
        </div>
    );
};