// Moon Phase System — Calculator + Cross-System Hooks
// Pure date math, no API needed. Ties into Altar Charge, invocation potency, and the daily tarot pull.

export interface MoonPhase {
  name: string;
  min: number;
  max: number;
  symbol: string;
}

// Returns phase as a 0-1 value (0 = new moon, 0.5 = full moon, back to 1 = new moon)
export function getMoonPhaseValue(date = new Date()): number {
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime(); // reference new moon
  const synodicMonth = 29.53058867; // days
  const daysSince = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = (daysSince % synodicMonth) / synodicMonth;
  return phase < 0 ? phase + 1 : phase;
}

export const MOON_PHASES: MoonPhase[] = [
  { name: "New Moon",        min: 0.00, max: 0.03, symbol: "🌑" },
  { name: "Waxing Crescent", min: 0.03, max: 0.22, symbol: "🌒" },
  { name: "First Quarter",   min: 0.22, max: 0.28, symbol: "🌓" },
  { name: "Waxing Gibbous",  min: 0.28, max: 0.47, symbol: "🌔" },
  { name: "Full Moon",       min: 0.47, max: 0.53, symbol: "🌕" },
  { name: "Waning Gibbous",  min: 0.53, max: 0.72, symbol: "🌖" },
  { name: "Last Quarter",    min: 0.72, max: 0.78, symbol: "🌗" },
  { name: "Waning Crescent", min: 0.78, max: 0.97, symbol: "🌘" },
  { name: "New Moon",        min: 0.97, max: 1.00, symbol: "🌑" }
];

export function getMoonPhase(date = new Date()): MoonPhase {
  const value = getMoonPhaseValue(date);
  return MOON_PHASES.find(p => value >= p.min && value < p.max) || MOON_PHASES[0];
}

export function getMoonChargeMultiplier(date = new Date()): number {
  const value = getMoonPhaseValue(date);
  // distance from full moon (0.5) mapped to a 0.7x - 1.3x multiplier
  const distanceFromFull = Math.abs(value - 0.5); // 0 = full moon, 0.5 = new moon
  const multiplier = 1.3 - (distanceFromFull * 1.2); // full moon = 1.3x, new moon = 0.7x
  return Math.max(0.7, Math.min(1.3, multiplier));
}

const RANK_PRIORITY = ["Conduit", "King", "Duke", "Prince", "Marquis", "President", "Earl", "Knight"];

export function resolveTier(rankString: string): string {
  if (!rankString) return "Earl";
  if (rankString.toLowerCase().includes("conduit") || rankString.toLowerCase().includes("adept")) return "Conduit";
  if (rankString.toLowerCase().includes("duchess")) return "Duke";
  for (const tier of RANK_PRIORITY) {
    if (rankString.toLowerCase().includes(tier.toLowerCase())) return tier;
  }
  return "Earl"; // safe default
}

export const RANK_MOON_SYMPATHY: Record<string, string> = {
  Conduit: "Full Moon",
  King: "Full Moon",
  Duke: "Waxing Gibbous",
  Prince: "First Quarter",
  Marquis: "Waxing Crescent",
  President: "Last Quarter",
  Earl: "Waning Crescent",
  Knight: "New Moon"
};

export interface MoonSympathyResult {
  sympathetic: boolean;
  currentPhase: string;
  symbol: string;
  bonusLine: string | null;
}

export function checkMoonSympathy(spirit: { rank: string }): MoonSympathyResult {
  const tier = resolveTier(spirit.rank);
  const currentPhase = getMoonPhase();
  const sympathetic = RANK_MOON_SYMPATHY[tier] === currentPhase.name;

  return {
    sympathetic,
    currentPhase: currentPhase.name,
    symbol: currentPhase.symbol,
    bonusLine: sympathetic
      ? `${currentPhase.symbol} The ${currentPhase.name} favors this working. The channel opens with unusual clarity.`
      : null
  };
}

export const PHASE_CARD_AFFINITY: Record<string, string[]> = {
  "New Moon":        ["The Fool", "The Hermit", "Ace of Cups", "Ace of Pentacles"],
  "Waxing Crescent":  ["Ace of Wands", "The Star", "Page of Wands"],
  "First Quarter":    ["The Chariot", "Seven of Wands", "Knight of Swords"],
  "Waxing Gibbous":   ["The Sun", "Nine of Cups", "Ten of Pentacles"],
  "Full Moon":        ["The Moon", "The High Priestess", "Queen of Cups"],
  "Waning Gibbous":   ["Temperance", "Four of Cups", "Six of Swords"],
  "Last Quarter":     ["Justice", "Eight of Cups", "Death"],
  "Waning Crescent":  ["The Hanged Man", "Nine of Swords", "Four of Swords"]
};

export function getRitualPhaseFraming(): string {
  const value = getMoonPhaseValue();

  if (value < 0.25 || value > 0.9) {
    return "The New Moon holds. What you burn tonight stays ash — nothing rises too soon.";
  } else if (value >= 0.4 && value <= 0.6) {
    return "The Full Moon watches. What you rebuild tonight, build to last.";
  }
  return "The moon is between states, as you are. Burn and rebuild as you see fit.";
}
