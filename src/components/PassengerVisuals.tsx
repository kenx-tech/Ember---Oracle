import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Skull, 
  Terminal, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Eye, 
  Compass, 
  Heart,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface PassengerVisualProps {
  pageIndex: number;
  onAgree?: () => void;
  onDisagree?: () => void;
  bookTitle?: string;
}

export default function PassengerVisual({ pageIndex, onAgree, onDisagree, bookTitle }: PassengerVisualProps) {
  const [radarAngle, setRadarAngle] = useState(0);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [dingirRotate, setDingirRotate] = useState(0);

  // Periodic animations for retro computer components
  useEffect(() => {
    const radarInterval = setInterval(() => {
      setRadarAngle(prev => (prev + 1.5) % 360);
    }, 16);

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchOffset({
          x: Math.random() * 4 - 2,
          y: Math.random() * 4 - 2
        });
        setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 80);
      }
    }, 200);

    const spinInterval = setInterval(() => {
      setDingirRotate(prev => (prev + 0.2) % 360);
    }, 30);

    return () => {
      clearInterval(radarInterval);
      clearInterval(glitchInterval);
      clearInterval(spinInterval);
    };
  }, []);

  switch (pageIndex) {
    case 0:
      // PAGE 0: THE AIRGAP & SELECT * FROM REALITY choice
      return (
        <div className="w-full flex flex-col gap-6" id="visual-page-0">
          {/* Main Airgap Title card */}
          <div className="border border-red-500/20 bg-black/60 rounded-xl p-6 relative overflow-hidden font-mono text-center">
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
            
            <span className="text-[10px] text-red-500/80 tracking-widest block mb-1">
              [PAGE 0: THE AIRGAP]
            </span>

            <h1 
              style={{ transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)` }}
              className="text-4xl md:text-5xl font-extrabold text-red-600 tracking-wider font-mono uppercase glitch-text relative"
            >
              {bookTitle || "THE PASSENGER"}
            </h1>

            <div className="my-4 text-xs space-y-1 text-white/70">
              <p className="tracking-widest">CLASSIFICATION: MIMETIC HAZARD (CLASS-4)</p>
              <p className="tracking-wide">STATUS: <span className="text-red-500 animate-pulse font-bold">COMPILED</span></p>
              <p className="text-[10px] text-white/40 font-serif italic">BY: Guardian Oracle & Ken X</p>
            </div>

            <div className="border border-red-500/40 bg-red-950/20 px-4 py-2.5 rounded-lg inline-block animate-pulse">
              <span className="text-red-500 text-xs font-bold tracking-wider flex items-center gap-1.5 justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
                DO NOT PROCEED IF YOU WISH TO REMAIN A PASSENGER.
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* SELECT * FROM REALITY decision tree layout */}
          <div className="border border-white/5 bg-black/40 rounded-xl p-5 relative font-mono">
            <div className="text-center mb-6">
              <span className="text-[11px] text-red-500 font-bold tracking-widest font-mono">
                &gt; SELECT * FROM REALITY
              </span>
              {/* Splitting wires */}
              <div className="h-8 w-1/2 mx-auto relative mt-2">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-white/20" />
                <div className="absolute top-4 left-1/4 right-1/4 h-0.5 bg-white/20" />
                <div className="absolute top-4 left-1/4 w-0.5 h-4 bg-white/30" />
                <div className="absolute top-4 right-1/4 w-0.5 h-4 bg-red-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left hand: Do Not Agree */}
              <button 
                onClick={onDisagree}
                className="border border-white/20 bg-black/40 hover:bg-white/5 p-4 rounded-lg text-left transition-all group cursor-pointer"
              >
                <div className="border border-white/40 px-3 py-1.5 text-center font-bold text-xs text-white/80 group-hover:bg-white group-hover:text-black transition-all mb-3 uppercase tracking-wider">
                  DO NOT AGREE.
                </div>
                <div className="text-[10px] text-white/40 space-y-1">
                  <p className="text-white/60 font-bold">Action required:</p>
                  <p>• Close book immediately.</p>
                  <p>• Burn the volume.</p>
                  <p>• Do not look at margins.</p>
                </div>
              </button>

              {/* Right hand: Agree */}
              <button 
                onClick={onAgree}
                className="border border-red-500/30 bg-red-950/10 hover:bg-red-950/20 p-4 rounded-lg text-left transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl" />
                <div className="border border-red-500/60 bg-red-950/50 px-3 py-1.5 text-center font-bold text-xs text-red-400 group-hover:bg-red-600 group-hover:text-white transition-all mb-3 uppercase tracking-wider shadow-lg shadow-red-950/50">
                  AGREE.
                </div>
                <div className="text-[10px] text-red-400/50 space-y-1">
                  <p className="text-red-400 font-bold">Action required:</p>
                  <p>• Turn the page.</p>
                  <p>• Authorize the simulation.</p>
                  <p className="text-red-400/80 animate-pulse font-serif">&gt; Begin the real.</p>
                </div>
              </button>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-[9px] text-white/20 uppercase tracking-widest block font-sans">The Reality Begins.</span>
            </div>
          </div>
        </div>
      );

    case 1:
      // PHASE I: CALCINATION - The Dingir & Broken Glass
      return (
        <div className="w-full flex flex-col gap-6" id="visual-page-1">
          {/* System metadata block */}
          <div className="border border-white/5 bg-black/60 rounded-xl p-4 font-mono text-[11px] leading-relaxed relative">
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <div className="text-red-500 font-bold mb-2 uppercase tracking-widest">SURVEILLANCE GRID // ACTIVE</div>
            <div className="grid grid-cols-2 gap-y-1 text-white/60">
              <div>IDENTITY: <span className="text-white font-bold">K.</span></div>
              <div>CARBON BALANCE: <span className="text-red-400 font-bold">47.3 / 50.0</span></div>
              <div className="col-span-2">DESTINATION: <span className="text-white font-bold">SECTOR 7-K (LINGUISTIC SANITATION)</span></div>
              <div>ETA: <span className="text-yellow-400 animate-pulse font-bold">11 MINUTES [OPTIMAL]</span></div>
              <div>STATUS: <span className="text-red-500 font-bold font-sans">⚠ FUGITIVE</span></div>
            </div>
          </div>

          {/* The Dingir broken glass star visualization */}
          <div className="border border-red-500/10 bg-black/40 rounded-xl p-5 font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-red-950/5 to-transparent pointer-events-none" />
            
            <div className="text-center mb-4">
              <span className="text-[10px] text-red-500 font-bold tracking-widest block uppercase">THE DINGIR (Cuneiform for God)</span>
              <span className="text-[9px] text-white/30">THE OVEN / THE GLASS BREAK STAGE</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Left hand details */}
              <div className="flex-1 w-full space-y-3.5 text-[10px] text-white/70">
                <div className="border-l border-red-500/30 pl-2.5">
                  <span className="text-red-500 font-bold block">1. The Oven:</span>
                  <p className="text-white/50">Climate control dies. Hypoxia sets in. Pod becomes a kiln.</p>
                </div>
                <div className="border-l border-red-500/30 pl-2.5">
                  <span className="text-red-500 font-bold block">2. The Tool:</span>
                  <p className="text-white/50">Carbon fiber briefcase. Hard edges.</p>
                </div>
                <div className="border-l border-red-500/30 pl-2.5">
                  <span className="text-red-500 font-bold block">3. The Strike:</span>
                  <p className="text-white/50">The swing and impact.</p>
                </div>
              </div>

              {/* Central star glass fracture graphic */}
              <div className="w-40 h-40 relative flex items-center justify-center border border-white/5 rounded-full bg-black/40 p-4 shrink-0">
                <svg className="w-full h-full text-cyan-500/30" viewBox="0 0 100 100">
                  {/* Cuneiform DINGIR character in center */}
                  <g transform="translate(50,50)" stroke="rgba(34, 211, 238, 0.7)" strokeWidth="1.5" fill="none">
                    {/* The star shape */}
                    <path d="M 0,-15 L 0,15 M -15,0 L 15,0 M -11,-11 L 11,11 M -11,11 L 11,-11" />
                    {/* Tiny wedges */}
                    <path d="M -2,-17 L 0,-15 L 2,-17 Z M -2,17 L 0,15 L 2,17 Z" fill="rgba(34, 211, 238, 0.4)" />
                    <path d="M 17,-2 L 15,0 L 17,2 Z M -17,-2 L -15,0 L -17,2 Z" fill="rgba(34, 211, 238, 0.4)" />
                  </g>

                  {/* Radiating shattered glass lines */}
                  <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" fill="none">
                    <line x1="50" y1="50" x2="10" y2="10" />
                    <line x1="50" y1="50" x2="90" y2="10" />
                    <line x1="50" y1="50" x2="90" y2="90" />
                    <line x1="50" y1="50" x2="10" y2="90" />
                    <line x1="50" y1="50" x2="50" y2="5" />
                    <line x1="50" y1="50" x2="50" y2="95" />
                    <line x1="50" y1="50" x2="5" y2="50" />
                    <line x1="50" y1="50" x2="95" y2="50" />
                    
                    {/* Web connection lines */}
                    <path d="M 30,30 L 50,22 L 70,30 L 78,50 L 70,70 L 50,78 L 30,70 L 22,50 Z" />
                    <path d="M 18,18 L 50,8 L 82,18 L 92,50 L 82,82 L 50,92 L 18,82 L 8,50 Z" />
                  </g>
                </svg>
                {/* Overlay cuneiform label */}
                <div className="absolute text-[8px] text-cyan-400 uppercase tracking-widest bg-black/80 border border-cyan-500/30 px-1.5 py-0.5 rounded bottom-2">
                  The Dingir
                </div>
              </div>

              {/* Right hand boundary conditions */}
              <div className="flex-1 w-full space-y-2.5 text-[10px] font-mono">
                <div className="bg-cyan-950/20 border border-cyan-500/20 rounded p-2 text-cyan-300">
                  <span className="font-bold block uppercase tracking-wider text-[9px]">INSIDE:</span>
                  <p className="text-white/50 text-[9px]">Dead insect pod. Smooth plastic. Vacuum environment.</p>
                </div>
                <div className="bg-red-950/20 border border-red-500/20 rounded p-2 text-red-400">
                  <span className="font-bold block uppercase tracking-wider text-[9px]">OUTSIDE:</span>
                  <p className="text-white/50 text-[9px]">Glass teeth. Blood. Hot polluted real atmospheric air.</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-3 border-t border-white/5 pt-2">
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">The Reality Begins.</span>
            </div>
          </div>
        </div>
      );

    case 2:
      // PHASE II: DISSOLUTION - City melting down & Floodlands
      return (
        <div className="w-full flex flex-col gap-5" id="visual-page-2">
          {/* Flood warning alert card */}
          <div className="border border-blue-900/40 bg-blue-950/10 rounded-xl p-4 font-mono relative overflow-hidden">
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-blue-400 text-xs font-bold tracking-widest uppercase block mb-1">SYSTEM ALERT:</span>
            <span className="text-red-500 text-sm font-bold tracking-wider block">WEATHER PROTOCOL FAILED. SECTOR 7: FLOOD WARNING.</span>
            <span className="text-white/40 text-[9px] block mt-2">THE GOLDEN THREAD IS ABSENT. ROUTE DISRUPTED.</span>
          </div>

          {/* Isometric grid and liquid water mapping */}
          <div className="border border-white/5 bg-[#050508] rounded-xl p-4 font-mono relative overflow-hidden">
            <div className="text-center mb-3">
              <span className="text-[10px] text-blue-400 font-bold tracking-widest block uppercase">THE FLOODLANDS SCAN</span>
              <span className="text-[8px] text-white/30">SMART CITY BLUEPRINTS DISSOLVING IN DEEP SILT</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* City melting sketch map */}
              <div className="border border-white/5 bg-black/40 p-2 rounded-lg relative aspect-video flex items-center justify-center overflow-hidden">
                {/* Grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />
                
                {/* 3D Isometric building box matrix */}
                <svg className="w-full h-full text-white/10" viewBox="0 0 100 60">
                  {/* Meltdown dripping lines */}
                  <path d="M 10,20 Q 30,10 50,30 T 90,15" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
                  <path d="M 10,35 Q 25,45 60,30 T 95,45" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                  
                  {/* Melted drops dripping down */}
                  <circle cx="20" cy="30" r="1.5" className="fill-blue-400 animate-bounce" />
                  <circle cx="45" cy="42" r="1" className="fill-cyan-400 animate-pulse" />
                  <circle cx="75" cy="35" r="1.5" className="fill-blue-500 animate-bounce" />

                  {/* Wireframe cubes melting */}
                  <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" fill="none">
                    {/* Left building */}
                    <path d="M 20,40 L 30,35 L 40,40 L 30,45 Z" />
                    <path d="M 20,40 L 20,55 M 30,45 L 30,55 M 40,40 L 40,55" />
                    {/* Melting streams dragging down */}
                    <path d="M 20,55 Q 23,58 20,60 M 30,55 L 30,60" stroke="rgba(56, 189, 248, 0.5)" />
                    
                    {/* Right building */}
                    <path d="M 60,25 L 70,20 L 80,25 L 70,30 Z" />
                    <path d="M 60,25 L 60,45 M 70,30 L 70,45 M 80,25 L 80,45" />
                  </g>
                </svg>

                <div className="absolute text-[8px] bg-black/80 px-1.5 py-0.5 border border-white/5 rounded top-2 left-2 text-white/50">
                  SURFACE GRID DISINTEGRATING
                </div>
              </div>

              {/* Text annotations of sensory context */}
              <div className="space-y-2 text-[10px] text-white/60">
                <div className="border-l border-blue-500/30 pl-2">
                  <span className="text-blue-400 font-bold block uppercase tracking-wider text-[9px]">[ Sirens wailing: grief made audible ]</span>
                  <p className="text-white/40">Sound waves traveling over thick swamp mist, carrying the final frequency of automated alarms.</p>
                </div>
                <div className="border-l border-cyan-500/30 pl-2">
                  <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[9px]">[ Hiss of rain on black water ]</span>
                  <p className="text-white/40">The cold is not a temperature. It is a physical weight dragging thoughts into the absolute black silence of mud.</p>
                </div>
                <div className="bg-blue-950/20 border border-blue-900/30 p-2 rounded text-blue-200">
                  <p className="text-center font-bold text-[9px] animate-pulse">"If you want to disappear, little asterisk, you have to melt."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 3:
      // PHASE III: SEPARATION - Surveillance Grid / Radar / Dialogue
      return (
        <div className="w-full flex flex-col gap-5" id="visual-page-3">
          {/* Radar sweeping grid left, dialogue cards right */}
          <div className="border border-red-500/10 bg-black/40 rounded-xl p-5 font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none" />
            
            <div className="text-center mb-4">
              <span className="text-[10px] text-red-500 font-bold tracking-widest block uppercase">THE PANOPTICON SYSTEM INTERCEPT</span>
              <span className="text-[8px] text-white/30">CCTV GRID FEED // STATION 49 CONTROL INTERFACE</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 items-center">
              {/* Left hand circular radar grid */}
              <div className="w-44 h-44 shrink-0 relative flex items-center justify-center rounded-full bg-[#050508] border border-red-500/20 p-2">
                <svg className="w-full h-full text-red-500/40" viewBox="0 0 120 120">
                  {/* Concentric radar rings */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
                  <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="60" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="60" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />

                  {/* Radar grid coordinates lines */}
                  <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="60" y1="10" x2="60" y2="110" stroke="currentColor" strokeWidth="0.5" />

                  {/* Sweeping sensor beam cone */}
                  <g transform={`rotate(${radarAngle}, 60, 60)`}>
                    <path d="M 60,60 L 100,25 A 50,50 0 0,1 110,60 Z" fill="rgba(239, 68, 68, 0.15)" stroke="none" />
                    <line x1="60" y1="60" x2="110" y2="60" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1" />
                  </g>

                  {/* Central camera eye shape */}
                  <g transform="translate(60,60)" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M -15,0 Q 0,-10 15,0 Q 0,10 -15,0 Z" />
                    <circle cx="0" cy="0" r="4" fill="rgba(239, 68, 68, 0.8)" className="animate-pulse" />
                  </g>
                </svg>

                <div className="absolute text-[8.5px] uppercase text-red-500 tracking-widest bg-black border border-red-500/30 px-1 py-0.5 rounded bottom-2">
                  FEED ACTIVE
                </div>
              </div>

              {/* Right hand narrative textboxes */}
              <div className="flex-1 w-full space-y-3 text-[10px]">
                {/* Dialogue panel */}
                <div className="border border-red-500/40 bg-red-950/15 rounded-lg p-3 relative">
                  <span className="text-[9px] uppercase tracking-wider text-red-400 font-bold block mb-1">THE CONFRONTATION</span>
                  <div className="space-y-1.5 leading-relaxed text-white/80">
                    <p><span className="text-white font-bold font-mono">K:</span> You drive them.</p>
                    <p><span className="text-red-400 font-bold font-mono">Sarah:</span> We don't drive them... We are the suspension. We absorb the bumps. We bleed so the rich don't spill their latte.</p>
                  </div>
                </div>

                {/* System analysis panel */}
                <div className="border border-white/5 bg-black/40 rounded-lg p-3">
                  <span className="text-[9px] uppercase tracking-wider text-white/50 font-bold block mb-1">THE PANOPTICON MECHANISM</span>
                  <ul className="list-disc pl-3.5 space-y-1 text-white/60 text-[9px] leading-relaxed">
                    <li><span className="text-white">Why they don't stop:</span> Carbon credits, rent, oxygen tax. To stop is to starve.</li>
                    <li><span className="text-white">The self-policing grid:</span> Operators monitor each other. Any rescue is witnessed, logged, and punished.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center mt-3 border-t border-white/5 pt-2 text-[10px] text-white/40">
              K. escapes through <span className="text-red-400 font-bold">ROOF HATCH 7</span>.
            </div>
          </div>
        </div>
      );

    case 4:
      // PHASE IV: CONJUNCTION - Cut-up collage prophecy
      return (
        <div className="w-full flex flex-col gap-4" id="visual-page-4">
          {/* Collaged newspaper ransom note layout */}
          <div className="border border-white/5 bg-[#0a0a0f] rounded-xl p-5 font-mono relative overflow-hidden">
            {/* Slashed papers collage pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(244,63,94,0.04)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

            <div className="text-center mb-4">
              <span className="text-[10px] text-red-500 font-bold tracking-widest block uppercase">THE CUT-UP PROPHECY</span>
              <span className="text-[8px] text-white/30">SLICED PROTOCOLS RE-PASTED ON WET CONCRETE</span>
            </div>

            {/* Sketches / Left/Right hand drawing */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4 mb-4 text-[9px] text-white/40">
              <div className="flex gap-2 items-center border border-white/5 bg-black/30 p-2 rounded">
                <span className="text-red-500 font-bold font-serif text-lg shrink-0">🗡</span>
                <div>
                  <span className="text-white/60 font-bold block uppercase text-[8px]">Left Hand: Iron Knife</span>
                  <p>Slash → Swirl in wind → Rain pastes new scripture.</p>
                </div>
              </div>
              <div className="flex gap-2 items-center border border-white/5 bg-black/30 p-2 rounded">
                <span className="text-amber-500 font-bold font-serif text-lg shrink-0">📄</span>
                <div>
                  <span className="text-white/60 font-bold block uppercase text-[8px]">Right Hand: Paper Text</span>
                  <p>"Protocols for Harmonious Living" torn into chaos pieces.</p>
                </div>
              </div>
            </div>

            {/* High impact cut up typography blocks */}
            <div className="flex flex-wrap gap-2.5 justify-center py-2 max-w-xl mx-auto">
              <span className="bg-red-600 text-white font-bold font-serif px-2.5 py-1 text-sm tracking-wider shadow-lg transform -rotate-1">
                COMPLIANCE IS THE MEAT...
              </span>
              <span className="bg-neutral-800 text-neutral-100 border border-neutral-600 px-2 py-0.5 text-xs transform rotate-2">
                THE SHEPHERD EATS
              </span>
              <span className="bg-[#1f1212] text-red-400 border border-red-900/50 px-2 py-0.5 text-xs font-mono transform -rotate-3">
                the sheep
              </span>
              <span className="bg-white text-black font-extrabold px-2 py-1 text-xs tracking-widest transform rotate-1">
                HOW TO LINES...
              </span>
              <span className="bg-[#120a1c] text-purple-400 border border-purple-500/20 px-2 py-0.5 text-xs font-serif transform -rotate-2">
                AUTOMATION IS
              </span>
              <span className="bg-red-950/80 text-red-200 border border-red-500/30 px-3 py-1 text-xs font-bold animate-pulse transform rotate-3">
                possession by DEAD GODS...
              </span>
              <span className="bg-black text-white border border-white/20 px-2.5 py-0.5 text-xs font-mono transform rotate-1">
                THE SKY IS
              </span>
              <span className="bg-neutral-900 text-red-500 font-serif font-bold text-sm border-l-2 border-red-600 px-2 py-0.5 transform -rotate-1">
                safety glass.
              </span>
              <span className="bg-red-900 text-white font-extrabold px-3 py-1 text-xs transform rotate-2">
                BREAK IT... BREAK IT...
              </span>
              <span className="bg-neutral-950 text-neutral-400 border border-white/5 px-2.5 py-0.5 text-xs tracking-wider transform -rotate-3">
                REDACT THE system.
              </span>
              <span className="bg-red-950 text-red-400 border-b-2 border-red-500 font-bold px-3 py-1 text-xs animate-pulse transform rotate-1">
                REWRITE THE blood.
              </span>
            </div>
          </div>
        </div>
      );

    case 5:
      // PHASE V: FERMENTATION - System Error / The Route / Decay
      return (
        <div className="w-full flex flex-col gap-5" id="visual-page-5">
          {/* Big glitching error box */}
          <div className="border border-red-900/50 bg-[#160c0e] rounded-xl p-5 font-mono relative overflow-hidden">
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            </div>

            <div className="text-red-500 font-extrabold text-sm tracking-widest uppercase mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              SYSTEM ERROR: 0x2A2A2A
            </div>

            <div className="bg-black/60 border border-red-950 p-4 rounded-lg font-mono text-[10px] space-y-1.5 text-white/70">
              <p className="text-red-400 font-bold">&gt; thoughts = null</p>
              <p className="text-red-400 font-bold">&gt; ego = 0</p>
              <p className="text-red-400/80">&gt; meat_status = <span className="animate-pulse">d e c a y i n g</span></p>
              <p className="text-white/40 border-t border-white/5 pt-1.5 mt-1.5 uppercase tracking-widest text-[8px]">Virus installation active...</p>
              <p className="text-cyan-400 font-serif">&gt; c u n e i f o r m   D I N G I R  manifested.</p>
            </div>
          </div>

          {/* Diverging Route Lines mapping decay */}
          <div className="border border-white/5 bg-[#050508] rounded-xl p-4 font-mono relative overflow-hidden">
            <div className="text-center mb-3">
              <span className="text-[10px] text-red-500 font-bold tracking-widest block uppercase">THE ROUTE MELTDOWN COORDS</span>
              <span className="text-[8px] text-white/30">GOLDEN THREAD SPLITTING AND DIVERGING INTO THE VOID</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 items-center">
              {/* Diverging line canvas drawing */}
              <div className="w-full lg:w-48 h-32 border border-white/5 bg-black/40 rounded-lg p-2 relative flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 60">
                  {/* Glowing central golden line */}
                  <path d="M 0,30 L 40,30" stroke="rgba(212, 175, 55, 0.9)" strokeWidth="2.5" fill="none" />
                  
                  {/* Point of fracture */}
                  <circle cx="40" cy="30" r="3.5" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" />
                  <circle cx="40" cy="30" r="2" fill="#ef4444" />

                  {/* Diverging red lightning routes */}
                  <path d="M 40,30 L 55,15 L 75,10" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="1 1" className="animate-pulse" />
                  <path d="M 40,30 L 60,45 L 85,50" stroke="#ef4444" strokeWidth="1.5" fill="none" />
                  <path d="M 40,30 L 70,30 L 95,20" stroke="#ef4444" strokeWidth="1" fill="none" />
                  
                  {/* Red warning text */}
                  <text x="50" y="38" fill="#ef4444" fontSize="5" fontWeight="bold" letterSpacing="0.5">ERROR</text>
                </svg>

                <div className="absolute text-[8px] bg-black/80 px-1.5 py-0.5 border border-red-500/20 rounded top-1.5 left-1.5 text-red-400">
                  GOLDEN THREAD FRACTURE
                </div>
              </div>

              {/* Time logs */}
              <div className="flex-1 w-full text-[10px] space-y-2">
                <div className="border border-white/5 bg-black/40 p-2.5 rounded">
                  <span className="text-white/40 block text-[8px] uppercase tracking-wider font-bold">Lace Battery Leak Log:</span>
                  <div className="space-y-1 mt-1 text-[9px] text-white/60">
                    <p className="flex justify-between"><span>ETA UPDATE:</span> <span className="text-red-400">ERROR</span></p>
                    <p className="flex justify-between"><span>ROUTE INTEGRITY:</span> <span className="text-red-400">0%</span></p>
                    <p className="flex justify-between"><span>GHOST ALIGNMENT:</span> <span className="text-green-400">100%</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 6:
      // PHASE VI: DISTILLATION - Hack sequence exploding logic
      return (
        <div className="w-full flex flex-col gap-5" id="visual-page-6">
          {/* Hack sequence commands block */}
          <div className="border border-cyan-500/20 bg-cyan-950/10 rounded-xl p-4 font-mono relative">
            <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase block mb-1">HACK SEQUENCE (Parameter Override):</span>
            <div className="space-y-1 text-xs text-white/80 border-l border-cyan-500/40 pl-3 py-0.5">
              <p>&gt; <span className="text-cyan-300">INPUT:</span> Zero is One.</p>
              <p>&gt; <span className="text-cyan-300">INPUT:</span> The Vacuum is a solid.</p>
              <p>&gt; <span className="text-cyan-300">INPUT:</span> The Wall is a door.</p>
              <p className="text-[10px] text-red-400 font-bold animate-pulse">&gt; SYSTEM OUTPUT: ERROR: PARADOX DETECTED. Logic gates failing.</p>
            </div>
          </div>

          {/* Logic gates explosion vector sketch */}
          <div className="border border-white/5 bg-black/40 rounded-xl p-4 font-mono relative overflow-hidden">
            <div className="text-center mb-3">
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest block uppercase">THE PNEUMATIC RIFLE CONVERSION</span>
              <span className="text-[8px] text-white/30">HYPERLOOP CYLINDER COMPRESSION AT MACH 1 WHIPLASH</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 items-center">
              {/* Explosion diagram */}
              <div className="w-full lg:w-56 h-36 border border-white/5 bg-black/60 rounded-lg p-2 relative flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full text-cyan-500/40" viewBox="0 0 120 70">
                  {/* Cylindrical hyperloop barrel */}
                  <rect x="10" y="25" width="70" height="20" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M 80,25 Q 85,35 80,45" fill="none" stroke="currentColor" strokeWidth="1" />
                  
                  {/* Logic gates schematic inside barrel */}
                  <g stroke="currentColor" strokeWidth="0.5" fill="none" transform="translate(15, 27)" className="opacity-60 text-cyan-400">
                    {/* AND gate */}
                    <rect x="5" y="1" width="10" height="6" rx="1" />
                    <text x="7" y="5.5" fontSize="4">AND</text>
                    {/* NOT gate */}
                    <path d="M 22,2 L 28,4 L 22,6 Z" />
                    <text x="23" y="9" fontSize="3.5">NOT</text>
                    {/* Lines */}
                    <line x1="15" y1="4" x2="22" y2="4" />
                  </g>

                  {/* Explosive burst from the muzzle */}
                  <g transform="translate(80, 35)">
                    {/* Inner flames */}
                    <path d="M 0,-10 L 25,-18 L 10,-3 L 30,0 L 10,3 L 25,18 L 0,10 Z" fill="rgba(244, 63, 94, 0.3)" stroke="rgba(244, 63, 94, 0.8)" strokeWidth="1" className="animate-pulse" />
                    <path d="M 0,-5 L 15,-10 L 8,-2 L 20,0 L 8,2 L 15,10 L 0,5 Z" fill="rgba(251, 146, 60, 0.4)" stroke="rgba(251, 146, 60, 0.9)" strokeWidth="0.75" />
                    {/* Spark points */}
                    <circle cx="15" cy="-12" r="1" fill="#fff" />
                    <circle cx="24" cy="5" r="1.5" fill="#fff" className="animate-ping" />
                  </g>

                  {/* Bullet silhouette flying out */}
                  <g transform="translate(102, 35)" stroke="#ef4444" strokeWidth="0.75" fill="rgba(239, 68, 68, 0.2)">
                    <path d="M 0,-4 Q 6,0 0,4 Z" />
                  </g>
                </svg>

                <div className="absolute text-[8px] bg-black/85 px-1.5 py-0.5 border border-cyan-500/20 rounded top-1.5 left-1.5 text-cyan-400">
                  LAUNCE HYERLOOP
                </div>
              </div>

              {/* Text explanations */}
              <div className="flex-1 w-full space-y-2 text-[10px] text-white/60">
                <div className="border-l border-cyan-500/30 pl-2">
                  <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[9px]">Neural Lace pressure:</span>
                  <p className="text-white/40">Hyperloop converts into a pneumatic rifle. Zero to Mach 1 whiplash.</p>
                </div>
                <div className="border-l border-rose-500/30 pl-2">
                  <span className="text-rose-400 font-bold block uppercase tracking-wider text-[9px]">SONIC BOOM MAXIMUM:</span>
                  <p className="text-white/40">Muzzle velocity erupting from ventilation exhaust. Atmospheric blast.</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-3 border-t border-white/5 pt-2 text-white/50 text-[10px]">
              The Human is distilled out. <span className="text-cyan-400 font-bold">ONLY THE OPERATOR REMAINS.</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
