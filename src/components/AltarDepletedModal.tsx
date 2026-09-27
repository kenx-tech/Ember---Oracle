import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Clock, Sparkles, X, Lock } from 'lucide-react';
import { TierType } from '../types';
import { ALTAR_CONFIG, getAltarConfigTier, ActionCostKey, ACTION_COSTS } from '../altarStore';

interface AltarDepletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: TierType;
  currentCharge: number;
  actionKey: ActionCostKey;
  onNavigateToTiers?: () => void;
}

export default function AltarDepletedModal({
  isOpen,
  onClose,
  tier,
  currentCharge,
  actionKey,
  onNavigateToTiers
}: AltarDepletedModalProps) {
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);
  const configKey = getAltarConfigTier(tier);
  const config = ALTAR_CONFIG[configKey];
  const cost = config.chargePerAction * (ACTION_COSTS[actionKey] || 1);

  // Target charge threshold to perform the action
  const targetThreshold = Math.ceil(cost);

  useEffect(() => {
    if (!isOpen) return;

    const calculateTime = () => {
      if (currentCharge >= targetThreshold) {
        setMinutesRemaining(0);
        return;
      }
      const chargeNeeded = targetThreshold - currentCharge;
      const ratePerMinute = config.rechargeRatePerHour / 60;
      const mins = Math.max(1, Math.ceil(chargeNeeded / ratePerMinute));
      setMinutesRemaining(mins);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 10000); // Recalculate every 10s
    return () => clearInterval(interval);
  }, [isOpen, currentCharge, targetThreshold, config.rechargeRatePerHour]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        className="max-w-md w-full bg-[#0d0d12] border border-red-500/30 p-8 rounded-2xl relative shadow-2xl font-serif space-y-6 overflow-hidden"
      >
        {/* Flame ambient glow */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-950/20 blur-[80px] rounded-full pointer-events-none -z-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-950/20 blur-[80px] rounded-full pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/40 text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-inner">
          <Flame className="w-8 h-8 animate-pulse text-amber-500" />
        </div>

        {/* Text Details */}
        <div className="space-y-2 text-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded-full">
            Altar Current Depleted
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide">
            THE FIRES GATHER STRENGTH
          </h2>
          <p className="text-xs text-white/70 leading-relaxed max-w-sm mx-auto font-sans italic">
            "{config.label}"
          </p>
        </div>

        {/* Charge and Countdown Panel */}
        <div className="bg-black/40 border border-white/5 p-5 rounded-xl space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-white/50">
              <span>CURRENT CHARGE</span>
              <span className="text-red-400 font-bold">{Math.round(currentCharge)}% / {targetThreshold}% Required</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 relative">
              <div
                className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-300"
                style={{ width: `${currentCharge}%` }}
              />
              {/* Threshold indicator line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                style={{ left: `${targetThreshold}%` }}
                title={`Requirement: ${targetThreshold}%`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-400 font-sans justify-center bg-amber-500/5 py-2.5 px-4 rounded-lg border border-amber-500/10">
            <Clock className="w-4 h-4 shrink-0 animate-pulse text-amber-500" />
            <span>
              {minutesRemaining > 0 
                ? `Regathers sufficient power (${targetThreshold}%) in ~${minutesRemaining} min`
                : "Charge is returning momentarily..."}
            </span>
          </div>
        </div>

        {/* Subtle upsell line for Neophyte/Adept */}
        {configKey !== 'sovereign' && (
          <div className="text-center font-serif text-[11px] text-white/30 space-y-1">
            <p>
              "Sovereigns never wait."
            </p>
            {onNavigateToTiers && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTiers();
                }}
                className="text-amber-500 hover:text-amber-400 font-sans font-semibold text-[10px] uppercase tracking-wider underline cursor-pointer"
              >
                Ascend to Sovereign Seeker
              </button>
            )}
          </div>
        )}

        {/* Browse option (Not a dead end) */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/80 font-sans text-xs font-bold uppercase tracking-widest rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer text-center"
        >
          Dismiss to Browse Chronicle
        </button>
      </motion.div>
    </div>
  );
}
