import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // 📏 MASSIVE MAP SPACING (4px units: 750 * 4 = 3000px)
            spacing: {
                '130': '32.5rem', // 520px
                '150': '37.5rem', // 600px
                '250': '62.5rem', // 1000px
                '400': '100rem',  // 1600px
                '500': '125rem',  // 2000px
                '750': '187.5rem', // 3000px
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '3rem',
            },
            // 🎬 RPG COMBAT ANIMATIONS
            keyframes: {
                'slash-right': {
                    '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
                    '20%': { transform: 'translateX(40px) rotate(15deg)', opacity: '1' },
                    '50%': { transform: 'translateX(60px) rotate(-10deg)', opacity: '1' },
                    '100%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-8px)' },
                    '75%': { transform: 'translateX(8px)' },
                },
                'recoil': {
                    '0%': { transform: 'translateX(0)', filter: 'brightness(1)' },
                    '20%': { transform: 'translateX(-20px)', filter: 'brightness(2) saturate(0)' },
                    '100%': { transform: 'translateX(0)', filter: 'brightness(1)' },
                },
                'float-up-fade': {
                    '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0' },
                    '20%': { transform: 'translateY(-20px) scale(1.2)', opacity: '1' },
                    '80%': { transform: 'translateY(-80px) scale(1)', opacity: '1' },
                    '100%': { transform: 'translateY(-120px) scale(0.8)', opacity: '0' },
                },
                'xp-float': {
                    '0%': { transform: 'translateY(0)', opacity: '0' },
                    '50%': { transform: 'translateY(-10px)', opacity: '1' },
                    '100%': { transform: 'translateY(-20px)', opacity: '0' },
                },
                'flash-red': {
                    '0%, 100%': { backgroundColor: 'transparent' },
                    '50%': { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                },
                'flash-white': {
                    '0%, 100%': { backgroundColor: 'transparent' },
                    '50%': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                },
                'mini-bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                }
            },
            animation: {
                'slash-right': 'slash-right 0.5s ease-out',
                'shake': 'shake 0.2s ease-in-out infinite',
                'recoil': 'recoil 0.4s ease-out',
                'float-up-fade': 'float-up-fade 1.5s forwards',
                'xp-float': 'xp-float 1s ease-out forwards',
                'flash-red': 'flash-red 0.4s ease-out',
                'flash-white': 'flash-white 0.4s ease-out',
                'mini-bounce': 'mini-bounce 2s ease-in-out infinite',
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"), // Highly recommended for entry animations
    ],
};

export default config;