'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Swords, Sparkles, ShieldCheck,
  RefreshCw, Users, Map as MapIcon, Flag, Brain,
  UserCircle2, Hammer, Terminal, Activity, Crosshair, Zap,
  ChevronRight, Zap as ZapIcon
} from 'lucide-react';
import { useGameStore } from '@/features/game/store';

// 🛡️ ARCHITECTURE: Feature-First Components
import { FileUpload } from '@/features/upload/components/FileUpload';
import { ModeSelector } from '@/features/game/components/ModeSelector';
import { BattleScreen } from '@/features/game/components/BattleScreen';
import { ExperienceBar } from '@/features/dashboard/components/ExperienceBar';
import { StudyBuffs } from '@/features/dashboard/components/StudyBuffs';
import { TacticalMap } from '@/features/game/components/TacticalMap';
import { CharacterCreator } from '@/features/game/components/CharacterCreator';
import { TheForge } from '@/features/game/components/TheForge';

// Global State Overlays
import { LevelUpModal } from '@/features/dashboard/components/LevelUpModal';
import { RunSummaryModal } from '@/features/dashboard/components/RunSummaryModal';
import { StudyBuddy } from '@/features/game/components/StudyBuddy';
import { PetSelector } from '@/features/game/components/PetSelector';

/**
 * Presentation Layer: Home Root - Enhanced UI/UX
 * Improvements:
 * - Better visual hierarchy and information layering
 * - Clearer call-to-action buttons with better affordances
 * - Refined animations and transitions
 * - Improved spacing and composition
 * - Enhanced visual polish with distinctive elements
 * - Better mobile responsiveness
 */
export default function Home() {
  const {
    currentQuiz,
    skillPoints,
    hasSeenOnboarding,
    isGameOver,
    selectedPet,
    playerName,
    activeDungeonId,
    dungeons,
    pendingExtractedText
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'map' | 'char' | 'forge' | 'swap'>('map');

  const activeDungeon = dungeons.find(d => d.id === activeDungeonId);
  const isMapEmpty = dungeons.length === 0;

  /**
   * PHASE 0: SYSTEM INITIALIZATION (ONBOARDING)
   */
  if (!hasSeenOnboarding) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950/20 to-slate-950 flex flex-col items-center justify-center p-6 space-y-12 overflow-hidden relative">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,85,238,0.2)_25%,rgba(68,85,238,0.2)_50%,transparent_50%,transparent_75%,rgba(68,85,238,0.2)_75%,rgba(68,85,238,0.2))] bg-size-[40px_40px] animate-pulse" />
        </div>

        {/* Radial glow effect */}
        <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%) pointer-events-none" />

        <div className="text-center space-y-6 relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-4 mx-auto backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </motion.div>
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-[0.2em]">Neural Link Established</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter bg-linear-to-br from-white via-blue-100 to-slate-400 bg-clip-text text-transparent leading-tight">
              Assemble<br />Squad
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-slate-400 font-semibold tracking-wide text-base max-w-sm mx-auto leading-relaxed"
          >
            Deployment requires a tactical companion. Initialize your neural link with a support unit to begin.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <PetSelector isOnboarding={true} />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-in fade-in duration-1000 flex flex-col min-h-screen selection:bg-blue-500/30">

      <LevelUpModal />
      <RunSummaryModal />
      <StudyBuddy />

      {/* --- 📡 GLOBAL HEADER --- */}
      <header className="text-center mb-8 md:mb-12 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4 mb-3"
        >
          <div className="h-px flex-1 max-w-12 bg-linear-to-r from-transparent to-slate-700" />
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent select-none">
            REVIEWQUEST
          </h1>
          <div className="h-px flex-1 max-w-12 bg-linear-to-l from-transparent to-slate-700" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] letter-spacing">
            Operator Dashboard
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-blue-500/20 rounded-lg backdrop-blur-sm shadow-lg">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="w-3 h-3 text-emerald-400" />
            </motion.div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status: Optimal</span>
          </div>
        </motion.div>
      </header>

      {/* --- 📊 PROGRESSION HUD --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 space-y-3"
      >
        <div className="bg-linear-to-br from-slate-900/40 to-blue-900/10 p-5 md:p-6 rounded-3xl border border-blue-500/15 shadow-xl backdrop-blur-sm hover:border-blue-500/25 transition-all duration-300">
          <ExperienceBar />
        </div>

        <AnimatePresence>
          {skillPoints > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              className="bg-linear-to-r from-blue-600/10 via-blue-500/5 to-transparent border border-blue-500/25 rounded-2xl p-4 shadow-lg backdrop-blur-sm overflow-hidden relative"
            >
              {/* Animated background accent */}
              <div className="absolute inset-0 -z-10 opacity-30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity }}>
                    <ZapIcon className="w-3.5 h-3.5" />
                  </motion.div>
                  Tactical Enhancements Ready
                </span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-linear-to-r from-blue-500 to-blue-600 text-white text-[9px] font-black rounded-lg shadow-lg"
                >
                  {skillPoints} PTS
                </motion.span>
              </div>
              <StudyBuffs />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- 🕹️ MAIN COMMAND STAGE --- */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full bg-linear-to-b from-slate-900/40 to-slate-950/20 border border-slate-800/50 rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-8 min-h-140 flex flex-col transition-all duration-500 relative overflow-hidden flex-1"
      >
        {/* Background effects */}
        <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
        </div>

        {!currentQuiz ? (
          /* --- PHASE 1: EXPLORATION & MANAGEMENT --- */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 flex-1 flex flex-col">

            {isGameOver ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 py-8"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mx-auto backdrop-blur-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Analysis Complete</span>
                  </motion.div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase italic">Ready for New Deployment?</h2>
                </div>
                <PetSelector />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-6">

                {/* --- 📟 TACTICAL TAB SWITCHER --- */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-2 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-md overflow-x-auto no-scrollbar max-w-full"
                >
                  <TabButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon className="w-4 h-4" />} label="Frontline" />
                  <TabButton active={activeTab === 'char'} onClick={() => setActiveTab('char')} icon={<UserCircle2 className="w-4 h-4" />} label="Operator" />
                  <TabButton active={activeTab === 'forge'} onClick={() => setActiveTab('forge')} icon={<Hammer className="w-4 h-4" />} label="Forge" />
                  <TabButton active={activeTab === 'swap'} onClick={() => setActiveTab('swap')} icon={<Users className="w-4 h-4" />} label="Unit" />
                </motion.div>

                {/* Tab Content Container */}
                <div className="w-full">
                  <AnimatePresence mode="wait">

                      {/* MAP TAB */}
                      {activeTab === 'map' && (
                        <motion.div
                          key="map-tab-stack"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-8"
                        >
                          {/* 🛰️ TOP LAYER: Intel Ingestion (Uplink/Scanner) */}
                          <AnimatePresence mode="wait">
                            {activeDungeonId && (
                              <motion.div
                                key="uplink-interface"
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 1.05 }}
                                className="space-y-6 overflow-hidden"
                              >
                                <div className="bg-slate-900/50 rounded-2xl p-4 md:p-6 border border-slate-800/50 backdrop-blur-sm shadow-2xl">
                                  {/* Logic: Show Upload first, then Mode Selector once text is ready */}
                                  {!pendingExtractedText ? <FileUpload /> : <ModeSelector />}
                                </div>

                                

                                {/* Visual Separation Line */}
                                <div className="flex items-center gap-4 opacity-20">
                                  <div className="h-px flex-1 bg-slate-700" />
                                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Tactical View Below</span>
                                  <div className="h-px flex-1 bg-slate-700" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 🗺️ BOTTOM LAYER: Navigation (Tactical Map) */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                              <div className="flex items-center gap-3">
                                <MapIcon className="w-4 h-4 text-blue-400" />
                                <h2 className="text-sm font-bold text-white uppercase italic tracking-wider">Global Front</h2>
                              </div>
                              {!activeDungeonId && (
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest animate-pulse">Scanning...</span>
                              )}
                            </div>

                            {/* 🛡️ Background Effect: Dims and scales the map when the scanner is open */}
                            <div className={`transition-all duration-500 bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 backdrop-blur-sm ${activeDungeonId ? 'opacity-60 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}`}>
                              <TacticalMap />
                            </div>
                          </div>
                        </motion.div>
                      )}

                    {/* CHARACTER TAB */}
                    {activeTab === 'char' && (
                      <motion.div
                        key="char"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center space-y-2 mb-6">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-full mx-auto backdrop-blur-sm"
                          >
                            <UserCircle2 className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">Operator Identity</span>
                          </motion.div>
                          <h2 className="text-lg md:text-xl font-bold tracking-tight text-white uppercase italic">Customize Operator</h2>
                        </div>
                        <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 backdrop-blur-sm">
                          <CharacterCreator />
                        </div>
                      </motion.div>
                    )}

                    {/* FORGE TAB */}
                    {activeTab === 'forge' && (
                      <motion.div
                        key="forge"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center space-y-2 mb-6">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-full mx-auto backdrop-blur-sm"
                          >
                            <Hammer className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">Hardware Compiling</span>
                          </motion.div>
                          <h2 className="text-lg md:text-xl font-bold tracking-tight text-white uppercase italic">The Neural Forge</h2>
                        </div>
                        <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 backdrop-blur-sm">
                          <TheForge />
                        </div>
                      </motion.div>
                    )}

                    {/* UNIT SWAP TAB */}
                    {activeTab === 'swap' && (
                      <motion.div
                        key="swap"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center space-y-2 mb-6">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/25 rounded-full mx-auto backdrop-blur-sm"
                          >
                            <Users className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">Uplink Management</span>
                          </motion.div>
                          <h2 className="text-lg md:text-xl font-bold tracking-tight text-white uppercase italic">Select Support Unit</h2>
                        </div>
                        <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 backdrop-blur-sm">
                          <PetSelector />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {skillPoints === 0 && !isGameOver && activeTab === 'map' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-2 pt-4 opacity-40 select-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  Defeat elite sentinels to recover skill data
                </span>
              </motion.div>
            )}
          </div>
        ) : (
          /* --- PHASE 2: COMBAT DEPLOYMENT (BATTLE ACTIVE) --- */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 flex-1 flex flex-col"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800/50 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-red-500"
                  />
                  <h2 className="text-lg md:text-xl font-bold italic text-white uppercase tracking-tighter">Incursion Active</h2>
                </div>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                  {playerName} • {selectedPet}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 bg-slate-950/80 px-4 md:px-5 py-2.5 md:py-3 rounded-xl border border-blue-500/20 backdrop-blur-sm shadow-lg"
              >
                <div className="text-right">
                  <p className="text-[8px] text-slate-600 font-bold uppercase leading-none mb-1">Yield</p>
                  <p className="text-base md:text-lg font-black text-blue-400">
                    {(currentQuiz.questions.length * 20) + 100} XP
                  </p>
                </div>
              </motion.div>
            </div>

            <BattleScreen />
          </motion.div>
        )}

        {/* Background VFX */}
        <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] bg-size-[32px_32px]" />
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 py-6 border-t border-slate-800/30 flex flex-col items-center gap-3 opacity-50"
      >
        <div className="flex items-center gap-6 md:gap-10 text-[8px] font-bold uppercase tracking-widest text-slate-700">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
            />
            <span>v3.4.1</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
              className="w-1.5 h-1.5 rounded-full bg-yellow-600 shadow-[0_0_8px_#ca8a04]"
            />
            <span>Neural Forge</span>
          </div>
        </div>
      </motion.footer>
    </main>
  );
}

/**
 * SUB-COMPONENT: TabButton
 * Enhanced with better visual feedback and accessibility
 */
function TabButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`
        flex items-center gap-2.5 px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-bold
        uppercase tracking-wider transition-all cursor-pointer shrink-0 relative
        ${active
          ? 'bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30'
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'
        }
      `}
    >
      {icon}
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
        />
      )}
    </motion.button>
  );
}