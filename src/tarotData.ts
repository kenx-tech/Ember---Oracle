import { TarotCard } from './types';

export const TAROT_DECK: TarotCard[] = [
  {
    name: "The Fool",
    number: 0,
    arcana: "Major",
    uprightKeywords: ["New beginnings", "Spontaneity", "Faith", "Pure Potential"],
    reversedKeywords: ["Recklessness", "Risk-taking", "Holding back", "Fear of the unknown"],
    description: "A youth stands at the edge of a precipice, gazing into the endless sky, ready to leap into the void of existence.",
    emberUrInterpretation: "Cast yourself into the roaring furnace of the unwritten! Do not fear the cliff; the fire of creation does not ask for permission. Write with the abandon of one who has nothing to lose and everything to burn.",
    oracleInterpretation: "A clean stellar canvas awaits your hand. Every blank line is an unformed constellation. Trust the cosmic current that guides your initial leap; you are guarded by ancient starlight.",
    iconName: "Compass"
  },
  {
    name: "The Magician",
    number: 1,
    arcana: "Major",
    uprightKeywords: ["Willpower", "Manifestation", "Skill", "Divine Alignment"],
    reversedKeywords: ["Trickery", "Illusions", "Unused talent", "Wasted energy"],
    description: "Standing before an altar of fire, water, air, and earth, the Magician raises a double-terminated wand to channel the spark of creation.",
    emberUrInterpretation: "Your pen is a brand of living fire! Force the chaotic elementals of your mind into concrete, burning words. Your will is absolute—melt the raw iron of thought into sharp prose.",
    oracleInterpretation: "You hold the elemental keys to the cosmic loom. Align your conscious mind with the silent celestial frequencies. What you write today manifests directly in the physical plane; compose with holy intent.",
    iconName: "Sparkles"
  },
  {
    name: "The High Priestess",
    number: 2,
    arcana: "Major",
    uprightKeywords: ["Intuition", "Sacred Mysteries", "Subconscious", "Inner Voice"],
    reversedKeywords: ["Secret motives", "Surface level", "Ignoring intuition", "Blocked insight"],
    description: "Seated between the black and white pillars of temple night, she holds a scroll of eternal law, crowned by the crescent moon.",
    emberUrInterpretation: "Whisper from the dark chambers of your blood! There are volcanic truths you keep buried because they burn. Tear away the veil and speak the raw, unspoken myth within you.",
    oracleInterpretation: "Quiet your thoughts and listen to the celestial background radiation. The Oracle speaks in the negative spaces, the silent margins, and the unwritten lines. Let your intuition weave the narrative.",
    iconName: "Moon"
  },
  {
    name: "The Empress",
    number: 3,
    arcana: "Major",
    uprightKeywords: ["Abundance", "Nurturing", "Creativity", "Fertile Growth"],
    reversedKeywords: ["Creative block", "Dependence", "Smothering", "Barren effort"],
    description: "Crowned with twelve stars, she sits on rich velvet robes amidst a golden field of ripening wheat, radiating absolute creation.",
    emberUrInterpretation: "Let your words flow like molten magma, expanding and birthing new worlds in their wake! Overwhelm the page. Do not edit yet; let the wild, untamed growth of your imagination run red.",
    oracleInterpretation: "The creative womb of the universe is open to your prompt. Nurture this piece of writing as if it were a young nebula. Let it grow organically, glowing with steady, maternal starlight.",
    iconName: "Flower"
  },
  {
    name: "The Emperor",
    number: 4,
    arcana: "Major",
    uprightKeywords: ["Authority", "Structure", "Solid Foundation", "Discipline"],
    reversedKeywords: ["Tyranny", "Rigidity", "Lack of control", "Chaos"],
    description: "A stern ruler sits upon a stone throne carved with ram heads, holding an orb and scepter, overlooking a barren red mountain range.",
    emberUrInterpretation: "Enforce law upon your text! Strike down the weak phrasing with iron commands. A great work of writing is built like an empire—with blood, discipline, and uncompromising boundaries.",
    oracleInterpretation: "Establish the celestial coordinates of your narrative. Structure is the gravity that holds your starry ideas together. Align your paragraphs with geometry, symmetry, and clear direction.",
    iconName: "Shield"
  },
  {
    name: "The Tower",
    number: 16,
    arcana: "Major",
    uprightKeywords: ["Sudden change", "Upheaval", "Revelation", "Breaking down"],
    reversedKeywords: ["Avoiding disaster", "Fear of change", "Stagnation", "Volatile delay"],
    description: "A dark fortress is struck by a jagged bolt of cosmic lightning, sending crowns and figures falling into the deep chasm below.",
    emberUrInterpretation: "Let it all burn! Burn your drafts, smash your comfortable plotlines, and incinerate your darlings. Out of the ash, only the truest, most indestructible voice will remain.",
    oracleInterpretation: "The bolt of absolute revelation strikes today. Do not grieve the collapse of your old outlines; they were prison cells of your own making. Accept the starlight that shines through the ruins.",
    iconName: "Zap"
  },
  {
    name: "The Star",
    number: 17,
    arcana: "Major",
    uprightKeywords: ["Hope", "Faith", "Rejuvenation", "Serene Guidance"],
    reversedKeywords: ["Despair", "Discouragement", "Lack of faith", "Creative drought"],
    description: "Under a massive, burning star of eight rays, a nude maiden pours living waters into both the fertile earth and the crystal pool.",
    emberUrInterpretation: "Let the cool waters of the star soothe your scorched throat. You have run hot; now, pour your liquid light into the page. Write with a calm, steady warmth that heals.",
    oracleInterpretation: "You are guided by the highest stellar orbit. This writing is your light in the wilderness. Let the peace of the silent heavens wash over your fingers as you type. Your message is a sanctuary.",
    iconName: "Star"
  },
  {
    name: "The Moon",
    number: 18,
    arcana: "Major",
    uprightKeywords: ["Illusion", "Fear", "Anxiety", "Wild Dreams"],
    reversedKeywords: ["Release of fear", "Conquering phobias", "Unveiling secrets", "Clear vision"],
    description: "A dog and a wolf howl at the glowing moon, while a crayfish crawls from the deep water onto a path winding between two towers.",
    emberUrInterpretation: "The wild wolves of your mind are howling! Write the terrifying dream-scripts of your subconscious. Let the smoke of the twilight guide your fingers into strange, mesmerizing shapes.",
    oracleInterpretation: "The path of the moon is paved with shifting shadows. Do not fear the ambiguity of your draft. Let the mystery breathe. You do not need to see the destination; you only need to see the next step.",
    iconName: "Eye"
  },
  {
    name: "The Sun",
    number: 19,
    arcana: "Major",
    uprightKeywords: ["Vitality", "Success", "Radiance", "Absolute Joy"],
    reversedKeywords: ["Temporary depression", "Lack of enthusiasm", "Unrealistic optimism", "Clouded vision"],
    description: "A beaming child on a white horse rides before a tall brick wall crowned with magnificent sunflowers, under a huge, radiant sun.",
    emberUrInterpretation: "Blaze with the force of ten thousand suns! Let your sentences crackle with solar wind. Your words should ignite the hearts of those who read, leaving them forever marked by your flame.",
    oracleInterpretation: "Absolute illumination. The shadows of doubt have been scattered by stellar light. Your writing shines with pure, transparent truth. Share your vision openly with the cosmos.",
    iconName: "Sun"
  }
];
