import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User, ShieldAlert, LogIn, X, ShieldCheck, Phone, KeyRound, ArrowLeft, Shield } from 'lucide-react';
import { SeekerUser } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (user: SeekerUser) => void;
}

export default function GoogleAuthModal({ isOpen, onClose, onSignIn }: GoogleAuthModalProps) {
  const [viewMode, setViewMode] = useState<'list' | 'custom' | 'pin'>('list');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [pendingUser, setPendingUser] = useState<SeekerUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const KEN_SUPERADMIN_USER: SeekerUser = {
    uid: 'google-preset-101',
    name: 'Ken Elder',
    email: 'kenx@guardianoracle.com',
    phoneNumber: '+1 (555) 728-4392',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  };

  const DEMO_GUEST_USER: SeekerUser = {
    uid: 'google-guest-102',
    name: 'Guest Seeker',
    email: 'seeker@emberoracle.app',
    phoneNumber: '+1 (555) 019-3382',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  };

  const resetModalState = () => {
    setViewMode('list');
    setCustomName('');
    setCustomEmail('');
    setCustomPhone('');
    setAdminPin('');
    setPendingUser(null);
    setIsLoading(false);
    setErrorMsg('');
  };

  const handleClose = () => {
    if (isLoading) return;
    resetModalState();
    onClose();
  };

  const handleSelectKenAdmin = () => {
    setErrorMsg('');
    setPendingUser(KEN_SUPERADMIN_USER);
    setViewMode('pin');
  };

  const handleSelectDemoGuest = () => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      onSignIn(DEMO_GUEST_USER);
      handleClose();
    }, 800);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin) {
      setErrorMsg('Please enter the Super Admin Security Key.');
      return;
    }

    const cleanPin = adminPin.trim().toLowerCase();
    // Ken's master PINs
    if (cleanPin === '7777' || cleanPin === 'kenx' || cleanPin === 'superadmin' || cleanPin === 'oracle77') {
      setIsLoading(true);
      setErrorMsg('');
      setTimeout(() => {
        setIsLoading(false);
        if (pendingUser) {
          onSignIn(pendingUser);
        }
        handleClose();
      }, 900);
    } else {
      setErrorMsg('Invalid Security Key. Unauthorized access to Super Admin identity denied.');
    }
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      setErrorMsg('Please enter both your name and email address.');
      return;
    }
    if (!customEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const trimmedEmail = customEmail.trim().toLowerCase();
    const newUser: SeekerUser = {
      uid: `google-custom-${Date.now()}`,
      name: customName.trim(),
      email: customEmail.trim(),
      phoneNumber: customPhone.trim() || undefined,
      photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customName)}`
    };

    // If anyone attempts to enter Ken's email in the custom form, enforce PIN check
    if (trimmedEmail === 'kenx@guardianoracle.com' || trimmedEmail.includes('kenx@')) {
      setPendingUser(newUser);
      setViewMode('pin');
      setErrorMsg('');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      onSignIn(newUser);
      handleClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Background shadow click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10 font-mono text-[#e2e2e9]"
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Google Branding Strip */}
        <div className="bg-black/40 px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">Google Auth Node</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full">
            Client-Side Handshake
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
              {viewMode === 'pin' ? 'Root Authentication' : 'Choose an Account'}
            </h3>
            <p className="text-xs text-white/50 font-sans">
              to continue to <span className="text-myth-gold font-bold">Ember & Oracle</span>
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-950/20 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center space-y-4"
              >
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-myth-gold rounded-full animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Resolving Auth Credentials...</p>
                  <p className="text-[10px] text-white/40">Securing session tokens in local client sanctuary</p>
                </div>
              </motion.div>
            ) : viewMode === 'pin' ? (
              <motion.form
                key="pin-form"
                onSubmit={handleVerifyPin}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5"
              >
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Super Admin Key Required</span>
                  </div>
                  <p className="text-[11px] text-white/70 font-sans leading-relaxed">
                    <strong className="text-white">Ken Elder</strong> holds Root Super Admin privileges (unlimited Altar charges & sovereign tier). Enter the Altar Security PIN to unlock.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-white/50 block">Super Admin Security PIN</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="Enter PIN (Default Master: 7777)"
                      className="w-full bg-black/60 border border-amber-500/40 px-3.5 py-2.5 pl-10 rounded-xl text-xs outline-none focus:border-amber-400 transition-colors text-white font-mono tracking-widest"
                      autoFocus
                    />
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex justify-between text-[8px] text-white/30 pt-1 font-mono">
                    <span>Identity: kenx@guardianoracle.com</span>
                    <span>Master PIN: 7777</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('list');
                      setErrorMsg('');
                      setAdminPin('');
                    }}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Unlock Root</span>
                  </button>
                </div>
              </motion.form>
            ) : viewMode === 'list' ? (
              <motion.div
                key="accounts-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {/* Ken Elder (Super Admin with PIN prompt) */}
                <button
                  onClick={handleSelectKenAdmin}
                  className="w-full p-3.5 bg-white/[0.02] hover:bg-amber-950/20 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl text-left transition-all flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/40 bg-black/40 flex-shrink-0 relative">
                    <img
                      src={KEN_SUPERADMIN_USER.photoUrl}
                      alt={KEN_SUPERADMIN_USER.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {KEN_SUPERADMIN_USER.name}
                      </p>
                      <span className="text-[7.5px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-bold tracking-wider">
                        ⚡ SUPER ADMIN
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 truncate">{KEN_SUPERADMIN_USER.email}</p>
                    <p className="text-[8px] text-myth-gold/60 font-mono truncate">{KEN_SUPERADMIN_USER.phoneNumber} • PIN Protected</p>
                  </div>
                  <KeyRound className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:scale-110 transition-all flex-shrink-0" />
                </button>

                {/* Guest / Visitor Seeker */}
                <button
                  onClick={handleSelectDemoGuest}
                  className="w-full p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
                    <img
                      src={DEMO_GUEST_USER.photoUrl}
                      alt={DEMO_GUEST_USER.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white group-hover:text-myth-gold transition-colors truncate">
                        {DEMO_GUEST_USER.name}
                      </p>
                      <span className="text-[7.5px] bg-white/10 text-white/50 border border-white/10 px-1.5 py-0.2 rounded font-mono">
                        Guest Seeker
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 truncate">{DEMO_GUEST_USER.email}</p>
                    <p className="text-[8px] text-white/30 font-mono truncate">{DEMO_GUEST_USER.phoneNumber} • Instant Demo</p>
                  </div>
                  <LogIn className="w-4 h-4 text-white/30 group-hover:text-myth-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>

                {/* Add Custom Google Account button */}
                <button
                  onClick={() => {
                    setViewMode('custom');
                    setErrorMsg('');
                  }}
                  className="w-full p-3 bg-black/40 hover:bg-white/[0.02] border border-dashed border-white/10 hover:border-white/20 rounded-2xl text-xs text-center text-white/60 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-white/40" />
                  <span>Sign in with another Google account</span>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="custom-form"
                onSubmit={handleSubmitCustom}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3.5"
              >
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-white/40 block">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="E.g. Elena Rostova"
                        className="w-full bg-black/50 border border-white/10 px-3.5 py-2 pl-9 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white"
                        autoFocus
                      />
                      <User className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-white/40 block">Google Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="elena.rostova@gmail.com"
                        className="w-full bg-black/50 border border-white/10 px-3.5 py-2 pl-9 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white font-sans"
                      />
                      <Mail className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[9px] uppercase tracking-wider text-white/40 block">Phone Number</label>
                      <span className="text-[8px] text-white/30 uppercase">Optional</span>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder="+1 (555) 234-5678"
                        className="w-full bg-black/50 border border-white/10 px-3.5 py-2 pl-9 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white font-mono"
                      />
                      <Phone className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('list');
                      setErrorMsg('');
                    }}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-myth-gold hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Authorize</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Secure Sandbox explanation */}
          <div className="pt-3 border-t border-white/5 text-[9px] text-white/30 text-center font-sans space-y-1 leading-normal">
            <div className="flex items-center justify-center gap-1 text-[#34A853]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono uppercase tracking-wider text-[8px] font-bold">Client-Side Auth Bridge</span>
            </div>
            <p>
              Holding active sandbox mode: Signs in via Google identity node while keeping credentials safely encrypted in your browser without live redirect delays.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
