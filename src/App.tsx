import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Flame, 
  BookOpen, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  HelpCircle, 
  History, 
  Info,
  Scroll,
  Compass,
  Skull,
  Heart,
  Crown
} from 'lucide-react';
import { DocumentState, FileAttachment, VoiceType, AIHistoryItem, DocumentSection, TierType, SeekerUser } from './types';
import ChronicleCanvas from './components/ChronicleCanvas';
import Sidebar from './components/Sidebar';
import TarotDeck from './components/TarotDeck';
import GeometryMeditation from './components/GeometryMeditation';
import RitualSpace from './components/RitualSpace';
import CursorTrail from './components/CursorTrail';
import PassengerSpace from './components/PassengerSpace';
import ManifestoSpace from './components/ManifestoSpace';
import SeekerTiers from './components/SeekerTiers';
import GoogleAuthModal from './components/GoogleAuthModal';
import { spendAltarCharge, getAltarConfigTier, isSuperAdmin } from './altarStore';
import AltarDepletedModal from './components/AltarDepletedModal';
import { generateText } from './api';

const STORAGE_KEY = 'ember_oracle_document_v1';
const HISTORY_KEY = 'ember_oracle_history_v1';
const VOICE_KEY = 'ember_oracle_voice_v1';
const TIER_KEY = 'ember_oracle_tier_v1';
const USER_KEY = 'ember_oracle_user_v1';

const INITIAL_DOC: DocumentState = {
  id: 'doc-initial',
  title: 'The Chronicle of the Infinite Ink',
  sections: [
    {
      id: 'sec-1',
      text: 'Welcome, Seekers',
      type: 'heading'
    },
    {
      id: 'sec-2',
      text: 'This is a sacred sanctuary where your thoughts align with divine fire and stellar grace. You are not writing alone. On the right, select your companion: EMBER UR, the ancient voice of roaring volcano furnace, or THE ORACLE, the star-born weaver of stardust pathways.',
      type: 'paragraph'
    },
    {
      id: 'sec-3',
      text: '“Write with the fire of the core, or do not write at all. Let the sparks ignite the paper, leaving no filters in your wake.” — EMBER UR',
      type: 'quote'
    },
    {
      id: 'sec-4',
      text: 'Need an immediate burst of direction? Click "The Tarot Deck" on the right panel. Draw a card. The spirits will study the exact lines of this document and weave custom creative interpretations directly for your project. Click on any block in this center canvas to reveal the inline drawer and instruct the AI to rewrite it or weave changes globally.',
      type: 'paragraph'
    }
  ],
  createdAt: new Date().toISOString()
};

const RANK_THRESHOLDS = [
  { rank: "Neophyte",  minRituals: 0,  minPhases: 0 },
  { rank: "Adept",     minRituals: 3,  minPhases: 2 },
  { rank: "Sovereign", minRituals: 10, minPhases: 5 }
];

export function calculateRank(ritualCounts: { [key: string]: number }, passengerMaxPhase: number) {
  const totalRituals = Object.values(ritualCounts).reduce((a, b) => a + b, 0);
  let current = RANK_THRESHOLDS[0].rank;
  for (const tier of RANK_THRESHOLDS) {
    if (totalRituals >= tier.minRituals && passengerMaxPhase >= tier.minPhases) {
      current = tier.rank;
    }
  }
  return { rank: current, totalRituals, passengerMaxPhase };
}

export default function App() {
  const [documentState, setDocumentState] = useState<DocumentState>(INITIAL_DOC);
  const [voice, setVoice] = useState<VoiceType>('guardian_oracle');
  const [tier, setTier] = useState<TierType>('free');
  const [user, setUser] = useState<SeekerUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [rightTab, setRightTab] = useState<'sidebar' | 'tarot'>('sidebar');
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [currentTab, setCurrentTab] = useState<'writer' | 'meditation' | 'ritual' | 'passenger' | 'tiers' | 'manifesto'>('writer');

  // Altar Depleted Modal State
  const [isAltarModalOpen, setIsAltarModalOpen] = useState(false);
  const [altarChargeForModal, setAltarChargeForModal] = useState(100);
  const [altarActionForModal, setAltarActionForModal] = useState<'ritual' | 'tarotSpread' | 'invokeVision' | 'blendMode'>('invokeVision');

  const [ritualCounts, setRitualCounts] = useState<{ [key: string]: number }>({});
  const [passengerMaxPhase, setPassengerMaxPhase] = useState<number>(0);

  const loadRankData = () => {
    const userId = user?.uid || 'guest';
    const countKey = `ritual-counts:${userId}`;
    let counts: { [key: string]: number } = {};
    try {
      const saved = localStorage.getItem(countKey);
      if (saved) {
        counts = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load ritual counts", e);
    }
    setRitualCounts(counts);

    let maxPhase = 0;
    try {
      const savedP = localStorage.getItem('passenger_max_phase');
      const savedW = localStorage.getItem('wildfire_max_phase');
      const maxP = savedP ? parseInt(savedP, 10) || 0 : 0;
      const maxW = savedW ? parseInt(savedW, 10) || 0 : 0;
      maxPhase = Math.max(maxP, maxW);
    } catch (e) {}
    setPassengerMaxPhase(maxPhase);
  };

  useEffect(() => {
    loadRankData();
    window.addEventListener('seeker_rank_update', loadRankData);
    return () => window.removeEventListener('seeker_rank_update', loadRankData);
  }, [user]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedDoc = localStorage.getItem(STORAGE_KEY);
    if (savedDoc) {
      try {
        setDocumentState(JSON.parse(savedDoc));
      } catch (e) {
        console.error('Failed to parse saved document', e);
      }
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }

    const savedVoice = localStorage.getItem(VOICE_KEY);
    if (savedVoice) {
      setVoice(savedVoice as VoiceType);
    }

    const savedTier = localStorage.getItem(TIER_KEY);
    if (savedTier) {
      setTier(savedTier as TierType);
    }

    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  // Save to LocalStorage when states change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documentState));
    if (documentState.title) {
      document.title = `${documentState.title} | Ember & Oracle`;
    } else {
      document.title = 'Ember & Oracle';
    }
  }, [documentState]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(VOICE_KEY, voice);
  }, [voice]);

  useEffect(() => {
    localStorage.setItem(TIER_KEY, tier);
  }, [tier]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // Super Admin automatic tier promotion and lock-bypass
  useEffect(() => {
    if (user && isSuperAdmin(user.uid) && tier !== 'sovereign') {
      setTier('sovereign');
    }
  }, [user, tier]);

  // Append items to history ledger
  const addHistoryItem = (prompt: string, response: string, type: AIHistoryItem['type']) => {
    const newItem: AIHistoryItem = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      prompt,
      response,
      voice,
      type
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  // Generate initial draft from Sidebar prompt + attachments
  const handleGenerateDraft = async (prompt: string, attachments: FileAttachment[]) => {
    // Check and spend Altar Charge
    const configTier = getAltarConfigTier(tier);
    const gate = await spendAltarCharge(user?.uid || 'guest', configTier, 'invokeVision');
    if (!gate.allowed) {
      setAltarChargeForModal(gate.charge);
      setAltarActionForModal('invokeVision');
      setIsAltarModalOpen(true);
      return;
    }

    setGeneratingDraft(true);
    try {
      const data = await generateText(
        prompt,
        voice,
        attachments.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size,
          content: att.content,
          isImage: att.isImage
        }))
      );
      
      const newDoc: DocumentState = {
        id: `doc-${Date.now()}`,
        title: data.title || 'Manifested Genesis',
        sections: data.sections || [],
        createdAt: new Date().toISOString()
      };

      setDocumentState(newDoc);
      addHistoryItem(
        `Genesis Draft: "${prompt}"`,
        `Title: ${newDoc.title}\nCreated ${newDoc.sections.length} celestial sections.`,
        'draft'
      );
    } catch (err: any) {
      console.error(err);
      alert(`The Oracle could not focus the temporal waves: ${err.message}`);
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Reset document to default onboarding state
  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to restore the default chronicle? Your current edits will be overwritten.")) {
      setDocumentState(INITIAL_DOC);
    }
  };

  // Weave tarot insight at the active cursor or append as a new block
  const handleInsertTarotInsight = (insightText: string) => {
    const newSection: DocumentSection = {
      id: `sec-tarot-${Date.now()}`,
      text: insightText,
      type: 'quote'
    };
    setDocumentState(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    addHistoryItem(`Weaved Tarot insight into document`, insightText, 'tarot');
  };

  const { rank } = calculateRank(ritualCounts, passengerMaxPhase);

  return (
    <div className="min-h-screen bg-myth-bg text-[#e0e0e6] flex flex-col font-sans selection:bg-myth-gold/30 selection:text-white antialiased relative overflow-hidden">
      
      {/* Background Glows (Artistic Flair) */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-amber-900/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/15 blur-[150px] rounded-full pointer-events-none" />

      {/* Mystical Background Stars */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#1e1a2f_1px,transparent_1px)] [background-size:24px_24px] opacity-15 z-0" />

      {/* Header element */}
      <header className="border-b border-myth-slate/80 bg-myth-charcoal/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr flex items-center justify-center shadow-lg transition-transform duration-1000 rotate-12 ${
              voice === 'ember_ur' 
                ? 'from-[#3a1c10] to-[#e25822]' 
                : voice === 'lucifera'
                ? 'from-[#2e1065] to-[#a855f7]'
                : voice === 'kael'
                ? 'from-[#083344] to-[#06b6d4]'
                : voice === 'scarlet'
                ? 'from-[#4c0519] to-[#f43f5e]'
                : 'from-[#1c182d] to-[#d4af37]'
            }`}>
              {voice === 'ember_ur' ? (
                <Flame className="w-4 h-4 text-white" />
              ) : voice === 'lucifera' ? (
                <Skull className="w-4 h-4 text-purple-300" />
              ) : voice === 'kael' ? (
                <Compass className="w-4 h-4 text-cyan-300" />
              ) : voice === 'scarlet' ? (
                <Heart className="w-4 h-4 text-rose-300 fill-rose-500/20" />
              ) : (
                <Sparkles className="w-4 h-4 text-myth-gold" />
              )}
            </div>
            {/* Glowing ring */}
            <div className={`absolute -inset-1 rounded-full blur-sm opacity-40 -z-10 transition-colors ${
              voice === 'ember_ur'
                ? 'bg-myth-ember'
                : voice === 'lucifera'
                ? 'bg-purple-500'
                : voice === 'kael'
                ? 'bg-cyan-500'
                : voice === 'scarlet'
                ? 'bg-rose-500'
                : 'bg-myth-gold'
            }`} />
          </div>
          <div>
            <h1 className="font-serif text-lg tracking-widest text-gray-200">EMBER & ORACLE</h1>
            <p className="text-[9px] font-mono tracking-widest text-gray-500 uppercase">Divine AI Co-Writer & Tarot Guide</p>
          </div>
        </div>

        {/* Navigation Tabs in Header */}
        <div className="flex items-center gap-1 bg-[#0b0a0f] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setCurrentTab('writer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'writer'
                ? 'bg-white/5 text-amber-500 border border-white/5 shadow-sm font-bold'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chronicle</span>
            <span className="sm:hidden">Write</span>
          </button>
          <button
            onClick={() => setCurrentTab('meditation')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'meditation'
                ? 'bg-white/5 text-amber-500 border border-white/5 shadow-sm font-bold'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Geometry Sanctuary</span>
            <span className="sm:hidden">Meditate</span>
          </button>
          <button
            onClick={() => setCurrentTab('ritual')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'ritual'
                ? 'bg-white/5 text-amber-500 border border-white/5 shadow-sm font-bold'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ritual Space</span>
            <span className="sm:hidden">Ritual</span>
          </button>
          <button
            onClick={() => setCurrentTab('passenger')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'passenger'
                ? 'bg-red-950/40 text-red-400 border border-red-900/30 shadow-sm font-bold animate-pulse'
                : 'text-red-500/40 hover:text-red-500/80'
            }`}
            id="tab-passenger-btn"
          >
            <Skull className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">The Passenger</span>
            <span className="sm:hidden">Passenger</span>
          </button>
          <button
            onClick={() => setCurrentTab('manifesto')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'manifesto'
                ? 'bg-amber-950/40 text-amber-500 border border-amber-900/30 shadow-sm font-bold animate-pulse'
                : 'text-amber-500/40 hover:text-amber-500/80'
            }`}
            id="tab-manifesto-btn"
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">The Manifesto</span>
            <span className="sm:hidden">Manifesto</span>
          </button>
          <button
            onClick={() => setCurrentTab('tiers')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'tiers'
                ? 'bg-myth-gold/20 text-myth-gold border border-myth-gold/30 shadow-sm font-bold font-serif'
                : 'text-myth-gold/50 hover:text-myth-gold'
            }`}
            id="tab-tiers-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-myth-gold animate-pulse" />
            <span className="hidden sm:inline">Seeker Tiers</span>
            <span className="sm:hidden">Tiers</span>
          </button>
        </div>

        {/* Header Action controls */}
        <div className="flex items-center justify-end gap-3 w-full md:w-auto">
          {/* Google Sign In status */}
          {user ? (
            <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/5 pl-2 pr-3 py-1 rounded-xl group relative">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-5.5 h-5.5 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-5.5 h-5.5 rounded-full bg-myth-gold/10 text-myth-gold flex items-center justify-center font-bold text-[10px] border border-myth-gold/20">
                  {user.name[0]}
                </div>
              )}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-200 leading-tight max-w-[85px] truncate">{user.name}</span>
                  {isSuperAdmin(user.uid) ? (
                    <span className="text-[7px] font-mono tracking-widest font-extrabold uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-red-500 to-amber-500 text-white border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse" title="Developer Super Admin Mode Enabled (Zero Altar Costs / Unlimited Access)">
                      ⚡ SUPER ADMIN
                    </span>
                  ) : (
                    <span className={`text-[7px] font-mono tracking-widest font-extrabold uppercase px-1 py-0.2 rounded ${
                      rank === 'Sovereign' 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : rank === 'Adept'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/10 text-white/50 border border-white/5'
                    }`} title={`Narrative Rank: ${rank}`}>
                      {rank === 'Sovereign' ? '👑 SOVEREIGN' : rank === 'Adept' ? '🔥 ADEPT' : '✦ NEOPHYTE'}
                    </span>
                  )}
                </div>
                <span className="text-[8px] text-white/40 leading-none truncate max-w-[85px]">{user.email}</span>
              </div>
              <button
                onClick={() => setUser(null)}
                className="text-[9px] uppercase font-bold tracking-wider text-red-400 hover:text-red-300 ml-1 bg-red-950/20 px-1.5 py-0.5 rounded-lg border border-red-500/15 cursor-pointer"
                title="Disconnect Google authentication node"
              >
                Exit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-xl">
                <span className="text-[8px] text-white/40 uppercase tracking-wider">RANK:</span>
                <span className={`text-[8px] font-mono tracking-widest font-extrabold uppercase ${
                  rank === 'Sovereign' 
                    ? 'text-purple-400' 
                    : rank === 'Adept'
                    ? 'text-amber-400'
                    : 'text-white/60'
                }`}>
                  {rank === 'Sovereign' ? '👑 SOVEREIGN' : rank === 'Adept' ? '🔥 ADEPT' : '✦ NEOPHYTE'}
                </span>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-white text-black hover:bg-gray-100 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                id="google-signin-btn"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.14 3.01-1.34 3.82v3.17h2.17c3.97-3.66 6.3-9.05 6.3-12.84z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.17-2.46c-.88.6-2.01.95-3.17.95-3.08 0-5.69-2.08-6.62-4.88H3.84v3.29C5.81 22.8 9.58 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.38 14.7c-.24-.7-.38-1.44-.38-2.2s.14-1.5.38-2.2V7.01H1.01C.36 8.3.01 9.73.01 11.2s.35 2.9.99 4.19l3.38-2.69z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 9.58 0 5.81 1.2 3.84 5.11l4.38 3.29c.93-2.8 3.54-4.88 6.62-4.88z"
                  />
                </svg>
                <span>Google Sign In</span>
              </button>
            </div>
          )}

          {/* Default Restore trigger */}
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 bg-[#0f0c15] hover:bg-myth-slate border border-myth-slate/80 text-gray-400 hover:text-gray-200 text-xs px-3 py-1.5 rounded-xl transition-all"
            title="Reset chronicle to tutorial template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Tutorial</span>
          </button>

          {/* Distraction free toggle */}
          {currentTab === 'writer' && (
            <button
              onClick={() => setIsDistractionFree(!isDistractionFree)}
              className={`flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-xl border transition-all ${
                isDistractionFree 
                  ? 'bg-myth-gold/15 border-myth-gold text-myth-gold font-semibold' 
                  : 'bg-[#0f0c15] border-myth-slate/80 text-gray-400 hover:text-gray-200'
              }`}
              id="distraction-free-toggle"
            >
              {isDistractionFree ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isDistractionFree ? 'Distraction On' : 'Distraction-Free'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex relative z-10 overflow-hidden">
        {currentTab === 'writer' ? (
          <>
            {/* Left Side: Writing Canvas */}
            <div className={`flex-1 overflow-y-auto px-6 py-8 transition-all duration-500 ${
              isDistractionFree ? 'max-w-3xl mx-auto' : 'max-w-4xl'
            }`}>
              <ChronicleCanvas
                documentState={documentState}
                onChange={setDocumentState}
                voice={voice}
                isAIActive={isAIActive}
                onAddHistory={(prompt, response, type) => addHistoryItem(prompt, response, type)}
                isDistractionFree={isDistractionFree}
                tier={tier}
                onNavigateToTiers={() => setCurrentTab('tiers')}
                userId={user?.uid || 'guest'}
              />
            </div>

            {/* Right Side Panel: AI Controls & Tarot deck drawer */}
            <AnimatePresence>
              {!isDistractionFree && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 380, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="border-l border-myth-slate/80 bg-myth-charcoal/50 backdrop-blur-sm w-[380px] flex flex-col overflow-hidden flex-shrink-0"
                  id="sidebar-panel-wrapper"
                >
                  {/* Tab selector bar */}
                  <div className="flex border-b border-myth-slate/80 p-2 bg-[#0c0a10]">
                    <button
                      onClick={() => setRightTab('sidebar')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors ${
                        rightTab === 'sidebar' 
                          ? 'bg-myth-slate text-myth-gold font-bold border border-myth-slate' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                      id="tab-sidebar-btn"
                    >
                      <History className="w-3.5 h-3.5" />
                      Genesis & History
                    </button>
                    <button
                      onClick={() => setRightTab('tarot')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors ${
                        rightTab === 'tarot' 
                          ? 'bg-myth-slate text-myth-gold font-bold border border-myth-slate' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                      id="tab-tarot-btn"
                    >
                      <Scroll className="w-3.5 h-3.5" />
                      The Tarot Deck
                    </button>
                  </div>

                  {/* Tab active content */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <AnimatePresence mode="wait">
                      {rightTab === 'sidebar' ? (
                        <motion.div
                          key="sidebar-tab"
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                        >
                          <Sidebar
                            voice={voice}
                            onVoiceChange={setVoice}
                            isAIActive={isAIActive}
                            onAIActiveChange={setIsAIActive}
                            onGenerateDraft={handleGenerateDraft}
                            generating={generatingDraft}
                            history={history}
                            onClearHistory={handleClearHistory}
                            tier={tier}
                            onNavigateToTiers={() => setCurrentTab('tiers')}
                            userId={user?.uid || 'guest'}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="tarot-tab"
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                        >
                          <TarotDeck
                            voice={voice}
                            documentText={documentState.sections.map(s => s.text).join("\n\n")}
                            onInsertInsight={handleInsertTarotInsight}
                            tier={tier}
                            onNavigateToTiers={() => setCurrentTab('tiers')}
                            userId={user?.uid || 'guest'}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </>
        ) : currentTab === 'meditation' ? (
          <div className="flex-1 overflow-hidden h-full">
            <GeometryMeditation />
          </div>
        ) : currentTab === 'ritual' ? (
          <div className="flex-1 overflow-hidden h-full">
            <RitualSpace
              documentContext={documentState.sections.map(s => s.text).join("\n\n")}
              user={user}
              tier={tier}
              onNavigateToTiers={() => setCurrentTab('tiers')}
            />
          </div>
        ) : currentTab === 'tiers' ? (
          <div className="flex-1 overflow-auto h-full">
            <SeekerTiers
              currentTier={tier}
              onTierChange={setTier}
              user={user}
              onNavigateToAuth={() => setIsAuthModalOpen(true)}
            />
          </div>
        ) : currentTab === 'passenger' ? (
          <div className="flex-1 overflow-auto h-full">
            <PassengerSpace tier={tier} onNavigateToTiers={() => setCurrentTab('tiers')} />
          </div>
        ) : (
          <div className="flex-1 overflow-auto h-full">
            <ManifestoSpace tier={tier} onNavigateToTiers={() => setCurrentTab('tiers')} />
          </div>
        )}
      </main>

      {/* Background ambient lighting effects */}
      <div className={`fixed bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none transition-colors duration-1000 ${
        voice === 'ember_ur' 
          ? 'bg-myth-ember' 
          : voice === 'lucifera' 
          ? 'bg-purple-900' 
          : voice === 'kael' 
          ? 'bg-cyan-900/60' 
          : voice === 'scarlet' 
          ? 'bg-rose-900/60' 
          : 'bg-myth-gold'
      }`} />

      {/* Dynamic Magical Occult Particle Cursor Trail */}
      <CursorTrail voice={voice} />

      {/* Google Sign-In Selection Sandbox Portal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignIn={(signedInUser) => setUser(signedInUser)}
      />

      {/* Altar Depleted Modal */}
      <AltarDepletedModal
        isOpen={isAltarModalOpen}
        onClose={() => setIsAltarModalOpen(false)}
        tier={tier}
        currentCharge={altarChargeForModal}
        actionKey={altarActionForModal}
        onNavigateToTiers={() => setCurrentTab('tiers')}
      />
    </div>
  );
}
