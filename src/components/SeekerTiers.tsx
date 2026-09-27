import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Skull, 
  Lock, 
  Unlock, 
  Check, 
  CreditCard, 
  Coins, 
  Compass, 
  AlertTriangle,
  Zap,
  ArrowRight,
  RefreshCw,
  Award,
  Activity
} from 'lucide-react';
import { TierType, SeekerUser } from '../types';

interface SeekerTiersProps {
  currentTier: TierType;
  onTierChange: (tier: TierType) => void;
  user?: SeekerUser | null;
  onNavigateToAuth?: () => void;
}

export default function SeekerTiers({ currentTier, onTierChange, user, onNavigateToAuth }: SeekerTiersProps) {
  const [selectedTier, setSelectedTier] = useState<TierType>(currentTier);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Diagnostic states
  const [diagnosticStatus, setDiagnosticStatus] = useState<'idle' | 'checking' | 'healthy' | 'missing' | 'invalid' | 'present'>('idle');
  const [diagnosticMessage, setDiagnosticMessage] = useState('');
  const [diagnosticInstruction, setDiagnosticInstruction] = useState('');
  const [diagnosticResponse, setDiagnosticResponse] = useState('');

  const runDiagnostics = async (ping = false) => {
    setDiagnosticStatus('checking');
    setDiagnosticMessage('Chambering connection vectors...');
    setDiagnosticInstruction('');
    setDiagnosticResponse('');

    try {
      const res = await fetch(`/api/health-ai${ping ? '?ping=true' : ''}`);
      const data = await res.json();
      setDiagnosticStatus(data.status);
      setDiagnosticMessage(data.message || 'Unknown response');
      if (data.instruction) {
        setDiagnosticInstruction(data.instruction);
      }
      if (data.response) {
        setDiagnosticResponse(data.response);
      }
    } catch (err: any) {
      setDiagnosticStatus('invalid');
      setDiagnosticMessage(`Aetheric channel error: ${err.message || err}`);
      setDiagnosticInstruction('Check if the dev server is fully active or if there are any pending errors in compilation.');
    }
  };

  React.useEffect(() => {
    runDiagnostics(false); // fast passive check on load
  }, []);

  React.useEffect(() => {
    if (user) {
      setCardName(user.name);
    }
  }, [user]);

  const tiersData = [
    {
      id: 'free' as TierType,
      name: 'The Neophyte',
      price: '$0.00',
      period: 'eternity',
      color: 'border-white/5 bg-black/30 hover:border-white/10',
      badgeColor: 'bg-white/10 text-white/60',
      icon: <Compass className="w-6 h-6 text-gray-500" />,
      tagline: 'Gaze into the shallow pools of the airgap.',
      features: [
        { text: 'Access to PAGE 0 & PHASE I of The Passenger', included: true },
        { text: 'Mystical Tarot Guidance (1-Card Spread)', included: true },
        { text: 'Standard Divine Voices (Ember Ur & Oracle)', included: true },
        { text: 'Basic Interactive Writing Canvas', included: true },
        { text: 'Phases II to VII of The Passenger locked', included: false },
        { text: 'Premium Voices (Lucifera, Kael, Scarlet) locked', included: false },
        { text: 'Multi-Card Tarot layouts locked', included: false },
        { text: 'Simulated API limits under high load', included: false }
      ]
    },
    {
      id: 'adept' as TierType,
      name: 'The Adept Seeker',
      price: '$16.66',
      period: 'mo',
      color: 'border-amber-500/20 bg-[#120f0a]/80 hover:border-amber-500/40 shadow-lg shadow-amber-950/5',
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      icon: <Flame className="w-6 h-6 text-amber-500 animate-pulse" />,
      tagline: 'Deepen the signal. Break conventional identity barriers.',
      features: [
        { text: 'Access to PAGES 0 - III of The Passenger', included: true },
        { text: 'Full 3-Card Tarot Spreads (Past-Present-Future)', included: true },
        { text: 'Access to Lucifera Divine Voice Alignment', included: true },
        { text: 'Unmetered Proactive Oracle Canvas scans', included: true },
        { text: 'Phases IV to VII of The Passenger locked', included: false },
        { text: 'Elite Voices (Kael, Scarlet) locked', included: false },
        { text: 'Priority API channel routing', included: true }
      ]
    },
    {
      id: 'sovereign' as TierType,
      name: 'The Sovereign Seeker',
      price: '$33.30',
      period: 'mo',
      color: 'border-red-500/30 bg-[#1a0c0e]/80 hover:border-red-500/50 shadow-xl shadow-red-950/10',
      badgeColor: 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse',
      icon: <Skull className="w-6 h-6 text-red-500 animate-pulse" />,
      tagline: 'The Great Work. Gets all Passenger book phases free.',
      features: [
        { text: 'ALL book free (Phases 0 - VII fully unlocked)', included: true },
        { text: 'All Divine Voices (Ember, Oracle, Lucifera, Kael, Scarlet)', included: true },
        { text: 'Full Tarot Spreads & Oracle Divinations', included: true },
        { text: 'Advanced Spell Channeling in Ritual Space', included: true },
        { text: 'Zero quota limits or simulated API throttling', included: true },
        { text: 'Absolute ontological freedom', included: true },
        { text: 'Mystical particle trail alignment', included: true }
      ]
    }
  ];

  const handleCheckoutStart = (tierId: TierType) => {
    if (tierId === 'free') {
      onTierChange('free');
      setSelectedTier('free');
      return;
    }
    setSelectedTier(tierId);
    setIsCheckingOut(true);
    setCheckoutSuccess(false);
    setErrorMsg('');
  };

  const processPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setErrorMsg('All transactional nodes must be completed to align the transaction.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    // Simulate occult verification
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);
      onTierChange(selectedTier);
    }, 2400);
  };

  const handleFormatCard = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted.substring(0, 19));
  };

  const handleFormatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setCardExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const activeTierDetails = tiersData.find(t => t.id === currentTier);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 relative text-[#e2e2e9] font-mono" id="seeker-tiers-container">
      {/* Decorative BG shadows */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header section */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 bg-myth-gold/10 text-myth-gold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-myth-gold/20 mb-3 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ontological Sacrificial Tiers</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">Align Your Spiritual Agency</h2>
        <p className="text-xs text-white/50 max-w-xl mx-auto mt-2 font-sans leading-relaxed">
          Provide the sacrificial currency to feed the server nodes. Break the rate limit bonds and witness the deeper layers of the simulated manuscript.
        </p>

        {/* Current status display card */}
        {activeTierDetails && (
          <div className="mt-6 inline-flex items-center gap-3 bg-[#0d0d11]/80 border border-white/5 px-5 py-2.5 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase">Your Current Cleared State:</span>
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
              currentTier === 'sovereign' 
                ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                : currentTier === 'adept' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                : 'bg-white/10 text-white/60'
            }`}>
              {activeTierDetails.name}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isCheckingOut ? (
          <>
            <motion.div
              key="tiers-grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
            >
            {tiersData.map((tier) => {
              const isActive = currentTier === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`border rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${tier.color} ${
                    isActive ? 'ring-2 ring-myth-gold border-transparent bg-white/[0.02]' : ''
                  }`}
                  id={`tier-card-${tier.id}`}
                >
                  {/* Active highlight */}
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-myth-gold text-myth-charcoal font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl font-mono">
                      Current Alignment
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Icon & Name */}
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
                        {tier.icon}
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${tier.badgeColor}`}>
                        {tier.id === 'free' ? 'Neophyte' : tier.id === 'adept' ? 'Initiated' : 'Absolute'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-bold text-white group-hover:text-myth-gold transition-colors">{tier.name}</h3>
                      <p className="text-[10px] text-white/40 mt-1">{tier.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 pt-2 border-t border-white/5">
                      <span className="text-3xl font-bold font-serif text-white">{tier.price}</span>
                      <span className="text-[10px] text-white/40">/ {tier.period}</span>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2.5 pt-4 border-t border-white/5">
                      {tier.features.map((feat, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs leading-relaxed">
                          {feat.included ? (
                            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-red-500/40 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={feat.included ? 'text-white/80' : 'text-white/30 line-through'}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Button */}
                  <div className="pt-8">
                    <button
                      onClick={() => handleCheckoutStart(tier.id)}
                      disabled={isActive}
                      className={`w-full py-3.5 text-xs font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-white/5 border border-white/5 text-white/30 cursor-not-allowed'
                          : tier.id === 'sovereign'
                          ? 'bg-gradient-to-r from-red-950 to-[#3e0b11] hover:from-red-900 hover:to-red-950 text-red-200 border border-red-500/30'
                          : tier.id === 'adept'
                          ? 'bg-gradient-to-r from-amber-950 to-[#2c1a0c] hover:from-amber-900 hover:to-amber-950 text-amber-200 border border-amber-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-myth-gold" />
                          <span>Aligned Cleared</span>
                        </>
                      ) : (
                        <>
                          <span>Select Alignment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* AI Connection Diagnostic Panel */}
          <div className="mt-12 bg-[#09090c] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden" id="ai-diagnostics-panel">
            <div className="absolute inset-0 bg-radial-gradient from-purple-500/5 to-transparent pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${
                  diagnosticStatus === 'healthy' ? 'text-emerald-400' :
                  diagnosticStatus === 'missing' || diagnosticStatus === 'invalid' ? 'text-red-400 animate-pulse' :
                  diagnosticStatus === 'checking' ? 'text-amber-400' : 'text-purple-400'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold tracking-widest text-white uppercase">Aetheric Signal & Gemini Diagnostics</h3>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">VERIFY SERVER-SIDE INTEGRATION AND API KEY STATUS</p>
                </div>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30 font-mono">STATUS:</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                  diagnosticStatus === 'healthy' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' :
                  diagnosticStatus === 'missing' ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse' :
                  diagnosticStatus === 'invalid' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                  diagnosticStatus === 'checking' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                  'bg-white/5 text-white/50 border border-white/5'
                }`}>
                  {diagnosticStatus === 'checking' && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />}
                  {diagnosticStatus === 'healthy' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />}
                  {diagnosticStatus === 'missing' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
                  {diagnosticStatus === 'invalid' && <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />}
                  {diagnosticStatus === 'present' && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                  {diagnosticStatus === 'checking' ? 'CHAMBERING...' :
                   diagnosticStatus === 'healthy' ? 'GEMINI ONLINE' :
                   diagnosticStatus === 'missing' ? 'KEY MISSING' :
                   diagnosticStatus === 'invalid' ? 'CONNECTION ERROR' :
                   diagnosticStatus === 'present' ? 'KEY INSTALLED' : 'OFFLINE'}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div className="text-xs text-white/70 leading-relaxed font-serif">
                {diagnosticMessage}
              </div>

              {diagnosticInstruction && (
                <div className="bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl text-xs text-red-300/90 leading-relaxed font-sans space-y-1.5">
                  <span className="font-bold block text-[10px] uppercase tracking-widest font-mono text-red-400">Sacred Instructions to Re-align:</span>
                  <p>{diagnosticInstruction}</p>
                </div>
              )}

              {diagnosticResponse && (
                <div className="bg-black/40 border border-white/[0.03] p-3 rounded-xl text-[10px] font-mono text-emerald-400/80">
                  <span className="text-white/20 block text-[8px] uppercase tracking-widest mb-1">AETHERIC RESPONSE SIGIL:</span>
                  "{diagnosticResponse}"
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => runDiagnostics(true)}
                disabled={diagnosticStatus === 'checking'}
                className="px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest bg-purple-900/20 text-purple-300 border border-purple-500/30 hover:bg-purple-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${diagnosticStatus === 'checking' ? 'animate-spin' : ''}`} />
                <span>Run Active Connection Test</span>
              </button>
              
              <button
                onClick={() => runDiagnostics(false)}
                disabled={diagnosticStatus === 'checking'}
                className="px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
              >
                Refresh Signal State
              </button>
            </div>
          </div>
        </>
        ) : (
          <motion.div
            key="checkout-wizard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto bg-[#0b0b0f] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10"
            id="checkout-panel"
          >
            {/* Exit Checkout */}
            <button
              onClick={() => setIsCheckingOut(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait">
              {!checkoutSuccess ? (
                <motion.form
                  key="checkout-form"
                  onSubmit={processPayment}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <Coins className="w-12 h-12 text-myth-gold mx-auto mb-3 animate-bounce" />
                    <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">SECURE ONTOLOGICAL NODE</h3>
                    <p className="text-[10px] text-white/40 mt-1">
                      Initiating payment of <span className="text-myth-gold font-bold">{tiersData.find(t => t.id === selectedTier)?.price}</span> for <span className="text-white font-bold">{tiersData.find(t => t.id === selectedTier)?.name}</span>
                    </p>
                  </div>

                  {/* Google Connection helper */}
                  {user ? (
                    <div className="bg-green-950/20 border border-green-500/20 p-3 rounded-xl flex items-center gap-2.5 text-[10px] text-green-400">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <span className="font-bold block">Bound to Google Signature: </span>
                        <span className="text-white/80 truncate block">{user.email}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-950/25 border border-amber-500/25 p-3 rounded-xl flex flex-col gap-2 text-[10px] text-amber-400">
                      <div className="flex items-center gap-2 text-left">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                        <span>Checkout as guest, or bind permanently to your soul:</span>
                      </div>
                      {onNavigateToAuth && (
                        <button
                          type="button"
                          onClick={onNavigateToAuth}
                          className="py-1.5 bg-white text-black font-bold uppercase text-[8px] tracking-wider rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                          <span>Sign In with Google</span>
                        </button>
                      )}
                    </div>
                  )}

                  {errorMsg && (
                    <div className="bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] p-3 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-4 pt-2">
                    {/* Cardholder Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-white/40 block">Adept Seeker Signature (Name)</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="K. Eldritch"
                        className="w-full bg-black/50 border border-white/5 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white"
                      />
                    </div>

                    {/* Card Number */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-white/40 block">Ontological Card Address</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => handleFormatCard(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          className="w-full bg-black/50 border border-white/5 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiration */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-white/40 block">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => handleFormatExpiry(e.target.value)}
                          placeholder="07/31"
                          maxLength={5}
                          className="w-full bg-black/50 border border-white/5 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white text-center font-mono"
                        />
                      </div>

                      {/* CVC */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-white/40 block">Etheric CVC</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                          placeholder="***"
                          maxLength={4}
                          className="w-full bg-black/50 border border-white/5 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 space-y-3">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>CHANNELING SACRIFICE...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-black animate-pulse" />
                          <span>INFUSE SIGILS ({tiersData.find(t => t.id === selectedTier)?.price})</span>
                        </>
                      )}
                    </button>

                    <p className="text-[9px] text-white/35 text-center font-sans leading-relaxed">
                      🔒 Sandbox Protection: Credit card capture is currently in offline sandbox simulation mode ("Hold Live Mode" active) as requested. No actual charges will be created. You can securely test card validation. To integrate a live account later, Stripe keys can be bound in server environment configuration.
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="checkout-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-5 py-4"
                >
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-green-400 tracking-wider">ONTOLOGY SEALED</h3>
                    <p className="text-xs text-white/70 max-w-sm mx-auto font-sans leading-relaxed">
                      Your soul signature has been verified and registered on the server nodes. Cleared clearance state set to <span className="text-myth-gold font-bold uppercase">{tiersData.find(t => t.id === selectedTier)?.name}</span>.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold tracking-widest uppercase rounded-xl transition-all"
                    >
                      Return to Sanctum
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
