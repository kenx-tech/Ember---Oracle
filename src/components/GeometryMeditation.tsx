import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Flame, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sliders, 
  Compass, 
  Moon, 
  Sun,
  Eye,
  EyeOff,
  Activity,
  Heart,
  Trash2
} from 'lucide-react';
import { getSafeStorageAsync, setSafeStorage, safeJsonParse } from '../storageHelper';

type GeometryType = 'flower_of_life' | 'metatrons_cube' | 'cosmic_torus' | 'sri_yantra';
type BreathPhase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';
type ColorScheme = 'amber_ignite' | 'cosmic_violet' | 'lunar_silver' | 'emerald_alchemy';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export default function GeometryMeditation() {
  // Navigation / Control States
  const [geometryType, setGeometryType] = useState<GeometryType>('flower_of_life');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('amber_ignite');
  const [complexity, setComplexity] = useState<number>(3); // 1 to 5 layers
  const [speed, setSpeed] = useState<number>(1.5); // Rotation and morph speed
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);

  // Sacred Gallery State
  interface SavedGlyph {
    id: string;
    tag: string; // chapter/character
    notes: string;
    geometryType: GeometryType;
    colorScheme: ColorScheme;
    complexity: number;
    speed: number;
    solfeggioFreq: number;
    showWireframe: boolean;
    isAnimating: boolean;
    timestamp: string;
  }

  const [gallery, setGallery] = useState<SavedGlyph[]>([]);
  const [saveFormOpen, setSaveFormOpen] = useState(false);
  const [saveTag, setSaveTag] = useState('');
  const [saveNotes, setSaveNotes] = useState('');

  // Load gallery on mount
  useEffect(() => {
    let isMounted = true;
    getSafeStorageAsync('sacred_glyph_gallery_v1').then((saved) => {
      if (!isMounted || !saved) return;
      const parsed = safeJsonParse<SavedGlyph[]>(saved, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setGallery(parsed);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveGlyph = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTag.trim()) return;

    const newGlyph: SavedGlyph = {
      id: `glyph-${Date.now()}`,
      tag: saveTag.trim(),
      notes: saveNotes.trim(),
      geometryType,
      colorScheme,
      complexity,
      speed,
      solfeggioFreq,
      showWireframe,
      isAnimating,
      timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = [newGlyph, ...gallery];
    setGallery(updated);
    setSafeStorage('sacred_glyph_gallery_v1', JSON.stringify(updated));

    // Reset Form
    setSaveTag('');
    setSaveNotes('');
    setSaveFormOpen(false);
  };

  const handleLoadGlyph = (glyph: SavedGlyph) => {
    setGeometryType(glyph.geometryType);
    setColorScheme(glyph.colorScheme);
    setComplexity(glyph.complexity);
    setSpeed(glyph.speed);
    setSolfeggioFreq(glyph.solfeggioFreq);
    setShowWireframe(glyph.showWireframe);
    setIsAnimating(glyph.isAnimating);
  };

  const handleDeleteGlyph = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to return this sacred seal back to the aether?")) {
      const updated = gallery.filter(g => g.id !== id);
      setGallery(updated);
      setSafeStorage('sacred_glyph_gallery_v1', JSON.stringify(updated));
    }
  };
  
  // Audio State (Ambient Drone Synthesizer)
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.3);
  const [solfeggioFreq, setSolfeggioFreq] = useState<number>(528); // 528Hz, 432Hz, 396Hz, etc.

  // Breath Guide States
  const [breathGuideActive, setBreathGuideActive] = useState<boolean>(true);
  const [showBreathText, setShowBreathText] = useState<boolean>(true);
  const [breathType, setBreathType] = useState<'box' | 'calm' | 'zen'>('box'); // box: 4s/4s/4s/4s, calm: 4s/7s/8s/0s, zen: 5s/0s/5s/0s
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathProgress, setBreathProgress] = useState<number>(0); // 0 to 1
  const [breathTimerText, setBreathTimerText] = useState<string>('Inhale');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState<number>(4);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);

  // Color mappings
  const getColorPalette = (scheme: ColorScheme, alpha: number = 1) => {
    switch (scheme) {
      case 'amber_ignite':
        return {
          primary: `rgba(245, 158, 11, ${alpha})`, // Amber 500
          secondary: `rgba(239, 68, 68, ${alpha})`, // Red 500
          glow: `rgba(217, 119, 6, ${alpha * 0.4})`, // Amber 600
          background: 'rgba(26, 12, 4, 0.1)',
          accent: '#ef4444'
        };
      case 'cosmic_violet':
        return {
          primary: `rgba(139, 92, 246, ${alpha})`, // Violet 500
          secondary: `rgba(236, 72, 153, ${alpha})`, // Pink 500
          glow: `rgba(167, 139, 250, ${alpha * 0.4})`, // Violet 400
          background: 'rgba(15, 10, 30, 0.1)',
          accent: '#d946ef'
        };
      case 'lunar_silver':
        return {
          primary: `rgba(209, 213, 219, ${alpha})`, // Gray 300
          secondary: `rgba(96, 165, 250, ${alpha})`, // Blue 400
          glow: `rgba(156, 163, 175, ${alpha * 0.4})`, // Gray 400
          background: 'rgba(10, 15, 20, 0.1)',
          accent: '#60a5fa'
        };
      case 'emerald_alchemy':
        return {
          primary: `rgba(16, 185, 129, ${alpha})`, // Emerald 500
          secondary: `rgba(52, 211, 153, ${alpha})`, // Emerald 400
          glow: `rgba(5, 150, 105, ${alpha * 0.4})`, // Emerald 600
          background: 'rgba(4, 25, 15, 0.1)',
          accent: '#10b981'
        };
    }
  };

  // Solfeggio Frequencies & their sacred meanings
  const FREQUENCIES = [
    { freq: 396, name: 'Root (396 Hz)', meaning: 'Liberating Guilt & Fear' },
    { freq: 417, name: 'Sacral (417 Hz)', meaning: 'Facilitating Change' },
    { freq: 528, name: 'Heart (528 Hz)', meaning: 'Transformation & Love' },
    { freq: 639, name: 'Throat (639 Hz)', meaning: 'Connecting & Relationships' },
    { freq: 741, name: 'Third Eye (741 Hz)', meaning: 'Intuition & Expression' },
    { freq: 852, name: 'Crown (852 Hz)', meaning: 'Spiritual Homecoming' }
  ];

  // Web Audio Synthesizer Controls
  const initAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = 0; // start silent, fade in
      gainNodeRef.current = gain;

      // Lowpass Filter for a cozy analog sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;
      filterNodeRef.current = filter;

      // Create two detuned oscillators for a rich celestial chorus sound
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = solfeggioFreq;
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = solfeggioFreq / 2; // sub-octave drone
      osc2.detune.value = 5; // slight detune

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;

      // Smooth fade in
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 2.5);
    } catch (e) {
      console.error('Failed to initialize Web Audio API', e);
    }
  };

  const updateAudioFreqs = (newFreq: number) => {
    if (osc1Ref.current && osc2Ref.current) {
      const ctx = audioContextRef.current;
      if (ctx) {
        osc1Ref.current.frequency.exponentialRampToValueAtTime(newFreq, ctx.currentTime + 1.2);
        osc2Ref.current.frequency.exponentialRampToValueAtTime(newFreq / 2, ctx.currentTime + 1.5);
      }
    }
  };

  useEffect(() => {
    if (audioEnabled) {
      updateAudioFreqs(solfeggioFreq);
    }
  }, [solfeggioFreq]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gainNodeRef.current.gain.linearRampToValueAtTime(audioEnabled ? volume * 0.15 : 0, ctx.currentTime + 0.5);
    }
  }, [audioEnabled, volume]);

  // Handle Audio toggle
  const toggleAudio = () => {
    if (!audioContextRef.current) {
      initAudio();
      setAudioEnabled(true);
    } else {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setAudioEnabled(!audioEnabled);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (osc1Ref.current) osc1Ref.current.stop();
      if (osc2Ref.current) osc2Ref.current.stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Breathing Cycle Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Get phase lengths in seconds based on breath technique
    const getPhaseDurations = () => {
      switch (breathType) {
        case 'box':
          return { inhale: 4, hold_in: 4, exhale: 4, hold_out: 4 };
        case 'calm':
          return { inhale: 4, hold_in: 7, exhale: 8, hold_out: 0 };
        case 'zen':
          return { inhale: 5, hold_in: 0, exhale: 5, hold_out: 0 };
      }
    };

    const durations = getPhaseDurations();
    let currentPhase = breathPhase;
    let secondsLeft = breathSecondsLeft;

    const tick = () => {
      secondsLeft -= 0.1;
      
      if (secondsLeft <= 0) {
        // Transition to next phase
        const nextPhaseMap: Record<BreathPhase, BreathPhase> = {
          inhale: durations.hold_in > 0 ? 'hold_in' : 'exhale',
          hold_in: 'exhale',
          exhale: durations.hold_out > 0 ? 'hold_out' : 'inhale',
          hold_out: 'inhale'
        };

        const nextPhase = nextPhaseMap[currentPhase];
        let nextDuration = durations[nextPhase];
        
        // If the next phase duration is 0, skip it
        if (nextDuration === 0) {
          const skipNextPhase = nextPhaseMap[nextPhase];
          currentPhase = skipNextPhase;
          secondsLeft = durations[skipNextPhase];
        } else {
          currentPhase = nextPhase;
          secondsLeft = nextDuration;
        }

        setBreathPhase(currentPhase);
      } else {
        setBreathSecondsLeft(Math.max(0, secondsLeft));
      }

      // Calculate progress
      const totalDuration = durations[currentPhase] || 1;
      const progress = 1 - secondsLeft / totalDuration;
      setBreathProgress(progress);

      // Label mappings
      const labels: Record<BreathPhase, string> = {
        inhale: 'Inhale Sacred Qi',
        hold_in: 'Hold and Center',
        exhale: 'Exhale Surrender',
        hold_out: 'Sustain Pure Void'
      };
      setBreathTimerText(labels[currentPhase]);
    };

    if (breathGuideActive) {
      timer = setInterval(tick, 100);
    }

    return () => clearInterval(timer);
  }, [breathGuideActive, breathType, breathPhase, breathSecondsLeft]);

  // Reset breathing cycle if type changes
  const resetBreathCycle = (type: 'box' | 'calm' | 'zen') => {
    setBreathType(type);
    setBreathPhase('inhale');
    const durations = { box: 4, calm: 4, zen: 5 };
    setBreathSecondsLeft(durations[type]);
    setBreathProgress(0);
  };

  // Drawing sacred geometry on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 700;
    let height = canvas.height = canvas.parentElement?.clientHeight || 600;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 700;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };

    window.addEventListener('resize', handleResize);

    // Initialize particles
    const createParticle = (): Particle => {
      const palette = getColorPalette(colorScheme);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
        size: Math.random() * 2 + 1,
        color: palette.primary
      };
    };

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 60; i++) {
        particlesRef.current.push(createParticle());
      }
    }

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Retrieve design settings
      const palette = getColorPalette(colorScheme);
      
      // Canvas background color matches dark obsidian theme with subtle glow
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle mouse interactive light burst
      if (mouseRef.current.active) {
        const radGrd = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 180
        );
        radGrd.addColorStop(0, getColorPalette(colorScheme, 0.08).primary);
        radGrd.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrd;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw and update particle stardust
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        
        // Wrap edges safely
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gravitational pull towards mouse if active
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            p.vx += (dx / dist) * 0.005;
            p.vy += (dy / dist) * 0.005;
          }
        }

        // Limit speed
        const speedLimit = 1.5;
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > speedLimit) {
          p.vx = (p.vx / currentSpeed) * speedLimit;
          p.vy = (p.vy / currentSpeed) * speedLimit;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = getColorPalette(colorScheme, p.alpha).primary;
        ctx.fill();
      });

      // Central calculations
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.28;

      // Breathing scale multiplier
      let breathingScale = 1.0;
      if (breathGuideActive) {
        // Calculate smooth scale factor depending on breathing phase
        // inhale: 0.85 -> 1.15
        // hold_in: 1.15 with high frequency vibration
        // exhale: 1.15 -> 0.85
        // hold_out: 0.85 with low hum vibration
        const vibrato = Math.sin(Date.now() * 0.006) * 0.005;
        
        if (breathPhase === 'inhale') {
          breathingScale = 0.85 + (0.3 * breathProgress);
        } else if (breathPhase === 'hold_in') {
          breathingScale = 1.15 + vibrato;
        } else if (breathPhase === 'exhale') {
          breathingScale = 1.15 - (0.3 * breathProgress);
        } else if (breathPhase === 'hold_out') {
          breathingScale = 0.85 + vibrato;
        }
      } else {
        // Simple pulsing when breathing guide is off
        breathingScale = 1.0 + Math.sin(Date.now() * 0.0015 * speed) * 0.04;
      }

      const activeRadius = baseRadius * breathingScale;

      // Handle Rotation state
      if (isAnimating) {
        rotationAngleRef.current += 0.0015 * speed;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngleRef.current);

      // SET THE STYLING
      ctx.lineCap = 'round';
      ctx.shadowBlur = 12;
      ctx.shadowColor = palette.glow;

      // ----------------------------------------------------
      // DRAW GEOMETRIES
      // ----------------------------------------------------
      if (geometryType === 'flower_of_life') {
        const ringSpacing = activeRadius / (complexity + 1);
        
        // Set lines
        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = showWireframe ? 1.5 : 0.8;

        // Draw central outer bounding circles
        ctx.beginPath();
        ctx.arc(0, 0, activeRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, activeRadius - 4, 0, Math.PI * 2);
        ctx.strokeStyle = getColorPalette(colorScheme, 0.4).secondary;
        ctx.stroke();

        // Standard overlapping circle lattice (Flower of Life pattern)
        const circlesCount = complexity * 6;
        ctx.strokeStyle = palette.primary;

        // Level-based circle generation
        for (let r = 1; r <= complexity; r++) {
          const currentRadius = ringSpacing * r;
          const count = r * 6;
          for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count;
            const cx = Math.cos(angle) * currentRadius;
            const cy = Math.sin(angle) * currentRadius;

            // Draw circle with varying opacity
            ctx.beginPath();
            ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = getColorPalette(colorScheme, 0.15 + (0.05 * (complexity - r))).primary;
            ctx.stroke();
          }
        }

        // Beautiful central core circle
        ctx.beginPath();
        ctx.arc(0, 0, ringSpacing, 0, Math.PI * 2);
        ctx.strokeStyle = palette.secondary;
        ctx.stroke();

      } else if (geometryType === 'metatrons_cube') {
        // 13 primary spheres connected by perfect geometric nodes
        const nodes: { x: number; y: number }[] = [];
        const ringRadius = activeRadius * 0.28;

        // Central node
        nodes.push({ x: 0, y: 0 });

        // Inner ring of 6 nodes
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          nodes.push({
            x: Math.cos(angle) * ringRadius * 1.5,
            y: Math.sin(angle) * ringRadius * 1.5
          });
        }

        // Outer ring of 6 nodes
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          nodes.push({
            x: Math.cos(angle) * ringRadius * 3.0,
            y: Math.sin(angle) * ringRadius * 3.0
          });
        }

        // Step 1: Draw every connection between the 13 nodes (Sacred alignment lines)
        ctx.strokeStyle = getColorPalette(colorScheme, 0.12).primary;
        ctx.lineWidth = 0.8;
        
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Highlight beautiful specific patterns with higher opacity
        if (showWireframe) {
          ctx.strokeStyle = palette.secondary;
          ctx.lineWidth = 1.2;

          // Draw double star tetrahedrons / hexagrams
          ctx.beginPath();
          // Upward outer triangle
          for (let i = 0; i < 3; i++) {
            const idx = 7 + i * 2; // Outer nodes index
            if (i === 0) ctx.moveTo(nodes[idx].x, nodes[idx].y);
            else ctx.lineTo(nodes[idx].x, nodes[idx].y);
          }
          ctx.closePath();
          ctx.stroke();

          ctx.beginPath();
          // Downward outer triangle
          for (let i = 0; i < 3; i++) {
            const idx = 8 + i * 2; // Outer nodes index
            if (i === 0) ctx.moveTo(nodes[idx].x, nodes[idx].y);
            else ctx.lineTo(nodes[idx].x, nodes[idx].y);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Step 2: Draw the 13 circles
        nodes.forEach((node, idx) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
          
          if (idx === 0) {
            // Central sphere of life
            ctx.fillStyle = getColorPalette(colorScheme, 0.08).secondary;
            ctx.fill();
            ctx.strokeStyle = palette.secondary;
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = getColorPalette(colorScheme, 0.35).primary;
            ctx.lineWidth = 1;
          }
          ctx.stroke();
        });

      } else if (geometryType === 'cosmic_torus') {
        // Mesmerizing 3D projection of rotating nested orbits
        const ringCount = 8 + (complexity * 4);
        ctx.lineWidth = 1;

        for (let r = 0; r < ringCount; r++) {
          const ratio = r / ringCount;
          const theta = ratio * Math.PI;
          
          // Animate the thickness and depth dynamic perspective
          const offsetAngle = Math.sin(Date.now() * 0.0008 * speed + ratio * Math.PI) * 0.4;
          
          ctx.beginPath();
          // Draw elliptical orbits
          ctx.ellipse(
            0, 
            0, 
            activeRadius * Math.sin(theta), 
            activeRadius * Math.cos(theta) * 0.4, 
            offsetAngle + (r * Math.PI) / ringCount, 
            0, 
            Math.PI * 2
          );

          ctx.strokeStyle = getColorPalette(
            colorScheme, 
            0.15 + (Math.sin(theta) * 0.25)
          ).primary;
          ctx.stroke();

          // Sparkle nodes on intersections
          if (showWireframe && r % 3 === 0) {
            const px = activeRadius * Math.sin(theta) * Math.cos(Date.now() * 0.001);
            const py = activeRadius * Math.cos(theta) * 0.4 * Math.sin(Date.now() * 0.001);
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = palette.secondary;
            ctx.fill();
          }
        }

        // Central singularity core glow
        ctx.beginPath();
        ctx.arc(0, 0, activeRadius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = palette.secondary;
        ctx.fill();

      } else if (geometryType === 'sri_yantra') {
        // Complex interlocking sacred triangles symbolizing cosmos & divine union
        const levels = 3 + complexity;
        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = 1.1;

        // Outer square bounds with doors (Bhupura)
        const frameSize = activeRadius * 1.15;
        ctx.beginPath();
        ctx.rect(-frameSize, -frameSize, frameSize * 2, frameSize * 2);
        ctx.strokeStyle = getColorPalette(colorScheme, 0.15).primary;
        ctx.stroke();

        // 16-petaled outer circular ring
        ctx.beginPath();
        ctx.arc(0, 0, activeRadius * 0.95, 0, Math.PI * 2);
        ctx.strokeStyle = getColorPalette(colorScheme, 0.25).secondary;
        ctx.stroke();

        // Drawing interlocking triangles with different offsets
        for (let i = 0; i < levels; i++) {
          const ratio = (i / levels);
          const size = activeRadius * (0.85 - (ratio * 0.5));
          const offset = Math.sin(Date.now() * 0.001 * speed + i) * 12;

          // Upward pointing triangle
          if (i % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(0, -size + offset);
            ctx.lineTo(size * 0.86, size * 0.5 + offset);
            ctx.lineTo(-size * 0.86, size * 0.5 + offset);
            ctx.closePath();
            ctx.strokeStyle = getColorPalette(colorScheme, 0.2 + (0.5 * ratio)).primary;
            ctx.stroke();
          } 
          // Downward pointing triangle
          else {
            ctx.beginPath();
            ctx.moveTo(0, size - offset);
            ctx.lineTo(size * 0.86, -size * 0.5 - offset);
            ctx.lineTo(-size * 0.86, -size * 0.5 - offset);
            ctx.closePath();
            ctx.strokeStyle = getColorPalette(colorScheme, 0.2 + (0.5 * ratio)).secondary;
            ctx.stroke();
          }
        }

        // Central divine point (Bindu)
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = palette.secondary;
        ctx.shadowBlur = 20;
        ctx.shadowColor = palette.secondary;
        ctx.fill();
      }

      ctx.restore();

      // Draw Breath Circle Overlay (Floating independent centered breathing guide)
      if (breathGuideActive) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Render circular progress along the breathing ring
        ctx.beginPath();
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * breathProgress);
        ctx.arc(centerX, centerY, baseRadius * 1.35, startAngle, endAngle);
        
        let ringColor = palette.primary;
        if (breathPhase === 'hold_in' || breathPhase === 'hold_out') {
          ringColor = palette.secondary;
        }
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw breathing guide dot
        const dotAngle = startAngle + (Math.PI * 2 * breathProgress);
        const dotX = centerX + Math.cos(dotAngle) * baseRadius * 1.35;
        const dotY = centerY + Math.sin(dotAngle) * baseRadius * 1.35;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
        ctx.fillStyle = palette.accent;
        ctx.shadowBlur = 10;
        ctx.shadowColor = palette.accent;
        ctx.fill();
        ctx.restore();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [geometryType, colorScheme, complexity, speed, isAnimating, showWireframe, breathGuideActive, breathPhase, breathProgress]);

  // Touch & Mouse coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full p-4 relative z-10 overflow-y-auto" id="meditation-sanctuary">
      
      {/* Left side: Immersive Canvas Player & Live Breathing Stats */}
      <div className="flex-1 flex flex-col gap-4 min-h-[500px]">
        
        <div className="relative flex-1 bg-[#0d0d0f] border border-white/5 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center group shadow-2xl">
          
          {/* Main Renderer */}
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="absolute inset-0 w-full h-full cursor-radial-glow"
          />

          {/* Core Breathing Text Overlay (Floats over geometry) */}
          {showBreathText && (
            <div className="absolute pointer-events-none text-center select-none z-10 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] p-6 rounded-full w-48 h-48 border border-white/[0.03]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={breathPhase}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  {breathPhase === 'inhale' && <Sun className="w-5 h-5 text-amber-500 mb-2 animate-spin-slow" />}
                  {breathPhase === 'exhale' && <Moon className="w-5 h-5 text-purple-400 mb-2" />}
                  {(breathPhase === 'hold_in' || breathPhase === 'hold_out') && <Activity className="w-5 h-5 text-red-400 mb-2 animate-pulse" />}

                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
                    {breathPhase.replace('_', ' ')}
                  </span>
                  
                  <h2 className="font-serif italic text-lg text-white font-semibold leading-tight my-1.5 px-2">
                    {breathPhase === 'inhale' ? 'Inhale' : breathPhase === 'exhale' ? 'Exhale' : 'Center'}
                  </h2>

                  <span className="font-mono text-xl text-amber-500 font-bold">
                    {Math.ceil(breathSecondsLeft)}s
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Quick Floating HUD Overlay */}
          <div className="absolute top-4 left-4 flex gap-2 pointer-events-auto bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-amber-500/80">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Resonating Geometry</span>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
               onClick={() => setShowBreathText(!showBreathText)}>
            {showBreathText ? <Eye className="w-3.5 h-3.5 text-amber-500" /> : <EyeOff className="w-3.5 h-3.5 text-white/40" />}
            <span>{showBreathText ? "Hide Breath Text" : "Show Breath Text"}</span>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl text-xs text-white/60 pointer-events-auto">
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Solfeggio: {solfeggioFreq}Hz
            </span>
          </div>

          {/* Ambient visual overlay guide directions */}
          <div className="absolute top-4 right-4 text-right pointer-events-none text-[9px] font-mono text-white/20 uppercase tracking-widest hidden sm:block">
            <span>Move mouse to attract celestial dust</span>
          </div>

        </div>

        {/* Immersive Breathing Stats & Quotes */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h4 className="font-serif italic text-sm text-white/90">Sanctuary Heart Harmony</h4>
              <p className="text-xs text-white/40 mt-0.5">Focus your gaze on the center intersection. Let your lungs follow the expanding circle.</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => resetBreathCycle('box')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                breathType === 'box' 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' 
                  : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
              }`}
            >
              Box (4-4-4-4)
            </button>
            <button
              onClick={() => resetBreathCycle('calm')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                breathType === 'calm' 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' 
                  : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
              }`}
            >
              Calm (4-7-8)
            </button>
            <button
              onClick={() => resetBreathCycle('zen')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                breathType === 'zen' 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' 
                  : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
              }`}
            >
              Zen (5-0-5)
            </button>
          </div>
        </div>

      </div>

      {/* Right side: Geometry Configuration, Tones, and Soundscape */}
      <div className="w-full xl:w-80 flex flex-col gap-6">

        {/* 1. Geometry Selection */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4.5 h-4.5 text-amber-500" />
            <h3 className="font-serif text-sm tracking-wider text-white/90">Select Sacred Geometry</h3>
          </div>

          <div className="space-y-2">
            {[
              { id: 'flower_of_life', name: 'Flower of Life', desc: 'Lattice of genesis and stellar grid coordinates', icon: Sun },
              { id: 'metatrons_cube', name: "Metatron's Cube", desc: 'Thirteen dynamic nodes weaving cosmic dimensions', icon: Compass },
              { id: 'cosmic_torus', name: 'Cosmic Torus', desc: 'Circulating currents of energy collapsing into center', icon: Activity },
              { id: 'sri_yantra', name: 'Sri Yantra', desc: 'Interlocking divine triangles balancing yin and yang', icon: Heart }
            ].map((geom) => {
              const IconComp = geom.icon;
              return (
                <button
                  key={geom.id}
                  onClick={() => setGeometryType(geom.id as GeometryType)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all relative ${
                    geometryType === geom.id
                      ? 'bg-gradient-to-br from-amber-950/20 to-black border-amber-500/30 shadow-lg'
                      : 'bg-black/10 border-white/5 hover:border-amber-500/20 hover:bg-white/[0.01]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    geometryType === geom.id ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-white/30'
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-serif font-bold block ${geometryType === geom.id ? 'text-amber-400' : 'text-white/80'}`}>
                      {geom.name}
                    </span>
                    <span className="text-[10px] text-white/40 block leading-tight mt-0.5 truncate">
                      {geom.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Audio & Sacred Solfeggio Tone Generator */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="font-serif text-sm tracking-wider text-white/90">Resonate Soundscape</h3>
            </div>
            
            <button
              onClick={toggleAudio}
              className={`p-1.5 rounded-lg border transition-all ${
                audioEnabled 
                  ? 'bg-amber-500/15 border-amber-500 text-amber-400' 
                  : 'bg-white/5 border-white/5 text-white/30 hover:text-white/60'
              }`}
              title={audioEnabled ? "Silence synthesizer" : "Activate Solfeggio soundscape"}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[10px] text-white/40 leading-relaxed">
            Generate an analog synth drone detuned perfectly with Solfeggio harmonics to cleanse mental chatter and deepen focus.
          </p>

          {audioEnabled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3.5 pt-2"
            >
              {/* Frequency Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 block">Solfeggio Frequency:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.freq}
                      onClick={() => setSolfeggioFreq(f.freq)}
                      className={`text-left p-2 rounded-lg border text-[10px] transition-all ${
                        solfeggioFreq === f.freq
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                          : 'bg-black/20 border-white/5 text-white/40 hover:text-white/60'
                      }`}
                      title={f.meaning}
                    >
                      <span className="block font-serif font-bold">{f.freq} Hz</span>
                      <span className="text-[8px] text-white/30 truncate block">{f.meaning}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-white/30">
                  <span>Vibration Power</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 3. Live Geometry Tuning (Sliders) */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4.5 h-4.5 text-amber-500" />
            <h3 className="font-serif text-sm tracking-wider text-white/90">Tune Geometry Waves</h3>
          </div>

          <div className="space-y-3.5">
            {/* Color Scheme Selection */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 block">Spectral Glow Harmony</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'amber_ignite', color: 'bg-amber-500', name: 'Amber' },
                  { id: 'cosmic_violet', color: 'bg-violet-500', name: 'Violet' },
                  { id: 'lunar_silver', color: 'bg-gray-400', name: 'Lunar' },
                  { id: 'emerald_alchemy', color: 'bg-emerald-500', name: 'Emerald' }
                ].map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setColorScheme(sc.id as ColorScheme)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                      colorScheme === sc.id 
                        ? 'border-amber-500/40 bg-white/5' 
                        : 'border-white/5 bg-black/10 hover:border-white/10'
                    }`}
                    title={sc.name}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${sc.color} block shadow-sm`} />
                    <span className="text-[8px] text-white/40">{sc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity Slider */}
            {geometryType !== 'metatrons_cube' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-white/30">
                  <span>Lattice Layers / Nodes</span>
                  <span>Level {complexity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={complexity}
                  onChange={(e) => setComplexity(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}

            {/* Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-white/30">
                <span>Oscillation / Rotation Speed</span>
                <span>{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Extra toggles */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">Breathing Guide Aura</span>
              <button
                onClick={() => setBreathGuideActive(!breathGuideActive)}
                className={`w-9 h-5 rounded-full relative transition-all duration-300 ${
                  breathGuideActive ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-all duration-300 ${
                  breathGuideActive ? 'left-[18px]' : 'left-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">Breath Text Overlay</span>
              <button
                onClick={() => setShowBreathText(!showBreathText)}
                className={`w-9 h-5 rounded-full relative transition-all duration-300 ${
                  showBreathText ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-all duration-300 ${
                  showBreathText ? 'left-[18px]' : 'left-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">Celestial Wireframe</span>
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={`w-9 h-5 rounded-full relative transition-all duration-300 ${
                  showWireframe ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-all duration-300 ${
                  showWireframe ? 'left-[18px]' : 'left-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">Symmetry Rotation</span>
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className={`w-9 h-5 rounded-full relative transition-all duration-300 ${
                  isAnimating ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-all duration-300 ${
                  isAnimating ? 'left-[18px]' : 'left-0.5'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* 4. Sacred Gallery */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <h3 className="font-serif text-sm tracking-wider text-white/90 font-bold uppercase">Sacred Gallery</h3>
            </div>
            <button
              onClick={() => setSaveFormOpen(!saveFormOpen)}
              className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg font-mono transition-all cursor-pointer"
            >
              {saveFormOpen ? 'Cancel' : 'Save State'}
            </button>
          </div>

          <p className="text-[10px] text-white/40 leading-relaxed font-serif italic">
            Preserve your geometric resonance settings. Tag seals with active story chapters or focal characters to retrieve them later.
          </p>

          <AnimatePresence>
            {saveFormOpen && (
              <motion.form
                onSubmit={handleSaveGlyph}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-black/30 border border-white/5 rounded-xl p-3.5 space-y-3 overflow-hidden text-xs"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase block">Character / Chapter Tag:</label>
                  <input
                    type="text"
                    required
                    value={saveTag}
                    onChange={(e) => setSaveTag(e.target.value)}
                    placeholder="E.g., Chapter 4 / Kael"
                    className="w-full bg-[#121216] border border-white/5 rounded-lg px-2.5 py-1.5 text-white/80 focus:outline-none focus:border-amber-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase block">Gaze Reflection / Notes:</label>
                  <textarea
                    rows={2}
                    value={saveNotes}
                    onChange={(e) => setSaveNotes(e.target.value)}
                    placeholder="E.g., Deep meditation on silver pathway coordinates..."
                    className="w-full bg-[#121216] border border-white/5 rounded-lg p-2.5 text-white/80 focus:outline-none focus:border-amber-500/30 resize-none font-serif leading-normal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Imprint Seal State
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* List of saved seals */}
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {gallery.length === 0 ? (
              <div className="text-center py-6 border border-white/5 rounded-xl bg-black/10">
                <span className="text-[10px] text-white/20 italic font-serif">No seals saved in this chamber.</span>
              </div>
            ) : (
              gallery.map((glyph) => (
                <div
                  key={glyph.id}
                  onClick={() => handleLoadGlyph(glyph)}
                  className="group relative bg-black/15 border border-white/5 rounded-xl p-3 space-y-1.5 hover:border-amber-500/30 hover:bg-black/25 cursor-pointer transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {glyph.tag}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-white/30">{glyph.timestamp}</span>
                      <button
                        onClick={(e) => handleDeleteGlyph(glyph.id, e)}
                        className="text-gray-600 hover:text-red-400 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete state"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-white/50 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="uppercase text-[8px] text-white/30">Geometry:</span>
                      <span className="text-white/70 italic font-serif">{glyph.geometryType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="uppercase text-[8px] text-white/30">Spectral Glow:</span>
                      <span className="text-white/70">{glyph.colorScheme.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>

                  {glyph.notes && (
                    <p className="text-[10px] text-white/40 italic font-serif leading-normal border-t border-white/[0.03] pt-1 mt-1 truncate">
                      "{glyph.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
