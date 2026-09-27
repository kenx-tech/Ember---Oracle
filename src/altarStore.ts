import { TierType } from './types';
import { getMoonChargeMultiplier, checkMoonSympathy } from './moonSystem';
import { getSafeLocalStorage, getSafeStorageAsync, setSafeStorage, safeJsonParse } from './storageHelper';

export const ALTAR_CONFIG = {
  neophyte: {
    maxCharge: 100,
    chargePerAction: 20,       // 5 actions before empty
    rechargeRatePerHour: 25,   // full recharge in 4 hours
    label: "The airgap flickers. The altar needs time to gather stellar current."
  },
  adept: {
    maxCharge: 100,
    chargePerAction: 8,        // ~12 actions before empty
    rechargeRatePerHour: 50,   // full recharge in 2 hours
    label: "The signal thins. Rest a while and the current returns."
  },
  sovereign: {
    maxCharge: 100,
    chargePerAction: 2,        // ~50 actions before empty
    rechargeRatePerHour: 200,  // effectively always full
    label: "The Great Work does not tire, but even sovereigns must breathe."
  }
};

export type AltarTierKey = 'neophyte' | 'adept' | 'sovereign';

export const ACTION_COSTS = {
  invokeVision: 1,      // multiplied against chargePerAction
  tarotSpread: 1.5,
  ritual: 2,
  blendMode: 1.5
};

export type ActionCostKey = 'invokeVision' | 'tarotSpread' | 'ritual' | 'blendMode';

export interface AltarState {
  charge: number;
  lastUpdated: number;
}

export function getAltarConfigTier(tier: TierType): AltarTierKey {
  if (tier === 'free') return 'neophyte';
  return tier as AltarTierKey;
}

export function isSuperAdmin(userId?: string): boolean {
  if (typeof window === 'undefined') return false;
  if (userId && (userId === 'kenx@guardianoracle.com' || userId.toLowerCase().includes('kenx@') || userId === 'superadmin')) {
    return true;
  }
  try {
    const savedUser = getSafeLocalStorage('ember_oracle_user_v1');
    if (savedUser) {
      const parsed = safeJsonParse<any>(savedUser, null);
      if (parsed && (parsed.email === 'kenx@guardianoracle.com' || parsed.email?.toLowerCase().includes('kenx@') || parsed.isSuperAdmin)) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

export async function getAltarState(userId: string): Promise<AltarState> {
  if (isSuperAdmin(userId)) {
    return { charge: 100, lastUpdated: Date.now() };
  }
  const key = `altar:${userId}`;
  const existing = await getSafeStorageAsync(key);

  if (!existing) {
    const fresh: AltarState = { charge: 100, lastUpdated: Date.now() };
    setSafeStorage(key, JSON.stringify(fresh));
    return fresh;
  }

  try {
    const parsed = safeJsonParse<any>(existing, null);
    if (!parsed) {
      return { charge: 100, lastUpdated: Date.now() };
    }
    return {
      charge: typeof parsed.charge === 'number' ? parsed.charge : 100,
      lastUpdated: typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : Date.now()
    };
  } catch (e) {
    return { charge: 100, lastUpdated: Date.now() };
  }
}

export function applyRecharge(state: AltarState, tier: AltarTierKey): AltarState {
  const config = ALTAR_CONFIG[tier];
  const hoursElapsed = (Date.now() - state.lastUpdated) / (1000 * 60 * 60);
  const moonMultiplier = getMoonChargeMultiplier();
  const recharged = Math.min(
    config.maxCharge,
    state.charge + hoursElapsed * config.rechargeRatePerHour * moonMultiplier
  );
  return { charge: recharged, lastUpdated: Date.now() };
}

export async function spendAltarCharge(
  userId: string,
  tier: AltarTierKey,
  actionKey: ActionCostKey,
  spirit?: { rank: string }
): Promise<{ allowed: boolean; charge: number; message?: string }> {
  if (isSuperAdmin(userId)) {
    return { allowed: true, charge: 100 };
  }
  const config = ALTAR_CONFIG[tier];
  let cost = config.chargePerAction * (ACTION_COSTS[actionKey] || 1);

  if (spirit) {
    const moon = checkMoonSympathy(spirit);
    if (moon.sympathetic) {
      cost = cost * 0.75; // 25% discount when sympathetic
    }
  }

  let state = await getAltarState(userId);
  state = applyRecharge(state, tier); // recharge first, then check

  if (state.charge < cost) {
    return {
      allowed: false,
      charge: state.charge,
      message: config.label
    };
  }

  const updated: AltarState = { charge: state.charge - cost, lastUpdated: Date.now() };
  const key = `altar:${userId}`;
  setSafeStorage(key, JSON.stringify(updated));

  // Dispatch a custom event to update components immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('altar-charge-update', {
        detail: { userId, charge: updated.charge, lastUpdated: updated.lastUpdated }
      })
    );
  }

  return { allowed: true, charge: updated.charge };
}
