import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User, ShieldAlert, LogIn, Check, X, ShieldCheck } from 'lucide-react';
import { SeekerUser } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (user: SeekerUser) => void;
}

export default function GoogleAuthModal({ isOpen, onClose, onSignIn }: GoogleAuthModalProps) {
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const PRESET_USER: SeekerUser = {
    uid: 'google-preset-101',
    name: 'Ken Elder',
    email: 'kenx@guardianoracle.com',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  };

  const handleSelectPreset = () => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      onSignIn(PRESET_USER);
      onClose();
    }, 1500);
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

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      onSignIn({
        uid: `google-custom-${Date.now()}`,
        name: customName,
        email: customEmail,
        photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customName)}`
      });
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Background shadow click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => !isLoading && onClose()} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10 font-mono text-[#e2e2e9]"
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
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
            Local Sandbox Mode
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">Choose an Account</h3>
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
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Resolving Auth Token...</p>
                  <p className="text-[10px] text-white/40">Aligning credentials in local sandbox sandbox</p>
                </div>
              </motion.div>
            ) : !useCustomAccount ? (
              <motion.div
                key="accounts-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {/* Preset Account Card */}
                <button
                  onClick={handleSelectPreset}
                  className="w-full p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
                    <img
                      src={PRESET_USER.photoUrl}
                      alt={PRESET_USER.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white group-hover:text-myth-gold transition-colors truncate">
                        {PRESET_USER.name}
                      </p>
                      <span className="text-[8px] bg-myth-gold/10 text-myth-gold border border-myth-gold/20 px-1.5 py-0.2 rounded font-mono font-normal">
                        Pre-filled
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 truncate">{PRESET_USER.email}</p>
                  </div>
                  <LogIn className="w-4 h-4 text-white/30 group-hover:text-myth-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>

                {/* Add new account button */}
                <button
                  onClick={() => setUseCustomAccount(true)}
                  className="w-full p-3.5 bg-black/40 hover:bg-white/[0.02] border border-dashed border-white/5 hover:border-white/10 rounded-2xl text-xs text-center text-white/60 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-white/40" />
                  <span>Use another account</span>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="custom-form"
                onSubmit={handleSubmitCustom}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-white/40 block">Your Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-black/50 border border-white/10 px-3.5 py-2.5 pl-10 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white"
                        autoFocus
                      />
                      <User className="w-3.5 h-3.5 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-white/40 block">Google Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="john.doe@gmail.com"
                        className="w-full bg-black/50 border border-white/10 px-3.5 py-2.5 pl-10 rounded-xl text-xs outline-none focus:border-myth-gold transition-colors text-white font-sans"
                      />
                      <Mail className="w-3.5 h-3.5 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomAccount(false);
                      setErrorMsg('');
                    }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-myth-gold hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Authorize</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Secure Sandbox explanation */}
          <div className="pt-4 border-t border-white/5 text-[9px] text-white/30 text-center font-sans space-y-1.5 leading-normal">
            <div className="flex items-center justify-center gap-1 text-[#34A853]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono uppercase tracking-wider text-[8px] font-bold">Encrypted Local Bridge</span>
            </div>
            <p>
              Holding active sandbox mode: This mimics the Google OAuth credential handshake but keeps it client-side without live redirect requirements.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
