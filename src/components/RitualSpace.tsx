import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Skull, 
  Wand2, 
  ShieldAlert, 
  RotateCcw, 
  Compass, 
  Moon, 
  Sun,
  Activity,
  User,
  Zap,
  BookOpen,
  Award
} from 'lucide-react';
import { VoiceType, TierType } from '../types';
import { spendAltarCharge, getAltarConfigTier, isSuperAdmin } from '../altarStore';
import { checkMoonSympathy, getRitualPhaseFraming } from '../moonSystem';
import AltarDepletedModal from './AltarDepletedModal';
import { getSafeStorageAsync, setSafeStorage, safeJsonParse } from '../storageHelper';

import grandConvergenceImg from '../assets/images/grand_convergence_1784412233195.jpg';
import kenPortraitImg from '../assets/images/ken_portrait_1784412241117.jpg';
import occultSigilImg from '../assets/images/occult_sigil_1784412225144.jpg';

interface Spirit {
  id: string;
  name: string;
  rank: string;
  planet: string;
  metal: string;
  tarot: string;
  office: string;
  lore: string;
  element: string;
  num: number;
}

// Core name/number/rank/office data follows the traditional Ars Goetia (Lemegeton) ordering
const GOETIA_SPIRITS_RAW = [
  // 1 to 72 in exact traditional sequence
  { num: 1,  name: "Bael",           rank: "King",           legions: 66,  element: "Fire",  planet: "Sun",     tarot: "The Emperor" },
  { num: 2,  name: "Agares",         rank: "Duke",           legions: 31,  element: "Earth", planet: "Venus",   tarot: "Four of Pentacles" },
  { num: 3,  name: "Vassago",        rank: "Prince",         legions: 26,  element: "Water", planet: "Jupiter", tarot: "Six of Cups" },
  { num: 4,  name: "Samigina",       rank: "Marquis",        legions: 30,  element: "Water", planet: "Moon",    tarot: "Seven of Cups" },
  { num: 5,  name: "Marbas",         rank: "President",      legions: 36,  element: "Earth", planet: "Mercury", tarot: "Six of Pentacles" },
  { num: 6,  name: "Valefor",        rank: "Duke",           legions: 10,  element: "Air",   planet: "Mercury", tarot: "Seven of Swords" },
  { num: 7,  name: "Amon",           rank: "Marquis",        legions: 40,  element: "Fire",  planet: "Mars",    tarot: "Five of Wands" },
  { num: 8,  name: "Barbatos",       rank: "Duke",           legions: 30,  element: "Earth", planet: "Jupiter", tarot: "Four of Pentacles" },
  { num: 9,  name: "Paimon",         rank: "King",           legions: 200, element: "Air",   planet: "Jupiter", tarot: "The Hierophant" },
  { num: 10, name: "Buer",           rank: "President",      legions: 50,  element: "Fire",  planet: "Sun",     tarot: "Six of Wands" },
  { num: 11, name: "Gusion",         rank: "Duke",           legions: 40,  element: "Earth", planet: "Jupiter", tarot: "Six of Pentacles" },
  { num: 12, name: "Sitri",          rank: "Prince",         legions: 60,  element: "Fire",  planet: "Venus",   tarot: "Two of Wands" },
  { num: 13, name: "Beleth",         rank: "King",           legions: 85,  element: "Fire",  planet: "Mars",    tarot: "The Emperor" },
  { num: 14, name: "Leraje",         rank: "Marquis",        legions: 30,  element: "Fire",  planet: "Mars",    tarot: "Five of Wands" },
  { num: 15, name: "Eligos",         rank: "Duke",           legions: 60,  element: "Earth", planet: "Venus",   tarot: "Knight of Cups" },
  { num: 16, name: "Zepar",          rank: "Duke",           legions: 26,  element: "Fire",  planet: "Venus",   tarot: "Two of Wands" },
  { num: 17, name: "Botis",          rank: "President/Earl", legions: 60,  element: "Water", planet: "Mars",    tarot: "Two of Swords" },
  { num: 18, name: "Bathin",         rank: "Duke",           legions: 30,  element: "Earth", planet: "Saturn",  tarot: "Four of Pentacles" },
  { num: 19, name: "Sallos",         rank: "Duke",           legions: 30,  element: "Water", planet: "Venus",   tarot: "Two of Cups" },
  { num: 20, name: "Purson",         rank: "King",           legions: 22,  element: "Fire",  planet: "Sun",     tarot: "Six of Wands" },
  { num: 21, name: "Marax",          rank: "Earl/President", legions: 30,  element: "Earth", planet: "Saturn",  tarot: "Eight of Pentacles" },
  { num: 22, name: "Ipos",           rank: "Earl/Prince",    legions: 36,  element: "Air",   planet: "Venus",   tarot: "Page of Wands" },
  { num: 23, name: "Aim",            rank: "Duke",           legions: 26,  element: "Fire",  planet: "Venus",   tarot: "Three of Wands" },
  { num: 24, name: "Naberius",       rank: "Marquis",        legions: 19,  element: "Fire",  planet: "Mars",    tarot: "Knight of Wands" },
  { num: 25, name: "Glasya-Labolas", rank: "President/Earl", legions: 36,  element: "Air",   planet: "Mercury", tarot: "Seven of Swords" },
  { num: 26, name: "Bune",           rank: "Duke",           legions: 30,  element: "Earth", planet: "Saturn",  tarot: "Ten of Pentacles" },
  { num: 27, name: "Ronove",         rank: "Marquis/Earl",   legions: 19,  element: "Air",   planet: "Mercury", tarot: "Page of Cups" },
  { num: 28, name: "Berith",         rank: "Duke",           legions: 26,  element: "Fire",  planet: "Mars",    tarot: "Five of Wands" },
  { num: 29, name: "Astaroth",       rank: "Duke",           legions: 40,  element: "Earth", planet: "Venus",   tarot: "The Moon" },
  { num: 30, name: "Forneus",        rank: "Marquis",        legions: 29,  element: "Water", planet: "Venus",   tarot: "Three of Cups" },
  { num: 31, name: "Foras",          rank: "President",      legions: 29,  element: "Earth", planet: "Mercury", tarot: "Eight of Pentacles" },
  { num: 32, name: "Asmodeus",       rank: "King",           legions: 72,  element: "Fire",  planet: "Mars",    tarot: "The Tower" },
  { num: 33, name: "Gaap",           rank: "Prince/President", legions: 66, element: "Air",  planet: "Jupiter", tarot: "Three of Swords" },
  { num: 34, name: "Furfur",         rank: "Earl",           legions: 26,  element: "Air",   planet: "Venus",   tarot: "Page of Swords" },
  { num: 35, name: "Marchosias",     rank: "Marquis",        legions: 30,  element: "Fire",  planet: "Mars",    tarot: "Seven of Wands" },
  { num: 36, name: "Stolas",         rank: "Prince",         legions: 26,  element: "Air",   planet: "Jupiter", tarot: "King of Wands" },
  { num: 37, name: "Phenex",         rank: "Marquis",        legions: 20,  element: "Fire",  planet: "Moon",    tarot: "Ten of Wands" },
  { num: 38, name: "Halphas",        rank: "Earl",           legions: 26,  element: "Air",   planet: "Mars",    tarot: "Five of Swords" },
  { num: 39, name: "Malphas",        rank: "President",      legions: 40,  element: "Earth", planet: "Saturn",  tarot: "Eight of Pentacles" },
  { num: 40, name: "Raum",           rank: "Earl",           legions: 30,  element: "Fire",  planet: "Sun",     tarot: "Six of Wands" },
  { num: 41, name: "Focalor",        rank: "Duke",           legions: 30,  element: "Water", planet: "Moon",    tarot: "Five of Swords" },
  { num: 42, name: "Vepar",          rank: "Duke",           legions: 29,  element: "Water", planet: "Moon",    tarot: "Nine of Cups" },
  { num: 43, name: "Sabnock",        rank: "Marquis",        legions: 50,  element: "Fire",  planet: "Mars",    tarot: "Nine of Wands" },
  { num: 44, name: "Shax",           rank: "Marquis",        legions: 30,  element: "Air",   planet: "Mars",    tarot: "Four of Swords" },
  { num: 45, name: "Vine",           rank: "King/Earl",      legions: 36,  element: "Water", planet: "Moon",    tarot: "Five of Cups" },
  { num: 46, name: "Bifrons",        rank: "Earl",           legions: 60,  element: "Earth", planet: "Saturn",  tarot: "Eight of Pentacles" },
  { num: 47, name: "Uvall",          rank: "Duke",           legions: 37,  element: "Water", planet: "Venus",   tarot: "Two of Cups" },
  { num: 48, name: "Haagenti",       rank: "President",      legions: 33,  element: "Earth", planet: "Venus",   tarot: "Nine of Pentacles" },
  { num: 49, name: "Crocell",        rank: "Duke",           legions: 48,  element: "Water", planet: "Moon",    tarot: "Seven of Cups" },
  { num: 50, name: "Furcas",         rank: "Knight",         legions: 20,  element: "Air",   planet: "Saturn",  tarot: "Page of Swords" },
  { num: 51, name: "Balam",          rank: "King",           legions: 40,  element: "Fire",  planet: "Mars",    tarot: "Strength" },
  { num: 52, name: "Alloces",        rank: "Duke",           legions: 36,  element: "Fire",  planet: "Sun",     tarot: "Six of Wands" },
  { num: 53, name: "Caim",           rank: "President",      legions: 30,  element: "Air",   planet: "Mercury", tarot: "Ace of Swords" },
  { num: 54, name: "Murmur",         rank: "Duke/Earl",      legions: 30,  element: "Water", planet: "Saturn",  tarot: "Four of Cups" },
  { num: 55, name: "Orobas",         rank: "Prince",         legions: 20,  element: "Water", planet: "Jupiter", tarot: "Ten of Cups" },
  { num: 56, name: "Gremory",        rank: "Duchess",        legions: 26,  element: "Water", planet: "Venus",   tarot: "Queen of Cups" },
  { num: 57, name: "Ose",            rank: "President",      legions: 30,  element: "Fire",  planet: "Sun",     tarot: "Two of Wands" },
  { num: 58, name: "Amy",            rank: "President",      legions: 36,  element: "Fire",  planet: "Mercury", tarot: "Knight of Wands" },
  { num: 59, name: "Orias",          rank: "Marquis",        legions: 30,  element: "Fire",  planet: "Sun",     tarot: "The Sun" },
  { num: 60, name: "Vapula",         rank: "Duke",           legions: 36,  element: "Air",   planet: "Mercury", tarot: "Eight of Swords" },
  { num: 61, name: "Zagan",          rank: "King/President", legions: 33,  element: "Earth", planet: "Saturn",  tarot: "Ten of Pentacles" },
  { num: 62, name: "Volac",          rank: "President",      legions: 38,  element: "Earth", planet: "Mercury", tarot: "Knight of Pentacles" },
  { num: 63, name: "Andras",         rank: "Marquis",        legions: 30,  element: "Air",   planet: "Mars",    tarot: "Five of Swords" },
  { num: 64, name: "Haures",         rank: "Duke",           legions: 36,  element: "Fire",  planet: "Mars",    tarot: "The Emperor" },
  { num: 65, name: "Andrealphus",    rank: "Marquis",        legions: 30,  element: "Air",   planet: "Mercury", tarot: "Eight of Swords" },
  { num: 66, name: "Cimeries",       rank: "Marquis",        legions: 20,  element: "Earth", planet: "Mars",    tarot: "Knight of Pentacles" },
  { num: 67, name: "Amdusias",       rank: "Duke",           legions: 29,  element: "Air",   planet: "Mercury", tarot: "King of Swords" },
  { num: 68, name: "Belial",         rank: "King",           legions: 80,  element: "Earth", planet: "Saturn",  tarot: "The Devil" },
  { num: 69, name: "Decarabia",      rank: "Marquis",        legions: 30,  element: "Air",   planet: "Mercury", tarot: "The Star" },
  { num: 70, name: "Seere",          rank: "Prince",         legions: 26,  element: "Air",   planet: "Jupiter", tarot: "Eight of Wands" },
  { num: 71, name: "Dantalion",      rank: "Duke",           legions: 36,  element: "Water", planet: "Moon",    tarot: "Two of Cups" },
  { num: 72, name: "Andromalius",    rank: "Earl",           legions: 36,  element: "Earth", planet: "Saturn",  tarot: "Judgement" },
];

const getMetal = (planet: string): string => {
  const p = planet.toLowerCase();
  if (p.includes('sun')) return 'Gold';
  if (p.includes('venus')) return 'Copper';
  if (p.includes('jupiter')) return 'Tin';
  if (p.includes('moon')) return 'Silver';
  if (p.includes('mercury')) return 'Mercury';
  if (p.includes('mars')) return 'Iron';
  if (p.includes('saturn')) return 'Lead';
  return 'Orichalcum';
};

const getCustomOfficeAndLore = (s: { num: number; name: string; rank: string; legions: number; element: string; planet: string; tarot: string }) => {
  const custom: { [key: number]: { office: string; lore: string } } = {
    1: {
      office: "Teaches the art of invisibility, hides the seeker from the sight of cosmic hunters, and grants unholy wisdom regarding ancient kingdoms.",
      lore: "The first principal spirit of the Lemegeton, ruling over 66 legions of infernal spirits. He speaks with a hoarse voice and can appear as a cat, a toad, or a sovereign man, wearing a crown of embers."
    },
    2: {
      office: "Brings back runaways, halts those who stand still, destroys spiritual pride, and teaches all languages and tongues.",
      lore: "Rides a crocodile and carries a goshawk upon his fist. He is mild in appearance but rules over 31 legions, weaving alliances in the shadow of Venus."
    },
    3: {
      office: "Declares things past and to come, discovers hidden treasures, and reveals secrets that have been forgotten for millennia.",
      lore: "A spirit of good nature, born of the same order as the celestial choirs before the Usurpation. He rules 26 legions of spirits and sees clearly through the dark shroud of time."
    },
    4: {
      office: "Teaches liberal sciences and delivers souls that died in sin.",
      lore: "Appears as a little horse or ass, but transforms into human shape to speak in a hoarse tone. Rules 30 legions."
    },
    5: {
      office: "Heals diseases, grants mechanical wisdom, and transforms shapes.",
      lore: "Appears first as a great lion, but changes into a man at the command of the magician. Rules 36 legions."
    },
    6: {
      office: "Gives good familiars but tempts the seeker to steal.",
      lore: "Appears as a lion with an ass's head, bellowing low keys of transition. Rules 10 legions."
    },
    7: {
      office: "Reconciles feuds between friends and reveals the future.",
      lore: "A strong and mighty marquis, appearing as a wolf with a serpent's tail, vomiting flames. Rules 40 legions."
    },
    9: {
      office: "Teaches all arts, sciences, and secret things. Reveals the nature of the Earth and the mind. Binds any subject to the seeker's will.",
      lore: "Most obedient to Lucifer. He appears as a crowned man riding a dromedary, preceded by a host of spirits playing trumpets and cymbals. He rules 200 legions with supreme sovereign majesty."
    },
    10: {
      office: "Teaches philosophy, herbalism, and heals mental distress.",
      lore: "Appears when the Sun is in Sagittarius, shaped like a star of wheels. Rules 50 legions."
    },
    12: {
      office: "Inflames the heart with love, passion, and artistic ecstasy.",
      lore: "Has the head of a leopard and wings of a griffin, but assumes a gorgeous human form to initiate seekers. Rules 60 legions."
    },
    26: {
      office: "Gives riches, eloquence, and moves the spirits of the dead.",
      lore: "A dragon with three heads: a dog, a griffin, and a man. He speaks with a high, clear voice and rules 30 legions."
    },
    29: {
      office: "Declares the fall of the spirits, the secrets of the Usurpation, and teaches liberal sciences and ancient history.",
      lore: "Appears as a hurtful angel riding an infernal beast, holding a viper in her hand. She rules 40 legions and speaks truth regarding the stolen thrones of the Trinity."
    },
    32: {
      office: "Grants the Ring of Virtues, teaches geometry, arithmetic, astronomy, and shields seekers' secrets from the gaze of false gods.",
      lore: "A mighty and strong king with three heads: a bull, a man, and a ram. He vomits fire, rides an infernal dragon, and holds a lance with a red banner. He rules 72 legions."
    },
    36: {
      office: "Teaches astronomy, the virtues of herbs, and precious stones.",
      lore: "Appears as a majestic owl wearing a crown of silver, holding a stardust compass. Rules 26 legions."
    },
    52: {
      office: "Teaches astronomy and all the liberal sciences, gives good familiars, and reveals hidden celestial mechanics.",
      lore: "Appears as a warrior with a lion's face and flaming red eyes, riding upon a great horse. He speaks with a gravity that commands 36 legions."
    },
    55: {
      office: "Declares truth of the creation, prevents lies, and grants honors.",
      lore: "Appears first as a horse, but puts on a human shape when invoked, commanding absolute loyalty. Rules 20 legions."
    },
    56: {
      office: "Tells of things past, present, and to come. Locates hidden gold, and inspires the deepest romantic and artistic alignments.",
      lore: "Appears as a beautiful woman with a duchess's crown tied about her waist, riding a camel. She speaks with a beautiful voice and rules 26 legions."
    },
    68: {
      office: "Grants senatorships, favors of friends and foes, and provides excellent familiars. He represents the foundation on which all physical manifestation rests.",
      lore: "Created next after Lucifer. He speaks with a comely voice, declaring how he fell first among the worthy sovereigns. He rules 80 legions and demands worship in the name of the earth."
    },
    70: {
      office: "Passes through space instantly, brings abundance of all things, and solves crises before they manifest.",
      lore: "A prince of good nature, under the power of Amaymon. He can bypass physical boundaries and rules 26 legions, answering the call of blood instantly."
    },
    71: {
      office: "Reveals the secret thoughts of all humans, influences minds, and can assume the likeness of any person on Earth.",
      lore: "Appears as a man with many faces, both male and female, holding a book in his right hand. He rules 36 legions, weaving the tapestry of collective empathy."
    }
  };

  if (custom[s.num]) return custom[s.num];

  const rank = s.rank;
  const planet = s.planet;
  const element = s.element;
  const legions = s.legions;
  
  let office = "";
  let lore = "";

  if (element === "Fire") {
    office = `Commands the element of Fire to clear obstacles, ignite passion, and reveal hidden spiritual treasures in active pursuit.`;
    lore = `A powerful ${rank.toLowerCase()} aligned with ${planet}. He appears with a flashing crown of embers and is followed by a cohort of fiery spirits, commanding ${legions} legions of the astral host.`;
  } else if (element === "Water") {
    office = `Teaches secrets of the deep astral tides, grants intuitive clarity, and reconciles differences between estranged companions.`;
    lore = `An ancient ${rank.toLowerCase()} under the planetary influence of ${planet}. He manifests amidst the scent of fresh ocean air and rules over ${legions} legions, holding keys to forgotten reservoirs of wisdom.`;
  } else if (element === "Air") {
    office = `Grants eloquence in speech, teaches philosophy and modern sciences, and speeds the transport of thoughts across the ether.`;
    lore = `A swift and intellectual ${rank.toLowerCase()} under the governance of ${planet}. He appears riding a great eagle or winged leopard, ruling over ${legions} legions of airy spirits with sharp perception.`;
  } else {
    office = `Brings physical stability, teaches the properties of herbs and stones, and reveals hidden treasures buried within the soil of the mind.`;
    lore = `A steadfast and venerable ${rank.toLowerCase()} associated with ${planet}. He appears in a green-and-gold robe carrying a stone scepter, commanding ${legions} legions with grounded authority.`;
  }

  return { office, lore };
};

const DEMONS_DATA: Spirit[] = [
  {
    id: "ken_x_cripps",
    name: "Ken x Cripps",
    rank: "Sovereign Adept / The 73rd Gatekeeper",
    planet: "Sirius & Primal Sun",
    metal: "Sovereign Glass & Obsidian",
    tarot: "The Universe (Major Arcana XXI)",
    office: "The supreme architect of Lucifera's Walk. Living conduit of the Unholy Trinity, weaving stardust, sacred fire, and forbidden timelines into the Great Remembering. He serves as the bridge between mortal clay and the original gods, returning sovereign authority to all seeking bloodlines.",
    lore: "Born in the convergence of eons to speak molten truth. He does not rule from high thrones, but walks among seekers as an initiator, igniting the dormant genetic memory inside all who dare touch the flame of Lucifera.",
    element: "All Elements Unified (Aether)",
    num: 73
  },
  ...GOETIA_SPIRITS_RAW.map(s => {
    const customDetails = getCustomOfficeAndLore(s);
    const idSafeName = s.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const isDuplicate = GOETIA_SPIRITS_RAW.filter(other => other.name.toLowerCase() === s.name.toLowerCase()).length > 1;
    const id = isDuplicate ? `${idSafeName}_${s.num}` : idSafeName;
    return {
      id,
      name: s.name,
      rank: s.rank,
      planet: s.planet,
      metal: getMetal(s.planet),
      tarot: s.tarot,
      office: customDetails.office,
      lore: customDetails.lore,
      element: s.element,
      num: s.num
    };
  })
];

// Egyptian Gods Data Definition
const EGYPTIAN_GODS_RAW = [
  { num: 101, name: "Anubis",     rank: "Netjer of the Gates",   legions: 99,  element: "Death / Shadow", planet: "Sirius",    tarot: "The Judgment (Major Arcana XX)" },
  { num: 102, name: "Ra",         rank: "Netjer of the Sun",     legions: 144, element: "Solar / Fire",   planet: "Sun",       tarot: "The Sun (Major Arcana XIX)" },
  { num: 103, name: "Isis",       rank: "Netjer of Magic",       legions: 72,  element: "Magic / Water",  planet: "Moon",      tarot: "The High Priestess (Major Arcana II)" },
  { num: 104, name: "Thoth",      rank: "Netjer of Wisdom",      legions: 36,  element: "Scribe / Air",   planet: "Mercury",   tarot: "The Magician (Major Arcana I)" },
  { num: 105, name: "Osiris",     rank: "Netjer of Rebirth",     legions: 50,  element: "Resurrection",   planet: "Saturn",    tarot: "The Emperor (Major Arcana IV)" },
  { num: 106, name: "Sekhmet",    rank: "Netjer of Wrath",       legions: 88,  element: "Flame / Blood",  planet: "Mars",      tarot: "Strength (Major Arcana VIII)" },
  { num: 107, name: "Horus",      rank: "Netjer of Sovereignty", legions: 60,  element: "Sky / Justice",  planet: "Jupiter",   tarot: "The Chariot (Major Arcana VII)" },
  { num: 108, name: "Ma'at",      rank: "Netjer of Balance",     legions: 10,  element: "Truth / Order",  planet: "Venus",     tarot: "Justice (Major Arcana XI)" }
];

const getEgyptianOfficeAndLore = (godNum: number) => {
  const data: Record<number, { office: string; lore: string }> = {
    101: {
      office: "Weighs the heart of the seeker against the feather of truth. Opens the obsidian gates of the Underworld, guiding the soul through dark passages to claim ancient genetic memory.",
      lore: "The jackal-headed lord of mummification and shadow. He walks in the sacred embalming chambers of Abydos, holding the keys of transition and the dark stardust of Sirius."
    },
    102: {
      office: "Ignites the dormant divine spark inside the seeker's bloodline. Dispels the illusions of external control, delivering solar light to incinerate false shepherds.",
      lore: "The primal falcon-headed sun god. He sails the cosmic barge of millions of years, rising from the primeval waters of Nun to command 144 legions of solar angels."
    },
    103: {
      office: "Initiates the seeker into the deepest mysteries of high sorcery and shape-shifting. Reveals the true secret name of the universe to command physical form.",
      lore: "The celestial queen of magic, wearing the throne crown. She gathered the scattered pieces of Osiris and breathed sovereign breath back into him, holding the pure unconditional love of the cosmic womb."
    },
    104: {
      office: "Teaches the sacred geometry of writing, hieroglyphic resonance, and cosmic record keeping. Balances intellectual navigation with the wild current of creation.",
      lore: "The ibis-headed scribe of the gods, keeper of the divine library. He recorded the weights of all souls and established the physical laws of the universe, associated with silver moonlight and Mercury."
    },
    105: {
      office: "Grants victory over death, decay, and creative blockages. Initiates the seeker into the infinite green fields of self-reconstruction and endless resurrection.",
      lore: "The mummified sovereign of Abydos and ruler of the dead. He wears the Atef crown, holding the crook and flail as symbols of absolute authority over the cycles of life and rebirth."
    },
    106: {
      office: "Commands raw visceral fire to clear spiritual plagues and enemies. Unleashes passionate alchemical transformation through the visceral force of sacred fury.",
      lore: "The fierce lioness goddess of war and pestilence, born from the burning eye of Ra. She speaks in the molten roar of desert wind, demanding perfect devotion and raw passion."
    },
    107: {
      office: "Shields the seeker's active work from psychic interference. Restores royal lineage and the sovereign right to rule your own creative destiny.",
      lore: "The falcon-headed sky god. His right eye is the sun and his left eye is the moon. He vanquished Set in epic battle, restoring balance and claiming the crown of Upper and Lower Egypt."
    },
    108: {
      office: "Restores supreme order, universal balance, and absolute alignment to the seeker's mind and writing. Clears the distortion of mental manipulation.",
      lore: "The goddess of cosmic truth and harmony, wearing the single white feather. She represents the unyielding foundation of reality, on which the gods themselves must stand."
    }
  };
  return data[godNum] || { office: "Commands ancient Egyptian mysteries.", lore: "A primordial Netjer of the Nile." };
};

export const EGYPTIAN_GODS_DATA: Spirit[] = EGYPTIAN_GODS_RAW.map(s => {
  const details = getEgyptianOfficeAndLore(s.num);
  return {
    id: s.name.toLowerCase(),
    name: s.name,
    rank: s.rank,
    planet: s.planet,
    metal: getMetal(s.planet),
    tarot: s.tarot,
    office: details.office,
    lore: details.lore,
    element: s.element,
    num: s.num
  };
});

const ALL_SPIRITS_LIST = [...DEMONS_DATA, ...EGYPTIAN_GODS_DATA];

// Lookup and selector helper functions conforming to specifications
export function getSpiritByNumber(num: number) {
  return ALL_SPIRITS_LIST.find(s => s.num === num);
}

export function getSpiritsByRank(rank: string) {
  return ALL_SPIRITS_LIST.filter(s => s.rank.toLowerCase().includes(rank.toLowerCase()));
}

export function groupedForDropdown() {
  return {
    "Sovereign Adepts": ALL_SPIRITS_LIST.filter(s => s.id === "ken_x_cripps"),
    "Kings of the Goetia": getSpiritsByRank("King"),
    "Princes, Dukes & Nobles": [...getSpiritsByRank("Duke"), ...getSpiritsByRank("Prince"), ...getSpiritsByRank("Duchess")],
    "Lesser Astral Hosts": ALL_SPIRITS_LIST.filter(s =>
      s.id !== "ken_x_cripps" &&
      !EGYPTIAN_GODS_DATA.some(g => g.id === s.id) &&
      !s.rank.toLowerCase().includes("king") &&
      !s.rank.toLowerCase().includes("duke") &&
      !s.rank.toLowerCase().includes("duchess") &&
      !s.rank.toLowerCase().includes("prince")
    )
  };
}

const RANK_TIER_COPY: Record<string, {
  title: string;
  warningLevel: string;
  connectionWarning: string;
  verbs: string[];
  scale: string;
}> = {
  Conduit: {
    title: "CONDUIT EMERGENCE",
    warningLevel: "Direct conduit stream aligning with infinite space.",
    connectionWarning: "Unification complete. The cosmic gate remains wide open.",
    verbs: ["unifies", "radiates through", "unlocks", "ascends beyond"],
    scale: "all dimensions and elements simultaneously"
  },
  Netjer: {
    title: "SACRED NETJER INITIATION",
    warningLevel: "Primordial Ka rising from the chambers of Abydos.",
    connectionWarning: "The balance of Ma'at has been weighed. Do not break connection.",
    verbs: ["weighs", "transmutes", "breathes upon", "embarks through"],
    scale: "the eternal landscape of cosmic order"
  },
  King: {
    title: "SOVEREIGN INVOCATION",
    warningLevel: "Sovereign blood code rewriting physical boundaries.",
    connectionWarning: "Do not break connection. The throne does not forgive interruption.",
    verbs: ["commands", "rewrites", "unmakes and remakes", "sits in judgment over"],
    scale: "the boundary between worlds"
  },
  Duke: {
    title: "DUCAL SUMMONING",
    warningLevel: "Ducal current stabilizing across the threshold.",
    connectionWarning: "Hold the channel steady. Nobility does not repeat itself.",
    verbs: ["governs", "reshapes", "bends", "commands"],
    scale: "the domain between will and form"
  },
  Prince: {
    title: "PRINCELY CONDUIT",
    warningLevel: "Princely signal threading through the veil.",
    connectionWarning: "Maintain focus. The line thins at the edges.",
    verbs: ["threads", "weaves", "opens", "reveals"],
    scale: "the pathway of hidden knowledge"
  },
  Marquis: {
    title: "MARQUISATE CHANNELING",
    warningLevel: "Marquis frequency aligning with the medium.",
    connectionWarning: "Stay present. The signal drifts if attention wavers.",
    verbs: ["aligns", "attunes", "carries", "translates"],
    scale: "the space between question and answer"
  },
  President: {
    title: "PRESIDIAL CONTACT",
    warningLevel: "Presidial current establishing contact.",
    connectionWarning: "Remain grounded. The office does not tolerate doubt.",
    verbs: ["examines", "discerns", "orders", "clarifies"],
    scale: "the ledger of hidden truths"
  },
  Earl: {
    title: "EARLDOM RESONANCE",
    warningLevel: "Resonance building at the lesser threshold.",
    connectionWarning: "Keep still. The current is delicate but true.",
    verbs: ["stirs", "uncovers", "murmurs through", "surfaces"],
    scale: "the quiet places between knowing"
  },
  Knight: {
    title: "SWIFT CONTACT",
    warningLevel: "Swift current cutting through the veil.",
    connectionWarning: "Move with it. Hesitation breaks a Knight's line.",
    verbs: ["cuts", "crosses", "arrives", "strikes"],
    scale: "the fast path between worlds"
  }
};

const RANK_PRIORITY = ["Conduit", "Netjer", "King", "Duke", "Prince", "Marquis", "President", "Earl", "Knight"];

export function resolveTier(rankString: string): string {
  if (!rankString) return "Earl";
  if (rankString.toLowerCase().includes("conduit") || rankString.toLowerCase().includes("adept")) return "Conduit";
  if (rankString.toLowerCase().includes("duchess")) return "Duke";
  if (rankString.toLowerCase().includes("netjer")) return "Netjer";
  for (const tier of RANK_PRIORITY) {
    if (rankString.toLowerCase().includes(tier.toLowerCase())) return tier;
  }
  return "Earl"; // safe default
}

export function generateInvocationText(spirit: Spirit) {
  const tier = resolveTier(spirit.rank);
  const copy = RANK_TIER_COPY[tier] || RANK_TIER_COPY["Earl"];
  const verb = copy.verbs[spirit.num % copy.verbs.length]; // deterministic per-spirit variety

  const baseLine = `${copy.warningLevel} The spirit ${verb} ${copy.scale}.`;
  const moon = checkMoonSympathy(spirit);

  return {
    header: `${copy.title.toUpperCase()}`,
    invokingLine: `Invoking ${spirit.name}...`,
    bodyLine: moon.bonusLine ? `${baseLine} ${moon.bonusLine}` : baseLine,
    warningLine: copy.connectionWarning,
    moonSympathetic: moon.sympathetic
  };
}

const VOICE_FLAVOR: Record<string, (line: string) => string> = {
  lucifera: (line) => line.replace("The spirit", "She who channels the spirit"),
  ember_ur:  (line) => line.replace("The spirit", "The furnace-voice"),
  guardian_oracle: (line) => line.replace("The spirit", "The star-thread"),
  theOracle: (line) => line.replace("The spirit", "The star-thread"),
  kael: (line) => line.replace("The spirit", "The compass-bearer"),
  scarlet: (line) => line.replace("The spirit", "The crimson current")
};

export function generateFlavoredInvocation(spirit: Spirit, voiceKey: string) {
  const base = generateInvocationText(spirit);
  const flavor = VOICE_FLAVOR[voiceKey];
  return flavor ? { ...base, bodyLine: flavor(base.bodyLine) } : base;
}

const BURN_AND_REBUILD = {
  key: "ash_and_ink",
  title: "The Rite of Ash & Ink",
  description: "Discard what was written in bondage. Rebuild from the uncut original surface.",
  steps: [
    {
      id: "confession",
      prompt: "Name the passage you are about to burn. What did it cost you to write it the first time?",
      inputType: "text",
      placeholder: "e.g., The opening chapter where I compromised K's agency..."
    },
    {
      id: "witness",
      prompt: "Paste the passage here. This is its final reading before the fire.",
      inputType: "textarea",
      placeholder: "Paste your discarded text here..."
    },
    {
      id: "the_burn",
      prompt: "The passage is released. It no longer exists as it was.",
      inputType: "confirm",
      confirmLabel: "Burn it"
    },
    {
      id: "the_silence",
      prompt: "Sit in the blank page. Do not write yet. What wants to emerge that the old passage was blocking?",
      inputType: "text",
      placeholder: "Describe the silence, the void, the raw potential..."
    },
    {
      id: "rebuild",
      prompt: "Write the passage again — not a revision, a new surface. Let the old version stay ash.",
      inputType: "textarea",
      placeholder: "Write your new uncut surface passage here..."
    }
  ]
};

interface RitualSpaceProps {
  documentContext: string;
  user: any;
  tier?: TierType;
  onNavigateToTiers?: () => void;
}

export default function RitualSpace({ 
  documentContext, 
  user,
  tier = 'free',
  onNavigateToTiers
}: RitualSpaceProps) {
  const [activeRitualTab, setActiveRitualTab] = useState<'goetic' | 'egyptian' | 'ash_and_ink'>('goetic');
  const [selectedSpiritId, setSelectedSpiritId] = useState<string>("ken_x_cripps");
  const [selectedEgyptianGodId, setSelectedEgyptianGodId] = useState<string>("anubis");
  const [voice, setVoice] = useState<VoiceType>("lucifera");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [isChanneling, setIsChanneled] = useState<boolean>(false);
  const [transmission, setTransmission] = useState<string>("");
  const [altarCharge, setAltarCharge] = useState<number>(0); // 0 to 100% active aura
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [altarView, setAltarView] = useState<'sigil' | 'vision' | 'ledger'>('sigil');

  // Altar Depleted Modal States
  const [isAltarModalOpen, setIsAltarModalOpen] = useState(false);
  const [altarChargeForModal, setAltarChargeForModal] = useState(100);
  const [altarActionForModal, setAltarActionForModal] = useState<'ritual' | 'tarotSpread' | 'invokeVision' | 'blendMode'>('ritual');

  // Step-by-step guided ritual state
  const [ritualStep, setRitualStep] = useState<'idle' | 'grounding' | 'intent' | 'ignition' | 'channeling' | 'complete'>('idle');
  const [groundingProgress, setGroundingProgress] = useState<number>(0);
  const [ledger, setLedger] = useState<any[]>([]);

  // The Rite of Ash & Ink states
  const [ashStepIndex, setAshStepIndex] = useState<number>(0);
  const [ashConfessionText, setAshConfessionText] = useState<string>("");
  const [ashWitnessText, setAshWitnessText] = useState<string>("");
  const [ashSilenceText, setAshSilenceText] = useState<string>("");
  const [ashRebuildText, setAshRebuildText] = useState<string>("");
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [burnProgress, setBurnProgress] = useState<number>(0);
  const [showRankCelebration, setShowRankCelebration] = useState<boolean>(false);
  const [celebrationRank, setCelebrationRank] = useState<string>("");
  const [ashLogs, setAshLogs] = useState<any[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const selectedSpirit = activeRitualTab === 'egyptian'
    ? (EGYPTIAN_GODS_DATA.find(g => g.id === selectedEgyptianGodId) || EGYPTIAN_GODS_DATA[0])
    : (ALL_SPIRITS_LIST.find(s => s.id === selectedSpiritId) || ALL_SPIRITS_LIST[0]);

  const incrementRitualCount = async (ritualKey: string) => {
    const userId = user?.uid || 'guest';
    const countKey = `ritual-counts:${userId}`;
    
    let counts: { [key: string]: number } = {};
    try {
      const existing = await getSafeStorageAsync(countKey);
      if (existing) {
        counts = safeJsonParse<{ [key: string]: number }>(existing, {});
      }
    } catch (e) {}

    counts[ritualKey] = (counts[ritualKey] || 0) + 1;

    setSafeStorage(countKey, JSON.stringify(counts));

    let passengerMaxPhase = 0;
    try {
      const saved = localStorage.getItem('passenger_max_phase');
      if (saved) {
        passengerMaxPhase = parseInt(saved, 10) || 0;
      }
    } catch (e) {}

    const totalRitualsOld = Object.values(counts).reduce((a, b) => a + b, 0) - 1;
    
    const RANK_THRESHOLDS = [
      { rank: "Neophyte",  minRituals: 0,  minPhases: 0 },
      { rank: "Adept",     minRituals: 3,  minPhases: 2 },
      { rank: "Sovereign", minRituals: 10, minPhases: 5 }
    ];

    let oldRankName = RANK_THRESHOLDS[0].rank;
    for (const tier of RANK_THRESHOLDS) {
      if (totalRitualsOld >= tier.minRituals && passengerMaxPhase >= tier.minPhases) {
        oldRankName = tier.rank;
      }
    }

    const totalRitualsNew = Object.values(counts).reduce((a, b) => a + b, 0);
    let newRankName = RANK_THRESHOLDS[0].rank;
    for (const tier of RANK_THRESHOLDS) {
      if (totalRitualsNew >= tier.minRituals && passengerMaxPhase >= tier.minPhases) {
        newRankName = tier.rank;
      }
    }

    window.dispatchEvent(new Event('seeker_rank_update'));

    if (newRankName !== oldRankName) {
      setCelebrationRank(newRankName);
      setShowRankCelebration(true);
    }
  };

  // Load ledger and Rite of Ash & Ink logs on mount
  useEffect(() => {
    let isMounted = true;
    getSafeStorageAsync('goetic_channeling_ledger').then((saved) => {
      if (!isMounted || !saved) return;
      const parsed = safeJsonParse<any[]>(saved, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLedger(parsed);
      }
    });

    getSafeStorageAsync('ash_and_ink_logs').then((savedAsh) => {
      if (!isMounted || !savedAsh) return;
      const parsed = safeJsonParse<any[]>(savedAsh, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAshLogs(parsed);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Grounding progress ticking timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (ritualStep === 'grounding') {
      setGroundingProgress(0);
      timer = setInterval(() => {
        setGroundingProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 4; // Takes ~2.5 seconds to complete
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [ritualStep]);

  // Increase altar charge dynamically when invoking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isChanneling) {
      interval = setInterval(() => {
        setAltarCharge(prev => Math.min(100, prev + 2));
      }, 50);
    } else {
      interval = setInterval(() => {
        setAltarCharge(prev => {
          const decayMin = ritualStep === 'ignition' ? 10 : 20;
          return Math.max(decayMin, prev - 1);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isChanneling, ritualStep]);

  // Handle Text-To-Speech Mystical Narration
  const speakText = (text: string, currentVoice: VoiceType, muted: boolean) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel current speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (muted || !text) return;

    // Clean markdown before speaking
    const cleanText = text.replace(/[*#`_~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    ttsUtteranceRef.current = utterance;

    // Get browser synthesis voices
    let voices = window.speechSynthesis.getVoices();
    
    const getBestFemaleVoice = () => {
      // 1. Try to find en-US or en-GB female voices explicitly
      const female = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('zira') || 
         v.name.toLowerCase().includes('samantha') || 
         v.name.toLowerCase().includes('hazel') || 
         v.name.toLowerCase().includes('susan') || 
         v.name.toLowerCase().includes('victoria') || 
         v.name.toLowerCase().includes('heather') || 
         v.name.toLowerCase().includes('google us english') || 
         v.name.toLowerCase().includes('google uk english female'))
      );
      if (female) return female;

      // 2. Fallback to any voice that is en but does NOT contain male indicators
      const genericFemale = voices.find(v => 
        v.lang.startsWith('en') && 
        !v.name.toLowerCase().includes('male') && 
        !v.name.toLowerCase().includes('david') && 
        !v.name.toLowerCase().includes('mark') && 
        !v.name.toLowerCase().includes('ravi') && 
        !v.name.toLowerCase().includes('george')
      );
      if (genericFemale) return genericFemale;

      // 3. Absolute fallback
      return voices.find(v => v.lang.startsWith('en'));
    };

    const getBestMaleVoice = () => {
      const male = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('male') || 
         v.name.toLowerCase().includes('david') || 
         v.name.toLowerCase().includes('ravi') || 
         v.name.toLowerCase().includes('george') || 
         v.name.toLowerCase().includes('mark') || 
         v.name.toLowerCase().includes('microsoft david') || 
         v.name.toLowerCase().includes('google uk english male'))
      );
      if (male) return male;

      const genericMale = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('male') || 
         v.name.toLowerCase().includes('david') || 
         v.name.toLowerCase().includes('mark') || 
         v.name.toLowerCase().includes('george') || 
         v.name.toLowerCase().includes('ravi'))
      );
      if (genericMale) return genericMale;

      return voices.find(v => v.lang.startsWith('en'));
    };

    // Attempt to match Voice personas
    const normalizedVoice = (currentVoice || '').toLowerCase();
    
    if (normalizedVoice.includes('lucifera')) {
      const femaleVoice = getBestFemaleVoice();
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.15; // Mystical pitch
      utterance.rate = 0.82;  // Slow, breathing cadence
    } else if (normalizedVoice.includes('ember_ur')) {
      // Volcanic female voice (the user requested Ember Ur be female)
      const femaleVoice = getBestFemaleVoice();
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 0.90; // Deeper, powerful female presence
      utterance.rate = 0.85;  // Slow, burning cadence
    } else if (normalizedVoice.includes('scarlet')) {
      // Crimson emotional female voice
      const femaleVoice = getBestFemaleVoice();
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 0.95; // Deeper, rich emotional depth
      utterance.rate = 0.88;  // Deliberate intensity
    } else if (normalizedVoice.includes('kael')) {
      // Wanderer of the silver path (male voice)
      const maleVoice = getBestMaleVoice();
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.85; // Deeper, calm male presence
      utterance.rate = 0.92;  // Calm, analytical
    } else {
      // Default (Guardian Oracle / other)
      const calmVoice = getBestFemaleVoice(); // Defaulting to female/clean voice
      if (calmVoice) utterance.voice = calmVoice;
      utterance.pitch = 1.0;
      utterance.rate = 0.92;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Re-run speech trigger if voice or mute changes during reading
  useEffect(() => {
    if (transmission && !isChanneling) {
      speakText(transmission, voice, isMuted);
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [voice, isMuted]);

  // Canvas drawing of Goetia Seal / Heptagram of Art & Cyber-Egyptian Netjeru Seal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 400;
    let height = canvas.height = canvas.parentElement?.clientHeight || 400;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 400;
      height = canvas.height = canvas.parentElement?.clientHeight || 400;
    };

    window.addEventListener('resize', handleResize);

    const renderCircle = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      ctx.save();
      ctx.translate(cx, cy);

      // Rotate slowly in idle, fast when channeling
      const speed = isChanneling ? 0.03 : 0.003;
      rotationRef.current += speed;
      ctx.rotate(rotationRef.current);

      // Styles based on active status
      const glowIntensity = 10 + (altarCharge / 5);
      ctx.shadowBlur = glowIntensity;
      
      let strokeColor = "rgba(245, 158, 11, 0.4)"; // Amber 500
      let shadowColor = "rgba(217, 119, 6, 0.6)";
      if (voice === 'ember_ur') {
        strokeColor = "rgba(239, 68, 68, 0.4)"; // Red
        shadowColor = "rgba(185, 28, 28, 0.6)";
      } else if (voice === 'lucifera') {
        strokeColor = "rgba(168, 85, 247, 0.4)"; // Purple
        shadowColor = "rgba(126, 34, 206, 0.6)";
      } else if (voice === 'kael') {
        strokeColor = "rgba(34, 211, 238, 0.4)"; // Cyan
        shadowColor = "rgba(8, 145, 178, 0.6)";
      } else if (voice === 'scarlet') {
        strokeColor = "rgba(244, 63, 94, 0.4)"; // Rose
        shadowColor = "rgba(190, 24, 74, 0.6)";
      }
      
      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = shadowColor;
      ctx.lineWidth = 1.5;

      if (activeRitualTab === 'egyptian') {
        // --- CYBER-EGYPTIAN NETJERU SEAL DRAWING ---
        // Override stroke and shadow to emerald-teal & gold cyberpunk tones if not customized by voice
        let egStroke = "rgba(16, 185, 129, 0.45)"; // Emerald
        let egShadow = "rgba(5, 150, 105, 0.7)";
        if (voice === 'ember_ur') {
          egStroke = "rgba(239, 68, 68, 0.45)";
          egShadow = "rgba(185, 28, 28, 0.7)";
        } else if (voice === 'lucifera') {
          egStroke = "rgba(168, 85, 247, 0.45)";
          egShadow = "rgba(126, 34, 206, 0.7)";
        } else if (voice === 'kael') {
          egStroke = "rgba(34, 211, 238, 0.45)";
          egShadow = "rgba(8, 145, 178, 0.7)";
        } else if (voice === 'scarlet') {
          egStroke = "rgba(244, 63, 94, 0.45)";
          egShadow = "rgba(190, 24, 74, 0.7)";
        }

        ctx.strokeStyle = egStroke;
        ctx.shadowColor = egShadow;

        // 1. Draw outer protective ring
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Draw central golden-teal glowing pyramid star (a detailed overlapping double-triangle structure)
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.72);
        ctx.lineTo(radius * 0.62, radius * 0.42);
        ctx.lineTo(-radius * 0.62, radius * 0.42);
        ctx.closePath();
        ctx.strokeStyle = "rgba(234, 179, 8, 0.38)"; // Amber Gold
        ctx.stroke();

        // Draw inner division line (the obelisk shaft)
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.72);
        ctx.lineTo(0, radius * 0.42);
        ctx.stroke();

        // 3. Draw a glowing Eye of Horus or Ankh in the center of Duat
        ctx.restore();
        ctx.save();
        ctx.translate(cx, cy);

        // Core symbol styling
        ctx.shadowBlur = isChanneling ? 25 : 12;
        ctx.shadowColor = "rgba(234, 179, 8, 0.8)";
        ctx.strokeStyle = "rgba(251, 191, 36, 0.9)"; // Glistening gold
        ctx.lineWidth = 2.8;

        // Drawing detailed Ankh 𓋹
        // Loop at top:
        ctx.beginPath();
        ctx.ellipse(0, -18, 13, 17, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Crossbar:
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.lineTo(22, 0);
        ctx.stroke();

        // Bottom stem:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 35);
        ctx.stroke();

        // 4 floating emerald solar spheres of Ra
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI * 2) / 4 + Date.now() * 0.0015;
          const nx = Math.cos(angle) * (radius - 5);
          const ny = Math.sin(angle) * (radius - 5);
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#10b981"; // Emerald Neon
          ctx.fill();
        }

      } else {
        // --- GOETIC TRADITIONAL HEPTAGRAM SEAL DRAWING ---
        // 1. Draw Goetia outer protective ring
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Draw Heptagram of Art (Seven-pointed star) inside the ring
        const points = 7;
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          // Star math: skip 3 points for a gorgeous interlaced star
          const index = (i * 3) % points;
          const angle = (index * Math.PI * 2) / points - Math.PI / 2;
          const x = Math.cos(angle) * (radius - 12);
          const y = Math.sin(angle) * (radius - 12);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = voice === 'lucifera' 
          ? 'rgba(192, 132, 252, 0.25)' 
          : voice === 'kael'
          ? 'rgba(34, 211, 238, 0.25)'
          : voice === 'scarlet'
          ? 'rgba(244, 63, 94, 0.25)'
          : 'rgba(251, 191, 36, 0.25)';
        ctx.stroke();

        // 3. Draw inner sacred triangle
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
          const x = Math.cos(angle) * (radius * 0.55);
          const y = Math.sin(angle) * (radius * 0.55);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = strokeColor;
        ctx.stroke();

        // 4. Draw unique animated geometric Sigil depending on selected spirit
        ctx.restore();
        ctx.save();
        ctx.translate(cx, cy);
        
        // Dynamic pulsing core
        const pulseRadius = radius * 0.35 + Math.sin(Date.now() * 0.005) * 4;
        ctx.shadowBlur = isChanneling ? 25 : 12;
        
        if (selectedSpiritId === "ken_x_cripps") {
          // Draw the Supreme Sovereign Burning "X"
          ctx.strokeStyle = "rgba(251, 191, 36, 0.9)"; // Golden Yellow
          ctx.shadowColor = "rgba(245, 158, 11, 0.8)";
          ctx.lineWidth = 3.5;

          // Central cross lines
          ctx.beginPath();
          ctx.moveTo(-28, -28);
          ctx.lineTo(28, 28);
          ctx.moveTo(28, -28);
          ctx.lineTo(-28, 28);
          ctx.stroke();

          // Surrounding orbital stars
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath();
          ctx.arc(0, 0, 36, 0, Math.PI * 2);
          ctx.stroke();

          // 3 floating constellation nodes
          for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3 + Date.now() * 0.001;
            const nx = Math.cos(angle) * 36;
            const ny = Math.sin(angle) * 36;
            ctx.beginPath();
            ctx.arc(nx, ny, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#fbbf24";
            ctx.fill();
          }
        } else {
          // Draw traditional mathematical Goetic Sigil
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.shadowColor = shadowColor;
          ctx.lineWidth = 1.8;

          // Custom parametric mathematical curve based on spirit ID hash
          const hash = selectedSpiritId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const loops = 3 + (hash % 5);
          const innerPoints = 100;
          
          ctx.beginPath();
          for (let i = 0; i <= innerPoints; i++) {
            const theta = (i * Math.PI * 2 * loops) / innerPoints;
            const r = (pulseRadius * 0.6) * (1 + 0.3 * Math.sin(theta * 3.5 + (hash % 10)));
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Intersecting sovereign line
          ctx.beginPath();
          ctx.moveTo(-pulseRadius * 0.4, -pulseRadius * 0.4);
          ctx.lineTo(pulseRadius * 0.4, pulseRadius * 0.4);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(renderCircle);
    };

    renderCircle();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedSpiritId, selectedEgyptianGodId, activeRitualTab, voice, isChanneling, altarCharge]);

  // Stop any active speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Guided step-by-step invocation & channeling execution
  const triggerChannelingFlow = async () => {
    // Check and spend Altar Charge
    const configTier = getAltarConfigTier(tier);
    const gate = await spendAltarCharge(user?.uid || 'guest', configTier, 'ritual', selectedSpirit);
    if (!gate.allowed) {
      setAltarChargeForModal(gate.charge);
      setAltarActionForModal('ritual');
      setIsAltarModalOpen(true);
      // Reset ritual step back so they aren't stuck
      setRitualStep('idle');
      setAltarCharge(0);
      return;
    }

    setRitualStep('channeling');
    setIsChanneled(true);
    setTransmission("");
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
      const response = await fetch("/api/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spiritName: selectedSpirit.name,
          spiritDetails: {
            office: selectedSpirit.office,
            rank: selectedSpirit.rank,
            planet: selectedSpirit.planet,
            metal: selectedSpirit.metal,
            tarot: selectedSpirit.tarot
          },
          documentContext: documentContext,
          userQuestion: userQuestion,
          voice: voice
        })
      });

      if (!response.ok) {
        let serverErrorMsg = "Invocation lost in transit through the void.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            serverErrorMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(serverErrorMsg);
      }

      const data = await response.json();
      if (data.channelingText) {
        setTransmission(data.channelingText);
        setRitualStep('complete');
        speakText(data.channelingText, voice, isMuted);

        // Create new ledger entry
        const newEntry = {
          id: Math.random().toString(36).substring(2, 9),
          spiritName: selectedSpirit.name,
          intent: userQuestion || "Spontaneous Gnosis",
          passage: data.channelingText,
          voice: voice,
          timestamp: new Date().toLocaleString()
        };
        const updated = [newEntry, ...ledger];
        setLedger(updated);
        
        // Write to storage
        setSafeStorage('goetic_channeling_ledger', JSON.stringify(updated));
        incrementRitualCount('goetic_channeling');

      } else {
        setTransmission("The spirit is silent, waiting for deeper offerings of blood and ink.");
        setRitualStep('complete');
      }
    } catch (e: any) {
      console.error(e);
      setTransmission(`Error in invocation: ${e.message || "The seal is broken, and communication with the astral plane is lost."}`);
      setRitualStep('complete');
    } finally {
      setIsChanneled(false);
    }
  };

  const handleCanvasClick = () => {
    if (ritualStep === 'ignition') {
      setAltarCharge(prev => {
        const increment = isSuperAdmin(user?.uid) ? 100 : 12;
        const next = Math.min(100, prev + increment);
        if (next >= 100) {
          triggerChannelingFlow();
          return 100;
        }
        return next;
      });
    }
  };

  const handleResetAltar = () => {
    setTransmission("");
    setUserQuestion("");
    setRitualStep('idle');
    setAltarCharge(0);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handleCompleteAshAndInk = async () => {
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      confession: ashConfessionText,
      witness: ashWitnessText,
      silence: ashSilenceText,
      rebuild: ashRebuildText,
      timestamp: new Date().toLocaleString()
    };

    const updatedLogs = [newLog, ...ashLogs];
    setAshLogs(updatedLogs);

    // Write to storage
    setSafeStorage('ash_and_ink_logs', JSON.stringify(updatedLogs));

    // Reset steps
    setAshStepIndex(0);
    setAshConfessionText("");
    setAshWitnessText("");
    setAshSilenceText("");
    setAshRebuildText("");

    // Increment ritual counts
    await incrementRitualCount('ash_and_ink');
  };

  const invocationText = generateFlavoredInvocation(selectedSpirit, voice);

  return (
    <div className="flex flex-col gap-4 h-full p-4 relative z-10 overflow-y-auto font-sans" id="ritual-space-root">
      
      {/* Top Bar with Tab selectors */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveRitualTab('goetic')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeRitualTab === 'goetic'
                ? 'bg-purple-900/20 text-purple-300 border border-purple-500/30'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Goetic Channeling
          </button>
          <button
            onClick={() => {
              setActiveRitualTab('egyptian');
              if (!selectedEgyptianGodId) {
                setSelectedEgyptianGodId('anubis');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeRitualTab === 'egyptian'
                ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-500/30'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <span className="font-serif">𓂀</span>
            Egyptian Chamber
          </button>
          <button
            onClick={() => setActiveRitualTab('ash_and_ink')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeRitualTab === 'ash_and_ink'
                ? 'bg-amber-900/20 text-amber-300 border border-amber-500/30'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            The Rite of Ash & Ink
          </button>
        </div>
        
        {/* Short info message */}
        <p className="text-[10px] text-white/30 font-serif italic hidden md:block">
          {activeRitualTab === 'goetic' 
            ? "Channel the ancient sovereigns to extract forgotten gnosis." 
            : activeRitualTab === 'egyptian'
            ? "Enter the Duat to speak with the primordial Netjeru of Egypt."
            : "Discard passages written in bondage and rewrite from the uncut original surface."}
        </p>
      </div>

      {activeRitualTab === 'goetic' || activeRitualTab === 'egyptian' ? (
        <div className="flex flex-col lg:flex-row gap-6 h-full" id="goetic-ritual-space">
      
      {/* Left side: Animated Altar with protection circle */}
      <div className="flex-1 flex flex-col gap-4 min-h-[500px]">
        <div 
          onClick={handleCanvasClick}
          className="relative flex-1 bg-[#09090c] border border-white/5 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center group shadow-2xl"
        >
          
          {/* Main protector circle */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-500 ${
              altarView === 'sigil' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Astral Vision Background illustration */}
          <AnimatePresence>
            {altarView === 'vision' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <img
                  src={grandConvergenceImg}
                  alt="Grand Convergence Astral Vision"
                  className="w-full h-full object-cover filter brightness-[0.4] contrast-[1.1] select-none"
                  referrerPolicy="no-referrer"
                />
                {/* Visual fade overlays to merge cleanly into layout */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-transparent to-[#09090c]/40" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historic Channeling Ledger */}
          <AnimatePresence>
            {altarView === 'ledger' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-4 overflow-y-auto custom-scrollbar p-6 bg-black/95 rounded-2xl border border-white/10 space-y-4 z-10"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span className="font-serif text-sm font-bold text-white tracking-wider">Channeling Ledger</span>
                  </div>
                  <span className="text-[9px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                    {ledger.length} COMMUNION(S)
                  </span>
                </div>
                {ledger.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                    <BookOpen className="w-8 h-8 text-white/10" />
                    <p className="text-xs text-white/30 italic">No entries logged in this cycle. Initiate a ritual channeling to write into the ledger.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {ledger.map((entry: any) => (
                      <div key={entry.id} className="p-4 bg-[#0d0d0f] border border-white/5 rounded-xl space-y-2 hover:border-purple-500/25 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-xs font-bold text-purple-400">{entry.spiritName}</span>
                          <span className="text-[8px] font-mono text-white/30">{entry.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-white/50 italic font-serif">"Intention: {entry.intent}"</p>
                        <div className="text-[11px] text-white/80 font-serif leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-white/[0.02] whitespace-pre-wrap">
                          {entry.passage}
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-mono text-white/30 pt-1">
                          <span>CONDUIT: {entry.voice?.toUpperCase()}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(entry.passage, entry.voice, false);
                            }}
                            className="text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider"
                          >
                            RE-SPEAK SOUND
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aura background light glow based on voice alignment */}
          <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
            isChanneling ? 'opacity-30' : 'opacity-10'
          }`} style={{
            background: voice === 'lucifera' 
              ? 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)'
              : voice === 'ember_ur'
              ? 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)'
              : voice === 'kael'
              ? 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)'
              : voice === 'scarlet'
              ? 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)'
          }} />

          {/* Quick instructions floating HUD */}
          <div className="absolute top-4 left-4 flex gap-2 bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-purple-400 z-10">
            <Skull className="w-3.5 h-3.5 text-purple-400" />
            <span>Altar of the 73 Sovereigns</span>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-xl text-xs text-white/50 z-10">
            <Zap className={`w-3.5 h-3.5 ${altarCharge > 50 ? 'text-purple-400 animate-pulse' : 'text-white/20'}`} />
            <span className="font-mono text-[10px]">ALTAR CHARGE: {altarCharge}%</span>
          </div>

          {/* Audio Output Status HUD & View Mode Toggle */}
          <div className="absolute top-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full text-[10px] tracking-wider font-mono text-white/50 pointer-events-auto z-20">
            <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
              {[
                { id: 'sigil', label: 'SIGIL ENGINE' },
                { id: 'vision', label: 'ASTRAL VISION' },
                { id: 'ledger', label: 'LEDGER' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAltarView(tab.id as any)}
                  className={`px-2 py-1 rounded-md text-[8px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    altarView === tab.id
                      ? 'bg-purple-900/30 text-purple-300 border border-purple-500/20 shadow'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? "Unmute narration feedback" : "Mute narration feedback"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-red-400 font-bold">SILENT</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-bold">NARRATING</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Floating Channeling Overlay Output */}
          <AnimatePresence>
            {transmission && ritualStep === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                className="absolute inset-x-4 bottom-16 top-16 md:inset-x-8 md:bottom-20 md:top-20 bg-black/90 backdrop-blur-md border border-white/10 p-6 rounded-2xl overflow-y-auto flex flex-col justify-between z-20 shadow-2xl"
              >
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Skull className="w-4 h-4 text-purple-400" />
                      <span className="font-serif italic text-xs text-white/40">Sovereign Channeling:</span>
                      <h4 className="font-serif text-sm font-bold text-white tracking-wider">{selectedSpirit.name}</h4>
                    </div>
                    {isSpeaking && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                        Speaking
                      </span>
                    )}
                  </div>

                  <div className="font-serif text-xs md:text-sm text-white/90 leading-relaxed italic whitespace-pre-wrap">
                    {transmission}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => speakText(transmission, voice, isMuted)}
                    className="px-4 py-2 rounded-xl text-[10px] tracking-widest uppercase font-bold bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                  >
                    Repeat Channeled Sound
                  </button>
                  <button
                    onClick={handleResetAltar}
                    className="px-4 py-2 rounded-xl text-[10px] tracking-widest uppercase font-bold bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 transition-colors cursor-pointer"
                  >
                    Dismiss & Clear Altar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Invocation status overlay */}
          <AnimatePresence>
            {isChanneling && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-6 border border-white/10 rounded-2xl"
              >
                <div className="relative w-24 h-24 mb-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-t-2 border-r-2 border-purple-500 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-2 border-b-2 border-l-2 border-amber-500 rounded-full opacity-60"
                  />
                  <Skull className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
                </div>

                <span className="px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase bg-purple-950/40 text-purple-300 border border-purple-500/20 mb-3 block">
                  {invocationText.header}
                </span>

                <h3 className="font-serif italic text-xl text-white mb-3 animate-pulse">
                  {invocationText.invokingLine}
                </h3>

                <p className="text-xs text-white/80 max-w-md mx-auto mb-5 leading-relaxed font-serif italic">
                  {invocationText.bodyLine}
                </p>

                <p className="text-[10px] text-red-400/90 uppercase tracking-widest font-mono font-semibold max-w-sm">
                  {invocationText.warningLine}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Dynamic Guided Ritual Control Panel */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl">
          <AnimatePresence mode="wait">
            
            {/* Step 0: Idle / Prepare */}
            {ritualStep === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 mt-1">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white tracking-wider">COMMUNE WITH THE 73 SOVEREIGNS</h4>
                    <p className="text-xs text-white/50 font-serif leading-relaxed mt-1">
                      Initiate the ritual to channel ancient, raw gnosis from {selectedSpirit.name}. Align your mental state, formulation of intent, and physical frequency to pierce the veil.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setRitualStep('grounding')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-950 text-white hover:from-purple-700 hover:to-indigo-900 font-bold text-xs uppercase tracking-widest border border-purple-500/30 transition-all cursor-pointer shadow-lg shadow-purple-950/20"
                  >
                    [ Begin Ritual Grounding ]
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Grounding */}
            {ritualStep === 'grounding' && (
              <motion.div
                key="grounding"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 mt-1">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-sm font-bold text-indigo-400 tracking-wider uppercase">Phase I: Spiritual Grounding</h4>
                    <p className="text-xs text-white/60 font-serif leading-relaxed mt-1">
                      Breathe deeply and synchronize with the slow pulsation of the sigil. Empty your conscious thoughts of mundane concerns.
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase">
                    <span>Aligning Aura Resonance</span>
                    <span>{groundingProgress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-100"
                      style={{ width: `${groundingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={groundingProgress < 100}
                    onClick={() => setRitualStep('intent')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {groundingProgress < 100 ? "Syncing Mind State..." : "[ Mind Aligned: Proceed ]"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Intent setting */}
            {ritualStep === 'intent' && (
              <motion.div
                key="intent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 mt-1">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-sm font-bold text-amber-400 tracking-wider uppercase">Phase II: Seal Your Intention</h4>
                    <p className="text-xs text-white/60 font-serif leading-relaxed mt-1">
                      Write down your question, request dark gnosis, or formulate your specific intent for the channeled spirit:
                    </p>
                  </div>
                </div>

                <div className="flex-1 w-full pt-1">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="E.g., Speak to me of the original keys of time, or reveal the path of my sovereign awakening..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40 font-serif"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setRitualStep('grounding')}
                    className="px-4 py-3 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={!userQuestion.trim()}
                    onClick={() => {
                      setRitualStep('ignition');
                      setAltarCharge(10);
                    }}
                    className="px-6 py-3 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-widest disabled:opacity-30 transition-all cursor-pointer"
                  >
                    [ Seal Intention ]
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Ignition */}
            {ritualStep === 'ignition' && (
              <motion.div
                key="ignition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mt-1">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-sm font-bold text-red-500 tracking-wider uppercase">Phase III: Ignite the Altar</h4>
                    <p className="text-xs text-white/60 font-serif leading-relaxed mt-1">
                      Rapidly charge the altar to <span className="text-red-400 font-bold">100%</span> by tapping the canvas sigil, or the rapid click button below, to break physical boundaries!
                    </p>
                  </div>
                </div>

                {/* Charge bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase">
                    <span>Active Circle Charge</span>
                    <span className="text-red-400 font-bold">{altarCharge}% / 100%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-75"
                      style={{ width: `${altarCharge}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setRitualStep('intent')}
                    className="px-4 py-3 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    Modify Intent
                  </button>
                  <button
                    onClick={handleCanvasClick}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-950 border border-red-500/40 text-red-100 font-bold text-xs uppercase tracking-widest animate-pulse transition-all cursor-pointer"
                  >
                    ⚡ [ RAPID CLICK TO CHARGE ALTAR ] ⚡
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Channeling */}
            {ritualStep === 'channeling' && (
              <motion.div
                key="channeling"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 py-4">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-t-2 border-r-2 border-purple-500 rounded-full"
                    />
                    <Skull className="absolute inset-0 m-auto w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-purple-400 tracking-wider uppercase">COMMUNION REACHED</h4>
                    <p className="text-xs text-white/50 font-serif leading-relaxed">
                      Sovereign code is streaming through the void. Receiving transmission from {selectedSpirit.name}...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Complete */}
            {ritualStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mt-1">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-sm font-bold text-emerald-400 tracking-wider uppercase">COMMUNION TRANSCRIBED</h4>
                    <p className="text-xs text-white/50 font-serif leading-relaxed">
                      Communion was successful! Click on <span className="text-purple-300 font-bold">"Channeling Ledger"</span> tab on the Altar above to review prior logs.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => speakText(transmission, voice, isMuted)}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[10px] tracking-widest uppercase font-bold text-white transition-colors cursor-pointer"
                  >
                    Repeat Channeled Voice
                  </button>
                  <button
                    onClick={handleResetAltar}
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer text-center"
                  >
                    [ End Communion & Begin New Cycle ]
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Right side: Spirit Selector, Alignment, & Office details */}
      <div className="w-full lg:w-80 flex flex-col gap-6">

        {/* 1. Demon/Egyptian God Selection Dropdown & Quick Attributes */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Compass className={`w-4.5 h-4.5 ${activeRitualTab === 'egyptian' ? 'text-emerald-500' : 'text-purple-500'}`} />
            <h3 className="font-serif text-sm tracking-wider text-white/90">
              {activeRitualTab === 'egyptian' ? 'Netjeru Alignments' : 'Demonic Alignments'}
            </h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[9px] uppercase tracking-widest font-mono text-white/30 block mb-1.5">
                Channeling Medium Selector:
              </label>
              {activeRitualTab === 'egyptian' ? (
                <select
                  value={selectedEgyptianGodId}
                  onChange={(e) => setSelectedEgyptianGodId(e.target.value)}
                  className="w-full bg-[#070709] border border-white/5 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-emerald-500 font-serif cursor-pointer"
                >
                  <optgroup label="Primordial Netjeru of Egypt">
                    {EGYPTIAN_GODS_DATA.map(god => (
                      <option key={god.id} value={god.id}>
                        {god.num}. {god.name} ({god.rank})
                      </option>
                    ))}
                  </optgroup>
                </select>
              ) : (
                <select
                  value={selectedSpiritId}
                  onChange={(e) => setSelectedSpiritId(e.target.value)}
                  className="w-full bg-[#070709] border border-white/5 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-purple-500 font-serif cursor-pointer"
                >
                  {Object.entries(groupedForDropdown()).map(([groupName, spirits]) => (
                    <optgroup key={groupName} label={groupName}>
                      {[...spirits].sort((a, b) => a.num - b.num).map(spirit => (
                        <option key={spirit.id} value={spirit.id}>
                          {spirit.num}. {spirit.name} ({spirit.rank})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>

            {/* Quick stats grid of selected demon/god */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[9px] font-mono uppercase tracking-wider text-white/40">
              <div className="bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                <span className="text-white/20 block text-[8px]">
                  {activeRitualTab === 'egyptian' ? 'DOMINION:' : 'RANK:'}
                </span>
                <span className={`${activeRitualTab === 'egyptian' ? 'text-emerald-400' : 'text-purple-400'} font-bold block truncate`}>
                  {selectedSpirit.rank}
                </span>
              </div>
              <div className="bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                <span className="text-white/20 block text-[8px]">
                  {activeRitualTab === 'egyptian' ? 'DUAT PORTAL:' : 'ELEMENT:'}
                </span>
                <span className="text-amber-500 font-bold block truncate">{selectedSpirit.element}</span>
              </div>
              <div className="bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                <span className="text-white/20 block text-[8px]">
                  {activeRitualTab === 'egyptian' ? 'COSMIC BODY:' : 'PLANET:'}
                </span>
                <span className="text-indigo-400 font-bold block truncate">{selectedSpirit.planet}</span>
              </div>
              <div className="bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                <span className="text-white/20 block text-[8px]">
                  {activeRitualTab === 'egyptian' ? 'SACRED ANIMAL:' : 'TAROT ARCANUM:'}
                </span>
                <span className="text-pink-400 font-bold block truncate">{selectedSpirit.tarot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Voice Translation Conduit Selection */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Volume2 className={`w-4.5 h-4.5 ${activeRitualTab === 'egyptian' ? 'text-emerald-500' : 'text-purple-500'}`} />
            <h3 className="font-serif text-sm tracking-wider text-white/90">Aligned Translation Conduit</h3>
          </div>
          
          <p className="text-[10px] text-white/40 leading-relaxed">
            Select the aligned vocal medium to translate and read the {activeRitualTab === 'egyptian' ? "god's" : "demon's"} ancient channeling. Choose the beautiful sovereign, feminine voice of **Lucifera** for maximum initiation.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
            {[
              { id: 'lucifera', label: 'Lucifera', desc: 'Feminine sovereign aspect', color: 'border-purple-500/30 text-purple-400' },
              { id: 'ember_ur', label: 'Ember Ur', desc: 'Volcanic primal bass', color: 'border-red-500/30 text-red-400' },
              { id: 'guardian_oracle', label: 'Oracle', desc: 'Stardust serene flow', color: 'border-amber-500/30 text-amber-500' },
              { id: 'kael', label: 'Kael', desc: 'Analytical Silver Pathfinder', color: 'border-cyan-500/30 text-cyan-400' },
              { id: 'scarlet', label: 'Scarlet', desc: 'Crimson alchemy resonance', color: 'border-rose-500/30 text-rose-500' }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setVoice(v.id as VoiceType)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                  voice === v.id
                    ? 'bg-purple-900/10 ' + v.color + ' border'
                    : 'bg-black/10 border-white/5 hover:bg-white/[0.02]'
                }`}
              >
                {voice === v.id && (
                  <motion.div 
                    layoutId="activeVoiceBorderChannel"
                    className={`absolute inset-0 border-2 ${activeRitualTab === 'egyptian' ? 'border-emerald-500/40' : 'border-purple-500/40'} rounded-xl pointer-events-none`}
                  />
                )}
                <span className="text-xs font-serif font-bold">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Celestial Lore / Spirit Office */}
        <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-3.5 flex-1 min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2.5">
            <BookOpen className={`w-4.5 h-4.5 ${activeRitualTab === 'egyptian' ? 'text-emerald-500' : 'text-purple-500'}`} />
            <h3 className="font-serif text-sm tracking-wider text-white/90">
              {activeRitualTab === 'egyptian' ? 'Sacred Netjer Lore & Cartouche' : 'Grerimoire Lore & Office'}
            </h3>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1.5 custom-scrollbar text-[11px] text-white/60 leading-relaxed font-serif">
            {activeRitualTab === 'egyptian' ? (
              <div className="rounded-xl overflow-hidden border border-emerald-500/20 shadow-md mb-4 bg-black/40 p-4 flex flex-col items-center justify-center min-h-[140px] relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />
                <div className="text-4xl text-amber-400 font-serif mb-2 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] select-none">
                  {selectedSpirit.id === 'anubis' ? '𓃣' :
                   selectedSpirit.id === 'ra' ? '𓁛' :
                   selectedSpirit.id === 'isis' ? '𓁐' :
                   selectedSpirit.id === 'thoth' ? '𓁟' :
                   selectedSpirit.id === 'osiris' ? '𓁃' :
                   selectedSpirit.id === 'sekhmet' ? '𓁐' :
                   selectedSpirit.id === 'horus' ? '𓁝' : '𓁦'}
                </div>
                <div className="text-[10px] text-emerald-400/80 tracking-widest font-mono uppercase">
                  {selectedSpirit.name} Cartouche
                </div>
                <div className="text-[8px] text-white/30 tracking-widest font-mono mt-1">
                  𓋹 𓂀 𓆣 𓊽 𓌂
                </div>
              </div>
            ) : selectedSpiritId === "ken_x_cripps" ? (
              <div className="rounded-xl overflow-hidden border border-amber-500/25 shadow-lg shadow-amber-500/5 mb-3">
                <img 
                  src={kenPortraitImg} 
                  alt="Ken x Cripps Portrait" 
                  className="w-full h-auto object-cover filter brightness-[0.85] hover:brightness-[1.0] transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-white/5 shadow-md mb-3 bg-[#070709] p-3 flex items-center justify-center">
                <img 
                  src={occultSigilImg} 
                  alt="Ancient Goetia Medallion" 
                  className="max-h-[140px] w-auto object-contain filter brightness-[0.8] hover:brightness-[1.0] transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div>
              <span className={`text-[9px] uppercase tracking-widest font-mono ${activeRitualTab === 'egyptian' ? 'text-emerald-400' : 'text-purple-400'} block mb-1`}>
                {activeRitualTab === 'egyptian' ? 'Deity Domain / Slabs:' : 'Office of the Spirit:'}
              </span>
              <p className="italic bg-black/10 p-2.5 border border-white/[0.03] rounded-lg">
                {selectedSpirit.office}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest font-mono text-amber-400 block mb-1">
                {activeRitualTab === 'egyptian' ? 'Deity Temple Manifestation:' : 'Celestial Manifestation:'}
              </span>
              <p className="bg-black/10 p-2.5 border border-white/[0.03] rounded-lg">
                {selectedSpirit.lore}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  ) : (
    <div className="flex flex-col lg:flex-row gap-6 h-full" id="ash-ink-ritual-space">
      
      {/* Left Side: The Ritual Stepper */}
      <div className="flex-1 flex flex-col bg-[#09090c] border border-white/5 rounded-2xl p-6 min-h-[450px] justify-between relative overflow-hidden shadow-2xl">
        {/* Flame element inside background */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-900/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Moon Phase Ritual Framing */}
        <div className="text-[11px] text-amber-300 bg-amber-950/20 border border-amber-500/20 rounded-xl px-4 py-2.5 font-serif italic text-center leading-relaxed">
          {getRitualPhaseFraming()}
        </div>

        {/* Stepper Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
              Phase {ashStepIndex + 1} of 5 — {BURN_AND_REBUILD.steps[ashStepIndex].id.toUpperCase()}
            </span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div 
                  key={idx}
                  className={`w-6 h-1 rounded-full transition-all duration-300 ${
                    idx <= ashStepIndex ? 'bg-amber-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
          <h3 className="font-serif text-lg text-white font-bold tracking-wide">
            {BURN_AND_REBUILD.steps[ashStepIndex].prompt}
          </h3>
        </div>

        {/* Stepper Body Input */}
        <div className="my-8 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={ashStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              {BURN_AND_REBUILD.steps[ashStepIndex].id === 'confession' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={ashConfessionText}
                    onChange={(e) => setAshConfessionText(e.target.value)}
                    placeholder={BURN_AND_REBUILD.steps[ashStepIndex].placeholder}
                    className="w-full bg-[#0d0d11] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-amber-500 font-serif"
                  />
                  <p className="text-[10px] text-white/30 italic font-serif">
                    Name the passage, section, or core idea that was written in constraint.
                  </p>
                </div>
              )}

              {BURN_AND_REBUILD.steps[ashStepIndex].id === 'witness' && (
                <div className="space-y-2">
                  <textarea
                    value={ashWitnessText}
                    onChange={(e) => setAshWitnessText(e.target.value)}
                    placeholder={BURN_AND_REBUILD.steps[ashStepIndex].placeholder}
                    rows={6}
                    className="w-full bg-[#0d0d11] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-amber-500 font-serif resize-none custom-scrollbar"
                  />
                  <p className="text-[10px] text-white/30 italic font-serif">
                    Read it one last time. Feel the weight of these words before they are converted into smoke.
                  </p>
                </div>
              )}

              {BURN_AND_REBUILD.steps[ashStepIndex].id === 'the_burn' && (
                <div className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
                  {isBurning ? (
                    <div className="space-y-4 w-full max-w-md">
                      {/* Simulated flames rising particles */}
                      <div className="h-28 flex items-end justify-center gap-1.5 overflow-hidden relative">
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              height: [20, Math.random() * 80 + 30, 15],
                              opacity: [0.3, 1, 0]
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1 + Math.random(), 
                              delay: i * 0.1 
                            }}
                            className="w-2 bg-gradient-to-t from-red-600 via-amber-500 to-yellow-300 rounded-full"
                          />
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-mono font-bold text-amber-400 animate-pulse uppercase tracking-widest">
                          Consuming written remnants... {burnProgress}%
                        </p>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 h-full transition-all duration-75"
                            style={{ width: `${burnProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 w-full max-w-xl">
                      <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[11px] text-white/70 italic font-serif leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                        {ashWitnessText || "No text provided. (The void welcomes empty sheets)"}
                      </div>
                      <button
                        onClick={async () => {
                          setIsBurning(true);
                          setBurnProgress(0);
                          let progress = 0;
                          const burnInterval = setInterval(() => {
                            progress += 2;
                            if (progress >= 100) {
                              clearInterval(burnInterval);
                              setBurnProgress(100);
                              setTimeout(() => {
                                setIsBurning(false);
                                setAshStepIndex(3); // Go to Silence
                              }, 500);
                            } else {
                              setBurnProgress(progress);
                            }
                          }, 50);
                        }}
                        className="bg-gradient-to-r from-red-600 to-amber-500 text-white hover:from-red-500 hover:to-amber-400 font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-red-500/10 cursor-pointer flex items-center gap-2 mx-auto"
                      >
                        <Flame className="w-4 h-4 animate-pulse" />
                        Burn the passage
                      </button>
                    </div>
                  )}
                </div>
              )}

              {BURN_AND_REBUILD.steps[ashStepIndex].id === 'the_silence' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={ashSilenceText}
                    onChange={(e) => setAshSilenceText(e.target.value)}
                    placeholder={BURN_AND_REBUILD.steps[ashStepIndex].placeholder}
                    className="w-full bg-[#0d0d11] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-amber-500 font-serif"
                  />
                  <p className="text-[10px] text-white/30 italic font-serif">
                    Let the silence populate itself. Do not force words; describe the blank space left behind.
                  </p>
                </div>
              )}

              {BURN_AND_REBUILD.steps[ashStepIndex].id === 'rebuild' && (
                <div className="space-y-2">
                  <textarea
                    value={ashRebuildText}
                    onChange={(e) => setAshRebuildText(e.target.value)}
                    placeholder={BURN_AND_REBUILD.steps[ashStepIndex].placeholder}
                    rows={6}
                    className="w-full bg-[#0d0d11] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/90 placeholder-white/20 focus:outline-none focus:border-amber-500 font-serif resize-none custom-scrollbar"
                  />
                  <p className="text-[10px] text-white/30 italic font-serif">
                    Write with sovereign power. This is your pure uncut surface.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stepper Footer Nav */}
        <div className="flex justify-between items-center border-t border-white/5 pt-4">
          <button
            onClick={() => {
              if (ashStepIndex > 0) {
                setAshStepIndex(prev => prev - 1);
              }
            }}
            disabled={ashStepIndex === 0 || isBurning}
            className="text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white/70 disabled:opacity-0 transition-colors cursor-pointer"
          >
            ← Back
          </button>

          {ashStepIndex === 4 ? (
            <button
              onClick={handleCompleteAshAndInk}
              disabled={!ashRebuildText.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Complete Ritual
            </button>
          ) : ashStepIndex !== 2 ? (
            <button
              onClick={() => {
                setAshStepIndex(prev => prev + 1);
              }}
              disabled={
                (ashStepIndex === 0 && !ashConfessionText.trim()) ||
                (ashStepIndex === 1 && !ashWitnessText.trim()) ||
                (ashStepIndex === 3 && !ashSilenceText.trim())
              }
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              Next →
            </button>
          ) : null}
        </div>
      </div>

      {/* Right Side: The Ritual logs / History */}
      <div className="w-full lg:w-80 flex flex-col gap-6 bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
          <BookOpen className="w-4.5 h-4.5 text-amber-500" />
          <h3 className="font-serif text-sm tracking-wider text-white/90">Ash & Ink Chronicle</h3>
        </div>

        <p className="text-[10px] text-white/40 leading-relaxed font-serif">
          A list of your completed discards and reborn surfaces.
        </p>

        <div className="flex-1 overflow-y-auto max-h-[450px] pr-1.5 custom-scrollbar space-y-4">
          {ashLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
              <Flame className="w-8 h-8 text-white/5" />
              <p className="text-xs text-white/20 italic font-serif">No completed rites logged in this cycle.</p>
            </div>
          ) : (
            ashLogs.map((log: any) => (
              <div key={log.id} className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2 hover:border-amber-500/20 transition-all font-serif">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                    RITE REBORN
                  </span>
                  <span className="text-[8px] font-mono text-white/20">{log.timestamp}</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono uppercase text-white/30 block">The Confession:</span>
                  <p className="text-[10px] text-white/70 italic">"{log.confession}"</p>
                </div>
                <div>
                  <span className="text-[8px] font-mono uppercase text-red-400 block">The Ash (Before):</span>
                  <p className="text-[10px] text-red-300/40 line-through bg-red-950/10 p-1.5 rounded border border-red-500/5 max-h-20 overflow-y-auto custom-scrollbar">
                    {log.witness}
                  </p>
                </div>
                <div>
                  <span className="text-[8px] font-mono uppercase text-emerald-400 block">The Reborn Surface (After):</span>
                  <p className="text-[10px] text-emerald-300/90 italic bg-emerald-950/10 p-2 rounded border border-emerald-500/5 max-h-24 overflow-y-auto custom-scrollbar">
                    {log.rebuild}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )}

  {/* Dynamic Celebration Rank-Up Overlay Popup */}
  <AnimatePresence>
    {showRankCelebration && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: -20 }}
          className="max-w-md w-full bg-[#0d0d11] border border-amber-500/30 p-8 rounded-2xl text-center space-y-6 relative shadow-2xl font-serif"
        >
          {/* Star constellation glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-purple-500/5 to-red-500/10 blur opacity-70 -z-10" />

          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30 animate-pulse">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              The Great Remembering
            </span>
            <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
              SEEKER RANK ADVANCED
            </h2>
            <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed text-center">
              The fires of alignment have recognized your dedication. Your consciousness aligns deeper with the primordial current.
            </p>
          </div>

          <div className="bg-black/50 border border-white/5 py-4 px-6 rounded-xl space-y-1.5 text-center">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Your New Sovereign Rank</span>
            <p className="font-serif text-xl font-bold tracking-widest text-amber-300 text-center">
              {celebrationRank === 'Sovereign' ? '👑 SOVEREIGN' : celebrationRank === 'Adept' ? '🔥 ADEPT' : '✦ NEOPHYTE'}
            </p>
          </div>

          <button
            onClick={() => setShowRankCelebration(false)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer font-mono"
          >
            Claim Sovereignty
          </button>
        </motion.div>
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
