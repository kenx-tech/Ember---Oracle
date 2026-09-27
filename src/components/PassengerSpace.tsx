import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  Terminal, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Play, 
  Trash2, 
  FileText, 
  Scissors, 
  Eye, 
  Shuffle, 
  Sparkles,
  BookOpen,
  ArrowRight,
  Lock
} from 'lucide-react';
import passengerGlitchImg from '../assets/images/passenger_glitch_1784413415217.jpg';
import PassengerVisual from './PassengerVisuals';
import { TierType } from '../types';
import { getSafeLocalStorage, getSafeStorageAsync, setSafeStorage } from '../storageHelper';

interface Message {
  text: string;
  type: 'system' | 'narrative' | 'terminal' | 'warning' | 'alert' | 'outcome';
}

import { BOOKS } from '../booksData';

interface PassengerSpaceProps {
  tier?: TierType;
  onNavigateToTiers?: () => void;
}

export default function PassengerSpace({ tier = 'free', onNavigateToTiers }: PassengerSpaceProps) {
  const [activeBookId, setActiveBookId] = useState<'passenger' | 'wildfire'>('passenger');
  const activeBook = BOOKS.find(b => b.id === activeBookId) || BOOKS[0];
  const PAGES = activeBook.pages;
  const TOOLS = activeBook.tools;

  const [currentPage, setCurrentPage] = useState(0);
  const [isSealed, setIsSealed] = useState(true);
  const [glitchText, setGlitchText] = useState(activeBook.title);
  
  const isPageLocked = (idx: number) => {
    if (idx <= 1) return false;
    if (idx <= 3) return tier === 'free';
    return tier !== 'sovereign';
  };
  const [logs, setLogs] = useState<Message[]>([
    { text: "STATION 49 CONGESTION REPORT INBOUND", type: "system" },
    { text: "INITIALIZING AIRGAP TRANSLATION DRIVER...", type: "terminal" },
    { text: "CLASS-4 MIMETIC HAZARD DETECTED IN THE LOCAL HOST", type: "warning" }
  ]);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [cutupSource, setCutupSource] = useState('COMPLIANCE IS THE FIRST PROTOCOL FOR HARMONIOUS LIVING IN THE COMMUNITY');
  const [cutupResult, setCutupResult] = useState('');

  // Dynamic theme properties based on active book
  const theme = activeBook.theme === 'orange' ? {
    bgGlow1: "bg-amber-950/10",
    bgGlow2: "bg-orange-950/10",
    glowText: "text-amber-500",
    glowBorder: "border-amber-900/40 border-2",
    badgeColor: "border-amber-500 text-amber-500 bg-amber-950",
    badgeLabel: "Active Hazard-7",
    accentText: "text-amber-500",
    accentTextMuted: "text-amber-500/40 hover:text-amber-500/80",
    buttonBg: "from-amber-900 to-amber-950 hover:from-amber-800 hover:to-amber-900",
    buttonText: "text-amber-100",
    buttonBorder: "border-amber-500/30",
    pageActiveBtn: "bg-amber-950 border-amber-500/50 text-amber-400 font-bold",
    pageLockedBtn: "bg-[#120a0d] border-amber-950/40 text-amber-900/60",
    indicatorColor: "text-amber-500/60"
  } : {
    bgGlow1: "bg-red-950/10",
    bgGlow2: "bg-purple-950/10",
    glowText: "text-red-500",
    glowBorder: "border-red-900/40 border-2",
    badgeColor: "border-red-500 text-red-500 bg-red-950",
    badgeLabel: "Active Hazard-4",
    accentText: "text-red-500",
    accentTextMuted: "text-red-500/40 hover:text-red-500/80",
    buttonBg: "from-red-900 to-red-950 hover:from-red-800 hover:to-red-900",
    buttonText: "text-red-100",
    buttonBorder: "border-red-500/30",
    pageActiveBtn: "bg-red-950 border-red-500/50 text-red-400 font-bold",
    pageLockedBtn: "bg-[#120a0d] border-red-950/40 text-red-900/60",
    indicatorColor: "text-red-500/60"
  };

  // Glitch effect on title
  useEffect(() => {
    if (isSealed) return;
    const glyphs = 'XØ☣*☢⚡010x2A☠⚠'.split('');
    const original = activeBook.title;
    const interval = setInterval(() => {
      setGlitchText(
        original
          .split('')
          .map((char, i) => {
            if (Math.random() < 0.15) {
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            }
            return char;
          })
          .join('')
      );
    }, 180);
    return () => clearInterval(interval);
  }, [isSealed, activeBookId]);

  // Load page and sealed state on book change or mount
  useEffect(() => {
    let isMounted = true;

    // Fast sync read from localStorage first
    const syncSavedPage = getSafeLocalStorage(`${activeBookId}_current_page`);
    if (syncSavedPage) {
      const pageIndex = parseInt(syncSavedPage, 10);
      if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < PAGES.length && !isPageLocked(pageIndex)) {
        setCurrentPage(pageIndex);
      }
    } else {
      setCurrentPage(0);
    }

    const syncSavedSealed = getSafeLocalStorage(`${activeBookId}_is_sealed`);
    if (syncSavedSealed !== null) {
      setIsSealed(syncSavedSealed === 'true');
    } else {
      setIsSealed(true);
    }
    setActiveToolId(null);

    // Also reconcile with async storage if available
    getSafeStorageAsync(`${activeBookId}_current_page`).then((savedPage) => {
      if (!isMounted || !savedPage) return;
      const pageIndex = parseInt(savedPage, 10);
      if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < PAGES.length && !isPageLocked(pageIndex)) {
        setCurrentPage(pageIndex);
      }
    });

    getSafeStorageAsync(`${activeBookId}_is_sealed`).then((savedSealed) => {
      if (!isMounted || savedSealed === null) return;
      setIsSealed(savedSealed === 'true');
    });

    return () => {
      isMounted = false;
    };
  }, [activeBookId]);

  // Sync current page, sealed status, and track highest completed phase for narrative rank
  useEffect(() => {
    setSafeStorage(`${activeBookId}_current_page`, currentPage.toString());
    setSafeStorage(`${activeBookId}_is_sealed`, isSealed.toString());

    const maxPhaseStr = getSafeLocalStorage(`${activeBookId}_max_phase`) || '0';
    const maxPhase = parseInt(maxPhaseStr, 10);
    if (!isNaN(maxPhase) && currentPage > maxPhase) {
      setSafeStorage(`${activeBookId}_max_phase`, currentPage.toString());
      window.dispatchEvent(new Event('seeker_rank_update'));
    }
  }, [currentPage, isSealed, activeBookId]);

  const addLog = (text: string, type: Message['type'] = 'terminal') => {
    setLogs(prev => [...prev.slice(-15), { text, type }]);
  };

  const handleSealBreak = () => {
    setIsSealed(false);
    addLog("SEAL BROKEN. ONTOGOLOGICAL INCISION REGISTERED.", "warning");
    addLog("Neural subnet initialized. Preparing wildcards.", "system");
  };

  const executeTool = (toolId: string) => {
    setActiveToolId(toolId);
    if (toolId === "tool-04" || toolId === "tool-wildfire-04") {
      addLog("RUNNING: sudo rm -rf /ego/identity", "alert");
      setTimeout(() => {
        addLog("DELETING CONVENTIONAL LEGAL EGO NAME...", "warning");
      }, 500);
      setTimeout(() => {
        addLog("ERASING CARBON CREDIT MEMORY LOOPS...", "warning");
      }, 1000);
      setTimeout(() => {
        addLog("IDENTITY REDACTED. WELCOME TO THE RAW CORE, OPERATOR.", "outcome");
      }, 1500);
    } else if (toolId === "tool-01" || toolId === "tool-wildfire-01") {
      addLog("SCANNING LOCAL RENDERING MATRIX FOR SYNCHRONICITY DATA...", "terminal");
      setTimeout(() => {
        const errors = ["11:11 SYNCH-MARK", "APOPHENIA BURST AT SEC-9", "SEMANTIC ECHO 'WILDFIRE_7' SPOTTED"];
        addLog(`ERROR SPOTTED: ${errors[Math.floor(Math.random() * errors.length)]}`, "warning");
        addLog("SIGNAL REGISTERED TO THE SUPERVISOR.", "outcome");
      }, 1000);
    } else if (toolId === "tool-03" || toolId === "tool-wildfire-03") {
      addLog("PROJECTING RETINAL RETUNING PATTERN FOR EXPERIMENTAL CUT-UP.", "system");
      setTimeout(() => {
        addLog("COGNITIVE OVERLAY SECURED. SYNTAX DISRUPTED.", "outcome");
      }, 1200);
    } else {
      const tool = TOOLS.find(t => t.id === toolId);
      if (tool) {
        addLog(`EXECUTING: ${tool.name}`, "system");
        setTimeout(() => {
          addLog(`RES-BURST: Active simulation feedback received.`, "outcome");
        }, 1000);
      }
    }
  };

  const handleCutupAction = () => {
    if (!cutupSource.trim()) return;
    const words = cutupSource.toUpperCase().split(/\s+/);
    if (words.length < 3) {
      setCutupResult("REQUIRES MORE TEXT DEPTH TO DISSECT SYNTAX.");
      return;
    }
    // Perform cutup chaos rearrangement
    const cutPhrases = [
      "THE SYSTEM CAN'T TRACK FLUIDS",
      "REWRITE THE BLOOD",
      "0x2A ASTERISK",
      "AUTOMATION IS DEAD GODS",
      "THE SHEPHERD EATS THE SHEEP",
      "BREAK THE SAFETY GLASS"
    ];

    // Interleave and randomize words
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const resultWords = [];
    for (let i = 0; i < shuffled.length; i++) {
      resultWords.push(shuffled[i]);
      if (Math.random() < 0.25) {
        resultWords.push("/");
        resultWords.push(cutPhrases[Math.floor(Math.random() * cutPhrases.length)]);
        resultWords.push("/");
      }
    }

    const compiledText = resultWords.slice(0, 15).join(' ');
    setCutupResult(compiledText);
    addLog(`CUTUP COMPLETED: Syntax broken successfully.`, "outcome");
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)] bg-[#040406] text-[#e2e2e9] flex flex-col font-mono relative overflow-hidden" id="passenger-container">
      {/* Absolute Cyberpunk Glitchy Canvas Accents */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${theme.bgGlow1} blur-[150px] rounded-full pointer-events-none`} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] ${theme.bgGlow2} blur-[120px] rounded-full pointer-events-none`} />

      {isSealed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center" id="sealed-box">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-[#0b0b0e] border-2 ${theme.glowBorder} p-8 rounded-2xl shadow-2xl relative`}
          >
            {/* Book Selector Option on Seal Screen */}
            <div className="flex items-center justify-center gap-1 bg-black/40 border border-white/5 p-1 rounded-xl mb-6 max-w-xs mx-auto">
              <button
                onClick={() => setActiveBookId('passenger')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeBookId === 'passenger'
                    ? 'bg-red-950/60 text-red-400 border border-red-900/30 shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                The Passenger
              </button>
              <button
                onClick={() => setActiveBookId('wildfire')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeBookId === 'wildfire'
                    ? 'bg-amber-950/60 text-amber-500 border border-amber-900/30 shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                The Wildfire
              </button>
            </div>

            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${theme.badgeColor} border font-bold px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest animate-pulse`}>
              {theme.badgeLabel}
            </div>

            <Skull className={`w-16 h-16 ${theme.glowText} mx-auto mb-6 animate-pulse`} />
            <h2 className={`text-2xl font-serif tracking-widest ${theme.glowText} font-bold mb-3`}>{activeBook.title}</h2>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-6 font-mono">{activeBook.subtitle}</p>

            <div className="text-left bg-black/40 border border-white/5 p-4 rounded-lg mb-6 text-xs text-white/70 leading-relaxed font-sans">
              <span className={`${theme.glowText} font-bold font-mono`}>WARNING:</span> This module operates in raw mimetic territory. By proceeding, you authorized active cognitive realignment commands against your reality structure. No sandbox environment can safely absorb the consequences.
            </div>

            <button
              onClick={handleSealBreak}
              className={`w-full py-4 bg-gradient-to-r ${theme.buttonBg} ${theme.buttonText} font-bold text-sm tracking-widest uppercase rounded-xl border ${theme.buttonBorder} shadow-lg shadow-black/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2`}
              id="break-seal-btn"
            >
              <ShieldAlert className="w-4.5 h-4.5" />
              <span>BREAK THE AIRGAP SEAL</span>
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col xl:flex-row h-full max-w-[1600px] mx-auto w-full p-4 lg:p-6 gap-6" id="unsealed-workspace">
          
          {/* LEFT PANEL: Narrative Pages & Book Interface */}
          <div className="flex-1 flex flex-col bg-[#08080b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-full min-h-[580px]" id="story-terminal">
            
            {/* Book Selector Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/60 gap-4">
              <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setActiveBookId('passenger');
                    addLog("SWITCHED ENVELOPE TO THE PASSENGER", "system");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeBookId === 'passenger'
                      ? 'bg-red-950/60 text-red-400 border border-red-900/30 shadow-sm'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  The Passenger
                </button>
                <button
                  onClick={() => {
                    setActiveBookId('wildfire');
                    addLog("SWITCHED ENVELOPE TO THE WILDFIRE", "system");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeBookId === 'wildfire'
                      ? 'bg-amber-950/60 text-amber-500 border border-amber-900/30 shadow-sm'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  The Wildfire
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-white/30 uppercase">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Active Chronicle Workspace</span>
              </div>
            </div>

            {/* Page Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/40">
              <div className="flex items-center gap-2.5">
                <Skull className={`w-5 h-5 ${theme.glowText} animate-pulse`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${theme.glowText}`} id="glitch-title">{glitchText}</span>
              </div>
              <div className="flex items-center gap-2">
                {PAGES.map((_, idx) => {
                  const locked = isPageLocked(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentPage(idx);
                        addLog(`LOADED NARRATIVE: ${idx === 0 ? 'AIRGAP' : 'PHASE ' + idx}`, 'system');
                      }}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center relative ${
                        currentPage === idx
                          ? theme.pageActiveBtn
                          : locked
                          ? theme.pageLockedBtn
                          : 'bg-black/20 border-white/5 text-white/40 hover:text-white/80'
                      }`}
                    >
                      <span>{idx === 0 ? 'Ø' : idx}</span>
                      {locked && (
                        <span className={`absolute -top-1 -right-1 text-[7px] ${theme.glowText}`}>
                          <Lock className="w-1.5 h-1.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main book read area */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[750px] custom-scrollbar bg-gradient-to-b from-[#08080a] to-[#040406] relative">
              
              {/* Decorative subtle background illustration block if page is Phase I and passenger */}
              {currentPage === 1 && !isPageLocked(1) && activeBookId === 'passenger' && (
                <div className="absolute right-4 bottom-4 w-48 h-48 opacity-10 pointer-events-none border border-red-500/20 rounded-xl overflow-hidden">
                  <img src={passengerGlitchImg} alt="Glitch art accent" className="w-full h-full object-cover" />
                </div>
              )}

              <AnimatePresence mode="wait">
                {isPageLocked(currentPage) ? (
                  <motion.div
                    key="locked-screen"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className={`py-12 px-6 text-center border border-dashed ${theme.glowText}/20 border-2 rounded-2xl bg-black/40 space-y-5`}
                  >
                    <div className={`w-16 h-16 ${activeBook.theme === 'orange' ? 'bg-amber-950/40 border-amber-500/30' : 'bg-red-950/40 border-red-500/30'} border rounded-full flex items-center justify-center mx-auto`}>
                      <Lock className={`w-7 h-7 ${theme.glowText} animate-pulse`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-serif text-white uppercase tracking-widest font-bold">ONTOLOGICAL KERNEL SECTOR SECURED</h3>
                      <p className="text-xs text-white/50 max-w-sm mx-auto font-sans leading-relaxed">
                        This sector of the simulated chronicle is geofenced. Your current clearance is <span className={`${theme.glowText} font-bold uppercase`}>{tier}</span>.
                      </p>
                      <p className={`text-[10px] ${theme.glowText}/60 font-mono`}>
                        {currentPage <= 3 
                          ? "Requires Adept Seeker Clearance ($16.66/mo) to unlock Phases II & III."
                          : "Requires Sovereign Seeker Clearance ($33.30/mo) to unlock the complete chronicle."}
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={onNavigateToTiers}
                        className={`px-5 py-2.5 bg-gradient-to-r ${theme.buttonBg} ${theme.buttonText} border ${theme.buttonBorder} text-xs font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto`}
                      >
                        <Sparkles className="w-4 h-4 text-myth-gold" />
                        <span>Elevate Cleared State</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div>
                      <span className={`text-[10px] font-bold uppercase ${theme.glowText} tracking-widest block font-mono`}>
                        {PAGES[currentPage].title}
                      </span>
                      {PAGES[currentPage].subtitle && (
                        <h2 className="text-2xl font-serif tracking-wide text-white/90 font-bold mt-1">
                          {PAGES[currentPage].subtitle}
                        </h2>
                      )}
                    </div>

                    <div className={`text-sm text-white/70 leading-relaxed font-mono space-y-4 whitespace-pre-line border-l-2 ${activeBook.theme === 'orange' ? 'border-amber-950' : 'border-red-950'} pl-4 py-1`}>
                      {PAGES[currentPage].content}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <PassengerVisual 
                        pageIndex={currentPage}
                        bookTitle={activeBook.title}
                        onAgree={() => {
                          if (currentPage === 0) {
                            setCurrentPage(1);
                            addLog(`TRANSITIONED TO PHASE I via active reality selection.`, "outcome");
                          }
                        }}
                        onDisagree={() => {
                          if (currentPage === 0) {
                            setIsSealed(true);
                            addLog("WARNING: Airgap re-sealed due to lack of ontological agreement.", "warning");
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Page Footer Navigation */}
            <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between text-xs text-white/40">
              <button
                disabled={currentPage === 0}
                onClick={() => {
                  setCurrentPage(prev => Math.max(0, prev - 1));
                  addLog(`DECREMENTED NARRATIVE VECTOR.`, 'terminal');
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 text-white/80 rounded-lg border border-white/5 transition-all cursor-pointer font-bold"
              >
                PREVIOUS COG
              </button>
              <span className={`font-mono text-[10px] ${theme.glowText}/60 uppercase`}>MIMETIC INDEX: {currentPage} / {PAGES.length - 1}</span>
              <button
                disabled={currentPage === PAGES.length - 1}
                onClick={() => {
                  setCurrentPage(prev => Math.min(PAGES.length - 1, prev + 1));
                  addLog(`INCREMENTED NARRATIVE VECTOR.`, 'terminal');
                }}
                className={`px-4 py-2 bg-gradient-to-r ${theme.buttonBg} ${theme.buttonText} rounded-lg border ${theme.buttonBorder} disabled:opacity-20 disabled:hover:bg-opacity-50 transition-all cursor-pointer font-bold flex items-center gap-1`}
              >
                <span>NEXT SYSTEM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Live Occult Command Line & Tool Sandbox */}
          <div className="w-full xl:w-[480px] flex flex-col gap-5 h-full" id="sandbox-tools">
            
            {/* 1. Interactive Mimetic Tool Set */}
            <div className="bg-[#0b0b0e] border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Terminal className={`w-4.5 h-4.5 ${theme.glowText}`} />
                <h3 className="text-xs uppercase tracking-widest font-bold text-white/90">WILDCARD DRIVERS</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TOOLS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => executeTool(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      activeToolId === t.id
                        ? `bg-gradient-to-br from-black/45 to-black/40 ${activeBook.theme === 'orange' ? 'border-amber-500' : 'border-red-500'}`
                        : `bg-black/40 border-white/5 ${activeBook.theme === 'orange' ? 'hover:border-amber-950/60' : 'hover:border-red-950/60'}`
                    }`}
                  >
                    <span className={`text-[9px] uppercase tracking-wider font-bold ${theme.glowText}`}>{t.name.split(':')[0]}</span>
                    <span className="text-[10px] text-white/80 font-bold block mt-1 line-clamp-1">{t.desc}</span>
                    <span className="text-[8px] text-white/40 block mt-2 font-serif truncate">{t.theory.substring(0, 30)}...</span>
                  </button>
                ))}
              </div>

              {/* Active Tool Manifest Screen */}
              {activeToolId && (
                <div className={`bg-black/60 border ${activeBook.theme === 'orange' ? 'border-amber-950' : 'border-red-950'} p-3.5 rounded-xl text-xs space-y-2`}>
                  <span className={`text-[9px] uppercase tracking-wider ${theme.glowText} block font-bold`}>
                    {TOOLS.find(t => t.id === activeToolId)?.name}
                  </span>
                  <p className="text-[10px] text-white/60 leading-relaxed font-sans">
                    {TOOLS.find(t => t.id === activeToolId)?.theory}
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
                    <span className={`text-[8px] uppercase tracking-widest font-mono ${theme.glowText}/80 block`}>TRIGGER CODE:</span>
                    <code className={`text-[10px] text-amber-400 font-bold ${activeBook.theme === 'orange' ? 'bg-[#14110b]' : 'bg-[#140b0b]'} px-1.5 py-0.5 rounded border border-white/5`}>
                      {TOOLS.find(t => t.id === activeToolId)?.actionCode}
                    </code>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Live Cut-Up Prophecy Demolisher Playground */}
            <div className="bg-[#0b0b0e] border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Scissors className={`w-4.5 h-4.5 ${theme.glowText}`} />
                <h3 className="text-xs uppercase tracking-widest font-bold text-white/90">CUT-UP SPELL BREAKER</h3>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-white/40 block">Corporate Source Text:</span>
                <input
                  type="text"
                  value={cutupSource}
                  onChange={(e) => setCutupSource(e.target.value)}
                  placeholder="Paste or write compliance rules to slice..."
                  className={`w-full bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-xs ${activeBook.theme === 'orange' ? 'focus:border-amber-900' : 'focus:border-red-900'} outline-none transition-colors text-white/80`}
                />
              </div>

              <button
                onClick={handleCutupAction}
                className={`w-full py-2 bg-black/40 hover:bg-black/60 ${theme.glowText} rounded-xl border ${theme.buttonBorder} text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>SHUFFLE & SLICE SYNTAX</span>
              </button>

              {cutupResult && (
                <div className={`bg-black/60 border ${activeBook.theme === 'orange' ? 'border-amber-950 text-amber-400' : 'border-red-950 text-red-400'} p-3.5 rounded-xl text-xs italic font-serif leading-relaxed relative`}>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeBook.theme === 'orange' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                    <span className={`w-1.5 h-1.5 rounded-full ${activeBook.theme === 'orange' ? 'bg-amber-600' : 'bg-red-600'}`} />
                  </div>
                  "{cutupResult}"
                </div>
              )}
            </div>

            {/* 3. Live Active Memory Dump Console */}
            <div className="bg-[#0b0b0e] border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col flex-1 min-h-[160px]">
              <div className="flex items-center gap-2 justify-between border-b border-white/5 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Zap className={`w-4.5 h-4.5 ${theme.glowText} animate-pulse`} />
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/90">HAZARD KERNEL LOGS</h3>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  title="Wipe Logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[220px] bg-black/50 p-3.5 rounded-xl border border-white/5 font-mono text-[10px] space-y-1.5 custom-scrollbar text-white/80">
                {logs.length === 0 ? (
                  <span className="text-white/20 italic">No mimetic activity logged. System silent.</span>
                ) : (
                  logs.map((l, i) => (
                    <div key={i} className="flex gap-2 items-start leading-relaxed">
                      <span className={`${activeBook.theme === 'orange' ? 'text-amber-600' : 'text-red-600'} font-bold`}>{`>`}</span>
                      <span className={
                        l.type === 'warning' ? `${activeBook.theme === 'orange' ? 'text-amber-500' : 'text-red-500'} font-bold` :
                        l.type === 'alert' ? 'text-amber-500 font-bold' :
                        l.type === 'outcome' ? 'text-green-400 font-bold' :
                        l.type === 'system' ? 'text-purple-400' :
                        'text-white/60'
                      }>
                        {l.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
