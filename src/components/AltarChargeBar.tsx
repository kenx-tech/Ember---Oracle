import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { TierType } from '../types';
import { getAltarState, applyRecharge, getAltarConfigTier } from '../altarStore';
import { getMoonPhase, getMoonChargeMultiplier } from '../moonSystem';

interface AltarChargeBarProps {
  userId: string;
  tier: TierType;
}

export default function AltarChargeBar({ userId, tier }: AltarChargeBarProps) {
  const [charge, setCharge] = useState(100);
  const configTier = getAltarConfigTier(tier);
  const [phase, setPhase] = useState(getMoonPhase());
  const [moonMult, setMoonMult] = useState(getMoonChargeMultiplier());

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      const state = await getAltarState(userId);
      const recharged = applyRecharge(state, configTier);
      if (mounted) {
        setCharge(Math.round(recharged.charge));
        setPhase(getMoonPhase());
        setMoonMult(getMoonChargeMultiplier());
      }
    }

    refresh();
    const interval = setInterval(refresh, 60000); // Refresh every minute

    // Listen for custom immediate state updates
    const handleImmediateUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.userId === userId) {
        const fakeState = {
          charge: customEvent.detail.charge,
          lastUpdated: customEvent.detail.lastUpdated || Date.now()
        };
        const recharged = applyRecharge(fakeState, configTier);
        if (mounted) {
          setCharge(Math.round(recharged.charge));
          setPhase(getMoonPhase());
          setMoonMult(getMoonChargeMultiplier());
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('altar-charge-update', handleImmediateUpdate);
    }

    return () => {
      mounted = false;
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('altar-charge-update', handleImmediateUpdate);
      }
    };
  }, [userId, tier, configTier]);

  const barColor = charge > 30 
    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
    : 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';

  return (
    <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 space-y-2 relative overflow-hidden" id="altar-charge-widget">
      <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-white/50 uppercase">
        <div className="flex items-center gap-1.5 font-bold">
          <Flame className={`w-3.5 h-3.5 animate-pulse ${charge > 30 ? 'text-amber-400' : 'text-red-400'}`} />
          <span>Altar Charge</span>
        </div>
        <span className={`font-extrabold ${charge > 30 ? 'text-amber-400' : 'text-red-400'}`}>{charge}%</span>
      </div>

      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 relative">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${charge}%` }}
        />
      </div>

      {/* Moon Phase Integration */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.03] mt-1 text-[9px] font-mono">
        <div className="flex items-center gap-1.5 text-purple-300">
          <span>{phase.symbol}</span>
          <span className="uppercase tracking-wider font-semibold">{phase.name}</span>
        </div>
        <span className="text-white/40">
          Current Rate: <span className="text-purple-300 font-bold">x{moonMult.toFixed(2)}</span>
        </span>
      </div>

      {charge < 100 && (
        <p className="text-[8px] font-mono text-white/30 italic text-right leading-none">
          Gathering stellar current...
        </p>
      )}
    </div>
  );
}
