'use client';

import React, { useState } from 'react';
import { Send, Keyboard } from 'lucide-react';

interface Props {
    onExecute: (answer: string) => void;
    disabled: boolean;
}

export const EnumerationInput = ({ onExecute, disabled }: Props) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim() || disabled) return;
        onExecute(value.trim());
        setValue('');
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-lg mx-auto">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                <Keyboard className="w-5 h-5" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={disabled}
                placeholder="Type your answer here..."
                className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl py-5 pl-14 pr-20 text-white font-bold placeholder:text-slate-700 focus:border-blue-500 focus:outline-none transition-all disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={disabled || !value.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 disabled:grayscale"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
    );
};