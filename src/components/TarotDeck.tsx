import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  BookOpen, 
  Plus, 
  ChevronRight, 
  Moon, 
  Flame, 
  Compass, 
  Flower, 
  Shield, 
  Zap, 
  Star, 
  Eye, 
  Sun,
  Scroll,
  Info,
  Heart,
  Skull,
  Lock,
  Calendar,
  Book,
  History as HistoryIcon
} from 'lucide-react';
import { TAROT_DECK } from '../tarotData';
import { TarotCard, TarotReading, VoiceType, TierType } from '../types';
import { getMoonPhase, PHASE_CARD_AFFINITY } from '../moonSystem';
import LoreWiki from './LoreWiki';
import { NORSE_RUNES, NORSE_GODS, NORSE_REALMS, NORSE_CONCEPTS, NorseRune, NorseGod, NorseRealm, NorseConcept } from '../norseData';


// Map icon names to Lucide icon components
const IconMap: { [key: string]: React.ComponentType<any> } = {
  Compass: Compass,
  Sparkles: Sparkles,
  Moon: Moon,
  Flower: Flower,
  Shield: Shield,
  Zap: Zap,
  Star: Star,
  Eye: Eye,
  Sun: Sun,
};

const getVoiceConfig = (v: VoiceType) => {
  switch (v) {
    case 'ember_ur':
      return {
        glowClass: 'bg-red-950/20',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30',
        buttonClass: 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 shadow-lg',
        icon: <Flame className="w-3.5 h-3.5 text-red-400" />,
        name: 'Ember Ur',
        channelingText: 'The ashes swirl... Ember Ur is casting deep fire upon your prose...',
      };
    case 'lucifera':
      return {
        glowClass: 'bg-purple-950/20',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        buttonClass: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 shadow-lg',
        icon: <Skull className="w-3.5 h-3.5 text-purple-400" />,
        name: 'Lucifera',
        channelingText: "Occult shadows lengthen... Lucifera is weaving forbidden whisperings into your tapestry...",
      };
    case 'kael':
      return {
        glowClass: 'bg-cyan-950/20',
        textColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/30',
        buttonClass: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 shadow-lg',
        icon: <Compass className="w-3.5 h-3.5 text-cyan-400" />,
        name: 'Kael',
        channelingText: 'The silver path gleams... Kael is charting navigation coordinates across your prose...',
      };
    case 'scarlet':
      return {
        glowClass: 'bg-rose-950/20',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/30',
        buttonClass: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 shadow-lg',
        icon: <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />,
        name: 'Scarlet',
        channelingText: 'A crimson pulse quickens... Scarlet is infusing visceral blood and raw emotion...',
      };
    default:
      return {
        glowClass: 'bg-amber-950/20',
        textColor: 'text-amber-500',
        borderColor: 'border-amber-500/30',
        buttonClass: 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10',
        icon: <Sparkles className="w-3.5 h-3.5 text-black" />,
        name: 'The Guardian Oracle',
        channelingText: 'The celestial loom spins... The Oracle is studying your stellar coordinates...',
      };
  }
};

import { spendAltarCharge, getAltarConfigTier } from '../altarStore';
import AltarDepletedModal from './AltarDepletedModal';

interface TarotDeckProps {
  voice: VoiceType;
  documentText: string;
  onInsertInsight: (text: string) => void;
  tier?: TierType;
  onNavigateToTiers?: () => void;
  userId?: string;
}

export default function TarotDeck({ 
  voice, 
  documentText, 
  onInsertInsight, 
  tier = 'free', 
  onNavigateToTiers,
  userId = 'guest'
}: TarotDeckProps) {
  const cfg = getVoiceConfig(voice);
  const [activeSubTab, setActiveSubTab] = useState<'spread' | 'daily' | 'norse' | 'wiki'>('spread');
  const [spreadType, setSpreadType] = useState<'one_card' | 'three_card'>('one_card');
  const [showTarotLock, setShowTarotLock] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCard; isReversed: boolean; positionLabel: string }[]>([]);
  const [reading, setReading] = useState<string | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [selectedDetailsCard, setSelectedDetailsCard] = useState<TarotCard | null>(null);

  // Norse Draw states
  const [norseShuffling, setNorseShuffling] = useState(false);
  const [norseDrawn, setNorseDrawn] = useState(false);
  const [drawnRune, setDrawnRune] = useState<NorseRune | null>(null);
  const [drawnGod, setDrawnGod] = useState<NorseGod | null>(null);
  const [drawnRealm, setDrawnRealm] = useState<NorseRealm | null>(null);
  const [drawnConcept, setDrawnConcept] = useState<NorseConcept | null>(null);
  const [norseReading, setNorseReading] = useState<string | null>(null);
  const [loadingNorseReading, setLoadingNorseReading] = useState(false);

  // Altar Depleted Modal states
  const [isAltarModalOpen, setIsAltarModalOpen] = useState(false);
  const [altarChargeForModal, setAltarChargeForModal] = useState(100);
  const [altarActionForModal, setAltarActionForModal] = useState<'ritual' | 'tarotSpread' | 'invokeVision' | 'blendMode'>('tarotSpread');

  // Storage helper functions
  const getStorageItem = (key: string): string | null => {
    if (typeof window !== 'undefined' && (window as any).storage && typeof (window as any).storage.get === 'function') {
      return (window as any).storage.get(key) || null;
    }
    return localStorage.getItem(key);
  };

  const setStorageItem = (key: string, value: string) => {
    if (typeof window !== 'undefined' && (window as any).storage && typeof (window as any).storage.set === 'function') {
      (window as any).storage.set(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  };

  // Daily Pull & Journal State
  interface DailyPullEntry {
    id: string;
    dateString: string;
    timestamp: string;
    cardName: string;
    isReversed: boolean;
    guidanceText: string;
    voice: string;
    pulledUnderPhase?: string;
    phaseSymbol?: string;
  }

  const [dailyJournal, setDailyJournal] = useState<DailyPullEntry[]>([]);
  const [dailyShuffling, setDailyShuffling] = useState(false);
  const [dailyDrawnCard, setDailyDrawnCard] = useState<{ card: TarotCard; isReversed: boolean } | null>(null);
  const [dailyReading, setDailyReading] = useState<string | null>(null);
  const [dailyLoadingReading, setDailyLoadingReading] = useState(false);

  // Load Daily Journal on mount
  useEffect(() => {
    const saved = getStorageItem('tarot_daily_journal_v1');
    if (saved) {
      try {
        setDailyJournal(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse daily journal:", e);
      }
    }
  }, []);

  const handleDailyPull = async () => {
    const todayStr = new Date().toDateString();
    const alreadyPulled = dailyJournal.find(j => j.dateString === todayStr);
    if (alreadyPulled) {
      alert("The spirits have already woven your guidance for today. See 'Today's Oracle' below!");
      return;
    }

    // Check and spend Altar Charge
    const configTier = getAltarConfigTier(tier);
    const gate = await spendAltarCharge(userId, configTier, 'tarotSpread');
    if (!gate.allowed) {
      setAltarChargeForModal(gate.charge);
      setAltarActionForModal('tarotSpread');
      setIsAltarModalOpen(true);
      return;
    }

    setDailyShuffling(true);
    setDailyDrawnCard(null);
    setDailyReading(null);

    setTimeout(async () => {
      setDailyShuffling(false);
      const pool = [...TAROT_DECK];
      const phase = getMoonPhase();
      const affinityCards = PHASE_CARD_AFFINITY[phase.name] || [];

      // 40% chance to pull from the phase-affinity list if any match the deck, else full random
      const affinityMatches = pool.filter(c => affinityCards.includes(c.name));
      const useAffinity = affinityMatches.length > 0 && Math.random() < 0.4;
      const card = useAffinity
        ? affinityMatches[Math.floor(Math.random() * affinityMatches.length)]
        : pool[Math.floor(Math.random() * pool.length)];

      const isReversed = Math.random() < 0.3;
      setDailyDrawnCard({ card, isReversed });
      setDailyLoadingReading(true);

      try {
        const response = await fetch('/api/tarot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            drawnCards: [{
              card: {
                name: card.name,
                description: card.description,
                emberUrInterpretation: card.emberUrInterpretation,
                oracleInterpretation: card.oracleInterpretation
              },
              isReversed,
              positionLabel: 'Daily Compass Orientation'
            }],
            voice,
            documentContext: documentText,
            question: "Provide an inspiring daily creative energy orientation, alchemical focus theme, and an immediate prompt for today."
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Oracle connection was dusty");
        }

        const data = await response.json();
        setDailyReading(data.guidanceText);

        const newEntry: DailyPullEntry = {
          id: `daily-${Date.now()}`,
          dateString: todayStr,
          timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          cardName: card.name,
          isReversed,
          guidanceText: data.guidanceText,
          voice,
          pulledUnderPhase: phase.name,
          phaseSymbol: phase.symbol
        };

        const updated = [newEntry, ...dailyJournal];
        setDailyJournal(updated);
        setStorageItem('tarot_daily_journal_v1', JSON.stringify(updated));

      } catch (err: any) {
        console.error(err);
        setDailyReading(`The cosmic loom drifted apart: ${err.message}. Please trigger the draw again.`);
      } finally {
        setDailyLoadingReading(false);
      }
    }, 1500);
  };

  const clearDailyJournal = () => {
    if (window.confirm("Are you sure you want to burn all ancestral entries from your daily journal? This is irreversible.")) {
      setDailyJournal([]);
      setStorageItem('tarot_daily_journal_v1', JSON.stringify([]));
    }
  };

  const startTarotSession = () => {
    setShuffling(true);
    setDrawnCards([]);
    setReading(null);
    setSelectedDetailsCard(null);
    
    setTimeout(() => {
      setShuffling(false);
      setIsShuffled(true);
      
      // Auto draw cards to keep the workflow super slick
      const pool = [...TAROT_DECK];
      const selected: typeof drawnCards = [];
      const numToDraw = spreadType === 'one_card' ? 1 : 3;
      const positions = spreadType === 'one_card' 
        ? ['Presence Guidance'] 
        : ['The Past Foundation', 'The Present Block/Catalyst', 'The Future Horizon'];

      for (let i = 0; i < numToDraw; i++) {
        if (pool.length === 0) break;
        const index = Math.floor(Math.random() * pool.length);
        const card = pool.splice(index, 1)[0];
        const isReversed = Math.random() < 0.3; // 30% chance of reversed
        selected.push({
          card,
          isReversed,
          positionLabel: positions[i]
        });
      }
      setDrawnCards(selected);
    }, 1500);
  };

  const getOracleGuidance = async () => {
    if (drawnCards.length === 0) return;

    // Check and spend Altar Charge
    const configTier = getAltarConfigTier(tier);
    const gate = await spendAltarCharge(userId, configTier, 'tarotSpread');
    if (!gate.allowed) {
      setAltarChargeForModal(gate.charge);
      setAltarActionForModal('tarotSpread');
      setIsAltarModalOpen(true);
      return;
    }

    setLoadingReading(true);
    setReading(null);
    try {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawnCards: drawnCards.map(d => ({
            card: {
              name: d.card.name,
              description: d.card.description,
              emberUrInterpretation: d.card.emberUrInterpretation,
              oracleInterpretation: d.card.oracleInterpretation
            },
            isReversed: d.isReversed,
            positionLabel: d.positionLabel
          })),
          voice,
          documentContext: documentText,
          question: spreadType === 'one_card' 
            ? "Provide quick inspiration and creative fire/clarity to break current boundaries."
            : "Guide me on the deeper themes of past, present, and future trajectory for this text."
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch oracle reading');
      }

      const data = await response.json();
      setReading(data.guidanceText);
    } catch (err: any) {
      console.error(err);
      setReading(`The astral lines are fuzzy: ${err.message}. Please try invoking the spirits again.`);
    } finally {
      setLoadingReading(false);
    }
  };

  const handleNorseDraw = async () => {
    // Check and spend Altar Charge
    const configTier = getAltarConfigTier(tier);
    const gate = await spendAltarCharge(userId, configTier, 'tarotSpread');
    if (!gate.allowed) {
      setAltarChargeForModal(gate.charge);
      setAltarActionForModal('tarotSpread');
      setIsAltarModalOpen(true);
      return;
    }

    setNorseShuffling(true);
    setNorseDrawn(false);
    setNorseReading(null);

    setTimeout(async () => {
      setNorseShuffling(false);
      const randomRune = NORSE_RUNES[Math.floor(Math.random() * NORSE_RUNES.length)];
      const randomGod = NORSE_GODS[Math.floor(Math.random() * NORSE_GODS.length)];
      const randomRealm = NORSE_REALMS[Math.floor(Math.random() * NORSE_REALMS.length)];
      const randomConcept = NORSE_CONCEPTS[Math.floor(Math.random() * NORSE_CONCEPTS.length)];

      setDrawnRune(randomRune);
      setDrawnGod(randomGod);
      setDrawnRealm(randomRealm);
      setDrawnConcept(randomConcept);
      setNorseDrawn(true);
      setLoadingNorseReading(true);

      try {
        const response = await fetch('/api/norse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            drawnRune: randomRune,
            drawnGod: randomGod,
            drawnRealm: randomRealm,
            drawnConcept: randomConcept,
            voice,
            documentContext: documentText,
            question: "Synthesize this custom Guardian's Draw and channel Norse lore to guide my current chronicle and creative blocks."
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to fetch Norse oracle reading');
        }

        const data = await response.json();
        setNorseReading(data.guidanceText);
      } catch (err: any) {
        console.error(err);
        setNorseReading(`The northern lines are clouded by mist: ${err.message}. Re-casting our fallbacks...`);
      } finally {
        setLoadingNorseReading(false);
      }
    }, 1500);
  };

  return (
    <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden" id="tarot-deck-widget">
      {/* Mystical background glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-1000 ${
        cfg.glowClass
      }`} />

      {/* Header Row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Scroll className={`w-5 h-5 ${cfg.textColor}`} />
          <h3 className="font-serif text-lg tracking-wider text-white/90">The Writer's Arcana</h3>
        </div>
        
        {activeSubTab === 'spread' && (
          <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => { 
                setShowTarotLock(false);
                setSpreadType('one_card'); 
                setDrawnCards([]); 
                setReading(null); 
                setIsShuffled(false); 
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                spreadType === 'one_card' && !showTarotLock
                  ? 'bg-white/5 text-amber-500 font-bold border border-white/5 shadow-sm' 
                  : 'text-white/40 hover:text-white/80'
              }`}
              id="tarot-btn-one"
            >
              1 Card
            </button>
            <button
              onClick={() => { 
                if (tier === 'free') {
                  setShowTarotLock(true);
                } else {
                  setShowTarotLock(false);
                  setSpreadType('three_card'); 
                  setDrawnCards([]); 
                  setReading(null); 
                  setIsShuffled(false); 
                }
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                spreadType === 'three_card' || showTarotLock
                  ? 'bg-white/5 text-amber-500 font-bold border border-white/5 shadow-sm' 
                  : 'text-white/40 hover:text-white/80'
              }`}
              id="tarot-btn-three"
            >
              <span>3 Card</span>
              {tier === 'free' && (
                <Lock className="w-2.5 h-2.5 text-red-500" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Sub tab navigation bar */}
      <div className="flex border-b border-white/5 pb-2 mb-4 text-[10px] font-mono gap-4 uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab('spread')}
          className={`pb-1.5 transition-all border-b-2 font-bold cursor-pointer ${
            activeSubTab === 'spread'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          Destiny Spread
        </button>
        <button
          onClick={() => setActiveSubTab('daily')}
          className={`pb-1.5 transition-all border-b-2 font-bold cursor-pointer ${
            activeSubTab === 'daily'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          Daily Pull
        </button>
        <button
          onClick={() => setActiveSubTab('norse')}
          className={`pb-1.5 transition-all border-b-2 font-bold cursor-pointer ${
            activeSubTab === 'norse'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          Norse Draw
        </button>
        <button
          onClick={() => setActiveSubTab('wiki')}
          className={`pb-1.5 transition-all border-b-2 font-bold cursor-pointer ${
            activeSubTab === 'wiki'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-white/40 hover:text-white/60'
          }`}
        >
          Lore Wiki
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'spread' && (
          <motion.div
            key="spread-subtab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {showTarotLock ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-5"
                key="tarot-lock"
              >
                <div className="w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7 text-red-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-serif text-white uppercase tracking-widest font-bold">THREE-CARD SPREAD ENCRYPTED</h3>
                  <p className="text-xs text-white/50 max-w-xs mx-auto font-sans leading-relaxed">
                    Weaving full temporal layouts (Past, Present, and Future) requires deeper oracle access. Your current clearance is <span className="text-red-400 font-bold uppercase">{tier}</span>.
                  </p>
                  <p className="text-[10px] text-red-500/60 font-mono">
                    Requires Adept Seeker Clearance ($16.66/mo) or higher.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setShowTarotLock(false);
                      setSpreadType('one_card');
                    }}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Use 1-Card
                  </button>
                  <button
                    onClick={onNavigateToTiers}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-950 to-[#3e0b11] hover:from-red-900 hover:to-red-950 text-red-200 border border-red-500/30 text-xs font-bold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-myth-gold" />
                    <span>Upgrade</span>
                  </button>
                </div>
              </motion.div>
            ) : !isShuffled && !shuffling ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-12 text-center"
                key="start-screen"
              >
                <div className="relative mb-6 animate-float">
                  <div className="w-20 h-28 bg-gradient-to-b from-amber-950/20 to-black border-2 border-amber-500/20 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 to-transparent"></div>
                    <Moon className="w-8 h-8 text-amber-500/40 relative z-10" />
                  </div>
                  <div className="absolute top-2 -left-2 w-20 h-28 bg-gradient-to-b from-amber-950/10 to-black border border-white/5 rounded-xl shadow-md -z-10 transform -rotate-6" />
                  <div className="absolute top-2 -right-2 w-20 h-28 bg-gradient-to-b from-amber-950/10 to-black border border-white/5 rounded-xl shadow-md -z-10 transform rotate-6" />
                </div>
                
                <p className="text-white/40 text-sm max-w-sm mb-6 leading-relaxed">
                  {spreadType === 'one_card' 
                    ? "Draw a single card of high-contrast destiny for immediate guidance on your writing."
                    : "Lay out the mystical path of Past, Present, and Future forces guiding your creative flow."
                  }
                </p>

                <button
                  onClick={startTarotSession}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold tracking-wider uppercase text-xs transition-all duration-300 ${
                    cfg.buttonClass
                  }`}
                  id="tarot-btn-shuffle"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Shuffle & Draw Cards
                </button>
              </motion.div>
            ) : shuffling ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
                key="shuffling-screen"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-dashed border-amber-500/20 rounded-full animate-spin-slow" />
                  <div className="absolute inset-2 border border-amber-500/30 rounded-full animate-spin-reverse" />
                  <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
                </div>
                <h4 className="font-serif mt-6 text-amber-500 text-lg animate-pulse tracking-widest">Shuffling Astral Deck...</h4>
                <p className="text-xs text-white/30 mt-2">Opening temporal lines to the Oracle...</p>
              </motion.div>
            ) : isShuffled && drawnCards.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
                key="cards-display"
              >
                <div className={`grid gap-4 ${spreadType === 'one_card' ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-3'}`}>
                  {drawnCards.map((dc, idx) => {
                    const CardIcon = IconMap[dc.card.iconName] || HelpCircle;
                    return (
                      <motion.div
                        key={dc.card.name}
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        onClick={() => setSelectedDetailsCard(dc.card)}
                        className="group cursor-pointer"
                      >
                        <div className="text-center mb-1 text-[10px] uppercase tracking-widest text-amber-500/50 font-mono">
                          {dc.positionLabel}
                        </div>
                        <div className={`relative bg-gradient-to-b from-amber-950/15 to-black border ${
                          selectedDetailsCard?.name === dc.card.name 
                            ? 'border-amber-500 shadow-amber-500/10 shadow-lg' 
                            : 'border-white/5 hover:border-amber-500/40'
                        } rounded-xl p-4 flex flex-col items-center justify-between text-center h-48 transition-all shadow-lg overflow-hidden`}>
                          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 to-transparent"></div>
                          
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 relative z-10 ${
                            dc.isReversed ? 'transform rotate-180' : ''
                          }`}>
                            <CardIcon className={`w-4 h-4 ${cfg.textColor}`} />
                          </div>
                          
                          <div className="space-y-1 relative z-10">
                            <div className="font-serif text-sm italic text-white/90 group-hover:text-amber-400 transition-colors">
                              {dc.card.name}
                            </div>
                            <div className="text-[10px] text-white/30 font-mono">
                              {dc.isReversed ? 'Reversed ▽' : 'Upright △'}
                            </div>
                          </div>

                          <div className="text-[10px] text-amber-200/60 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/10 overflow-hidden text-ellipsis whitespace-nowrap w-full relative z-10">
                            {dc.isReversed ? dc.card.reversedKeywords[0] : dc.card.uprightKeywords[0]}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {selectedDetailsCard && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#16161a] border border-white/10 rounded-xl p-4 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-amber-500 italic font-medium text-sm flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-500" />
                        Meaning: {selectedDetailsCard.name}
                      </h4>
                      <span className="text-[10px] text-white/40 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        Arcana {selectedDetailsCard.number}
                      </span>
                    </div>
                    <p className="text-white/60 italic">"{selectedDetailsCard.description}"</p>
                    <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-white/5">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-white/30 block">Ember Ur's Spark:</span>
                        <p className="text-white/70 mt-0.5 leading-relaxed">{selectedDetailsCard.emberUrInterpretation}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-white/30 block">Oracle's Light:</span>
                        <p className="text-white/70 mt-0.5 leading-relaxed">{selectedDetailsCard.oracleInterpretation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="pt-2 flex flex-col gap-4">
                  {!reading && !loadingReading && (
                    <div className="flex gap-2">
                      <button
                        onClick={getOracleGuidance}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                          cfg.buttonClass
                        }`}
                        id="tarot-interpret-btn"
                      >
                        {cfg.icon}
                        Consult {cfg.name}
                      </button>
                      <button
                        onClick={() => { setIsShuffled(false); setDrawnCards([]); setReading(null); }}
                        className="bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 px-3 py-2.5 rounded-xl text-xs transition-colors"
                        title="Draw again"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {loadingReading && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                      <div className={`w-6 h-6 border-2 ${cfg.textColor} border-t-transparent rounded-full animate-spin`} />
                      <p className={`text-xs ${cfg.textColor} animate-pulse italic`}>
                        {cfg.channelingText}
                      </p>
                    </div>
                  )}

                  {reading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <Scroll className="w-4 h-4 text-amber-500" />
                          <h4 className="font-serif text-white/90 text-xs tracking-wider uppercase italic">Oracular Manifestation</h4>
                        </div>
                        <button
                          onClick={() => onInsertInsight(reading)}
                          className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Weave into Writing
                        </button>
                      </div>
                      <div className="text-white/70 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                        {reading}
                      </div>
                      
                      <button
                        onClick={() => { setIsShuffled(false); setDrawnCards([]); setReading(null); }}
                        className="w-full text-center text-[10px] text-white/30 hover:text-white/60 transition-colors py-1 block font-mono"
                      >
                        Clear Reading & Draw New Spread
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        )}

        {activeSubTab === 'daily' && (
          <motion.div
            key="daily-subtab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <p className="text-xs text-white/40 leading-relaxed font-serif italic">
              Pull your Daily Compass card once per sun-cycle. The Oracle will synthesize immediate creative instructions for today and commit them to your private, persistent Journal ledger.
            </p>

            {(() => {
              const todayStr = new Date().toDateString();
              const todayEntry = dailyJournal.find(j => j.dateString === todayStr);

              if (dailyShuffling) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-black/10 border border-white/5 rounded-xl p-4">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-dashed border-amber-500/20 rounded-full animate-spin-slow" />
                      <Moon className="w-8 h-8 text-amber-500 animate-pulse" />
                    </div>
                    <h4 className="font-serif mt-4 text-amber-500 text-xs animate-pulse tracking-widest uppercase">Invoking Daily Alignment...</h4>
                  </div>
                );
              }

              if (todayEntry) {
                return (
                  <div className="space-y-4">
                    <div className="border border-amber-500/25 bg-amber-500/[0.02] rounded-xl p-4 space-y-3 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-[8px] font-mono px-2 py-0.5 rounded-bl uppercase tracking-wider font-bold">
                        Today's Arcanum
                      </div>
                      <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                        <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Scroll className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-bold text-white">{todayEntry.cardName}</h4>
                          <span className="text-[9px] text-white/40 font-mono">
                            {todayEntry.isReversed ? 'Reversed ▽' : 'Upright △'} • {todayEntry.voice.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {dailyLoadingReading ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] text-amber-500 italic">Oracle is engraving advice...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-[11px] text-white/70 leading-relaxed font-sans whitespace-pre-wrap italic">
                            {todayEntry.guidanceText}
                          </p>
                          <button
                            onClick={() => onInsertInsight(todayEntry.guidanceText)}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Weave Today's Prompt Into Writing
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/10 bg-black/10 rounded-xl p-4">
                  <Calendar className="w-8 h-8 text-white/10 mb-2 animate-bounce-slow" />
                  <span className="text-[11px] text-white/40 font-mono font-bold uppercase tracking-wider">Daily Seal is Undrawn</span>
                  <p className="text-[10px] text-white/20 mt-1 max-w-[240px] mb-4">
                    Draw down today's coordinates. The oracle will craft a custom prompt matching your companion.
                  </p>
                  <button
                    onClick={handleDailyPull}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold tracking-wider uppercase text-xs transition-all duration-300 cursor-pointer ${
                      cfg.buttonClass
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Consult Daily Compass
                  </button>
                </div>
              );
            })()}

            {/* Astral Journal Ledger List */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-3.5 h-3.5 text-white/40" />
                  <h4 className="font-serif text-xs tracking-wider text-white/80">Astral Journal Ledger</h4>
                </div>
                {dailyJournal.length > 0 && (
                  <button
                    onClick={clearDailyJournal}
                    className="text-[9px] text-red-400/80 hover:text-red-400 font-mono transition-colors cursor-pointer"
                  >
                    Burn Journal
                  </button>
                )}
              </div>

              {dailyJournal.length === 0 ? (
                <p className="text-[10px] text-white/20 italic py-4 text-center font-serif">
                  The journal pages are empty. Pull your first daily card above.
                </p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {dailyJournal.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-[#070709] border border-white/5 rounded-lg p-2.5 text-[11px] space-y-1 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.03] pb-1">
                        <span className="font-serif font-bold text-white/90 flex items-center gap-1.5">
                          {entry.cardName} {entry.isReversed ? '(Reversed)' : '(Upright)'}
                          {entry.pulledUnderPhase && (
                            <span className="text-[10px] text-purple-300 font-mono" title={`Pulled under ${entry.pulledUnderPhase}`}>
                              {entry.phaseSymbol}
                            </span>
                          )}
                        </span>
                        <span className="text-[8px] text-white/30 font-mono">{entry.timestamp}</span>
                      </div>
                      <p className="text-white/60 font-sans leading-relaxed line-clamp-2 italic whitespace-pre-wrap">
                        {entry.guidanceText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'norse' && (
          <motion.div
            key="norse-subtab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4 text-xs"
          >
            {!norseDrawn && !norseShuffling && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500 text-2xl font-serif">
                  ᛇ
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase">THE GUARDIAN'S NORSE DRAW</h4>
                  <p className="text-[10px] text-white/50 max-w-xs mx-auto leading-relaxed">
                    Cast the sacred Elder Futhark rune staves and align with the four cosmic dimensions of Norse wisdom: Rune, God, Realm, and Philosophical Concept.
                  </p>
                </div>
                <button
                  onClick={handleNorseDraw}
                  className={`w-full max-w-xs py-2.5 px-4 font-mono text-xs font-bold rounded-lg uppercase tracking-wider transition-all duration-300 ${cfg.buttonClass}`}
                >
                  Cast Guardian's Draw
                </button>
              </div>
            )}

            {norseShuffling && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="text-3xl text-amber-500 font-mono tracking-widest animate-pulse">
                  ᚠ ᚢ ᚦ ᚫ ᚱ ᚲ ᚷ ᚹ
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-white/80 font-serif font-semibold">Rune staves rattling...</p>
                  <p className="text-[10px] text-white/40 font-mono animate-pulse">Weaving past, present, and future Wyrd...</p>
                </div>
              </div>
            )}

            {norseDrawn && (
              <div className="space-y-4">
                {/* 2x2 grid of drawn Norse cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Rune Card */}
                  {drawnRune && (
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center space-y-1.5 relative overflow-hidden">
                      <div className="absolute top-1 left-1 text-[8px] font-mono text-white/20 uppercase tracking-widest">Rune</div>
                      <div className="text-3xl text-amber-500 font-bold font-mono pt-2">{drawnRune.symbol}</div>
                      <div>
                        <div className="font-serif font-bold text-white text-[11px]">{drawnRune.name}</div>
                        <div className="text-[9px] text-white/30 font-mono italic">{drawnRune.literal}</div>
                      </div>
                      <div className="text-[9px] text-white/50 leading-tight">
                        {drawnRune.keywords.slice(0, 2).join(" • ")}
                      </div>
                    </div>
                  )}

                  {/* God Card */}
                  {drawnGod && (
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center space-y-1.5 relative overflow-hidden">
                      <div className="absolute top-1 left-1 text-[8px] font-mono text-white/20 uppercase tracking-widest">God</div>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-serif font-bold text-xs pt-0.5 mt-2">
                        {drawnGod.name[0]}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-white text-[11px]">{drawnGod.name}</div>
                        <div className="text-[9px] text-white/30 font-mono truncate max-w-[80px]">{drawnGod.archetype.split(' / ')[0]}</div>
                      </div>
                      <div className="text-[8px] text-white/40 leading-none truncate max-w-[90px]" title={drawnGod.symbol}>
                        {drawnGod.symbol}
                      </div>
                    </div>
                  )}

                  {/* Realm Card */}
                  {drawnRealm && (
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center space-y-1.5 relative overflow-hidden">
                      <div className="absolute top-1 left-1 text-[8px] font-mono text-white/20 uppercase tracking-widest">Realm</div>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-serif font-bold text-[10px] mt-2">
                        {drawnRealm.axis === 'Vertical' ? '↕' : '↔'}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-white text-[11px]">{drawnRealm.name}</div>
                        <div className="text-[9px] text-white/30 font-mono">{drawnRealm.axis} Axis</div>
                      </div>
                      <div className="text-[9px] text-white/50 leading-tight line-clamp-1">
                        {drawnRealm.archetype}
                      </div>
                    </div>
                  )}

                  {/* Concept Card */}
                  {drawnConcept && (
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center space-y-1.5 relative overflow-hidden">
                      <div className="absolute top-1 left-1 text-[8px] font-mono text-white/20 uppercase tracking-widest">Concept</div>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-serif font-bold text-[10px] mt-2">
                        ⚔️
                      </div>
                      <div>
                        <div className="font-serif font-bold text-white text-[11px]">{drawnConcept.name}</div>
                        <div className="text-[9px] text-white/30 font-mono truncate max-w-[80px]">{drawnConcept.theme}</div>
                      </div>
                      <div className="text-[9px] text-white/50 leading-tight line-clamp-1">
                        {drawnConcept.description}
                      </div>
                    </div>
                  )}
                </div>

                {/* Loading Reading Status */}
                {loadingNorseReading && (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-amber-500 animate-pulse italic">
                      The Norns are weaving your destiny thread... consulting {cfg.name}...
                    </p>
                  </div>
                )}

                {/* Render Norse Channeling Text */}
                {norseReading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Scroll className="w-4 h-4 text-amber-500" />
                        <h4 className="font-serif text-white/90 text-xs tracking-wider uppercase italic">Norse Wisdom Channeling</h4>
                      </div>
                      <button
                        onClick={() => onInsertInsight(norseReading)}
                        className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Weave into Writing
                      </button>
                    </div>
                    <div className="text-white/70 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                      {norseReading}
                    </div>

                    <button
                      onClick={() => { setNorseDrawn(false); setNorseReading(null); }}
                      className="w-full text-center text-[10px] text-white/30 hover:text-white/60 transition-colors py-1 block font-mono"
                    >
                      Cast New Norse Alignment
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'wiki' && (
          <motion.div
            key="wiki-subtab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <LoreWiki />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Altar Depleted Modal */}
      <AltarDepletedModal
        isOpen={isAltarModalOpen}
        onClose={() => setIsAltarModalOpen(false)}
        tier={tier}
        currentCharge={altarChargeForModal}
        actionKey={altarActionForModal}
        onNavigateToTiers={onNavigateToTiers}
      />
    </div>
  );
}
