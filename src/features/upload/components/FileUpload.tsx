'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/features/game/store';
import { motion } from 'framer-motion';

/**
 * Upload Layer: Intel Scanner
 * Architecture: Handles raw extraction. Passes text to the store for mode selection.
 * Feature: Supports standard dungeon nodes and the 'DEBUG_SECTOR' virtual node.
 */
export const FileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🛡️ Store Integration
    const { setPendingText, dungeons, activeDungeonId, setActiveDungeon } = useGameStore();

    // Determine target name (Real Dungeon or Virtual Debug Sector)
    const activeDungeon = dungeons.find(d => d.id === activeDungeonId);
    const displayName = activeDungeonId === 'DEBUG_SECTOR' ? 'DEBUG SECTOR' : (activeDungeon?.name || 'Analysis');

    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Boundary Validation (Type). The server re-checks the real file contents.
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
            setStatus('error');
            setErrorMsg("Incompatible Intel. Use a PDF file.");
            return;
        }

        // 2. Boundary Validation (Size)
        if (file.size > MAX_FILE_SIZE) {
            setStatus('error');
            setErrorMsg(`Intel too dense. Max 20MB.`);
            return;
        }

        setIsUploading(true);
        setStatus('idle');
        setErrorMsg('');

        try {
            // 3. Data Packaging
            const formData = new FormData();
            formData.append('file', file);

            // 4. Transmission
            const response = await fetch('/api/extract', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                const message = typeof data.error === 'string' ? data.error : data.error?.message;
                throw new Error(message || "Intel Extraction Interrupted.");
            }

            // 5. Sandbox Sync
            setPendingText(data.extractedText);
            setStatus('success');
        } catch (error: any) {
            console.error("Extraction Layer Crash:", error);
            setStatus('error');
            setErrorMsg(error.message || "The Academic Boss jammed your scanner.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full flex flex-col items-center space-y-8">
            <div className="w-full max-w-xl mx-auto space-y-4">
                <label
                    className={`
                        flex flex-col items-center justify-center w-full h-80 
                        border-2 border-dashed rounded-4xl cursor-pointer
                        transition-all duration-300
                        ${status === 'success' ? 'border-green-500 bg-green-500/5' :
                            status === 'error' ? 'border-red-500 bg-red-500/5' :
                                'border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'}
                    `}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        {isUploading ? (
                            <Loader2 className="w-12 h-12 mb-4 text-blue-500 animate-spin" />
                        ) : status === 'success' ? (
                            <CheckCircle2 className="w-12 h-12 mb-4 text-green-500" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                        ) : (
                            <Upload className="w-12 h-12 mb-4 text-slate-600" />
                        )}

                        <p className="mb-2 text-sm text-slate-300">
                            {isUploading ? (
                                <span className="font-black animate-pulse uppercase tracking-widest text-blue-400">Scanning Intel...</span>
                            ) : status === 'error' ? (
                                <span className="font-black text-red-400 uppercase tracking-widest text-xs">Scan Failed</span>
                            ) : status === 'success' ? (
                                <span className="font-black text-green-400 uppercase tracking-widest text-xs">Intel Extracted</span>
                            ) : (
                                <><span className="font-bold text-blue-400">Upload Intel</span> for {displayName}</>
                            )}
                        </p>
                        <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black">
                            {status === 'error' ? errorMsg : "PDF (MAX. 20MB)"}
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>

                {/* Extraction Feedback Message */}
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl flex items-center gap-4 shadow-2xl"
                    >
                        <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                            <FileText className="text-green-500 w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-green-500 tracking-widest uppercase mb-0.5">Extraction Complete</p>
                            <p className="text-sm font-bold text-white italic">Information parsed. Choose your engagement protocol below.</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* 🎯 TERMINATE BUTTON: Returns to Tactical Map */}
            {!isUploading && (
                <button
                    onClick={() => setActiveDungeon(null)}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-2 group"
                >
                    <span className="w-8 h-px bg-slate-800 group-hover:bg-red-900/50 transition-colors" />
                    Terminate Uplink
                    <span className="w-8 h-px bg-slate-800 group-hover:bg-red-900/50 transition-colors" />
                </button>
            )}
        </div>
    );
};