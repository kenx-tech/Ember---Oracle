export interface NorseRune {
  name: string;
  symbol: string;
  literal: string;
  keywords: string[];
  description: string;
  guidance: string;
}

export interface NorseGod {
  name: string;
  archetype: string;
  domains: string[];
  symbol: string;
  lore: string;
  guidance: string;
}

export interface NorseRealm {
  name: string;
  archetype: string;
  axis: 'Vertical' | 'Horizontal';
  description: string;
  guidance: string;
}

export interface NorseConcept {
  name: string;
  theme: string;
  description: string;
  guidance: string;
}

export const NORSE_RUNES: NorseRune[] = [
  {
    name: "Fehu",
    symbol: "ᚠ",
    literal: "Cattle / Movable Wealth",
    keywords: ["Abundance", "Earned success", "Circulation of energy", "Fertility"],
    description: "The primary rune of wealth, representing cattle which was the active currency of the ancient North.",
    guidance: "Energy must circulate to remain alive. Focus on cultivating your physical and creative resources, and share them generously to feed the cosmic stream."
  },
  {
    name: "Uruz",
    symbol: "ᚢ",
    literal: "Wild Ox / Aurochs",
    keywords: ["Physical strength", "Primal force", "Vital health", "Indomitable will"],
    description: "Represents the immense power and untamable strength of the aurochs, the wild bull of the ancient forests.",
    guidance: "A powerful current is surging within you. This is a time of sheer vitality and force. Confront your blockages with unwavering physical and mental stamina."
  },
  {
    name: "Thurisaz",
    symbol: "ᚦ",
    literal: "Thorn / Giant",
    keywords: ["Active defense", "Sudden conflict", "Thor's Hammer", "Reactive force"],
    description: "The double-edged force of a thorn that shields or pierces, and the wild, raw energy of the jötnar.",
    guidance: "Be vigilant. A challenge or conflict requires active defense. Use your boundaries like an iron shield, or strike down barriers with Thor-like focus."
  },
  {
    name: "Ansuz",
    symbol: "ᚫ",
    literal: "Mouth / Divine Ancestor",
    keywords: ["Inspiration", "Sacred speech", "Odin's breath", "Occult wisdom"],
    description: "The rune of Odin, representing divine breath, poetic creation, and the spoken word.",
    guidance: "Your voice holds sovereign power today. Speak, write, or chant your intentions with absolute clarity. Open yourself to receive inspiration from ancestral lines."
  },
  {
    name: "Raidho",
    symbol: "ᚱ",
    literal: "Wagon / Riding",
    keywords: ["The Journey", "Cosmic rhythm", "Ordered path", "Direct movement"],
    description: "Represents the rhythm of horse riding and the seasonal cycles of the stars.",
    guidance: "You are on the correct path. Trust the timing and the structured rhythm of your journey. Align your actions with the natural laws of movement."
  },
  {
    name: "Kenaz",
    symbol: "ᚲ",
    literal: "Torch",
    keywords: ["Illumination", "Active creativity", "Forge", "Technical skill"],
    description: "The controlled, illuminating fire of the artisan's torch or blacksmith's forge.",
    guidance: "Light up the darkness. The furnace of your creativity is ready. Refine your skill, focus your analytical vision, and weld your dreams into reality."
  },
  {
    name: "Gebo",
    symbol: "ᚷ",
    literal: "Gift / Partnership",
    keywords: ["Sacred exchange", "Alliance", "Mutual respect", "Sacrifice"],
    description: "The crossing lines of an agreement, highlighting that a gift always demands a balance.",
    guidance: "Honorable relationships are built on equilibrium. Value those who share your journey, and understand that every creative breakthrough requires a matching sacrifice."
  },
  {
    name: "Wunjo",
    symbol: "ᚹ",
    literal: "Joy / Harmony",
    keywords: ["Fulfillment", "Belonging", "Spiritual alignment", "Peace"],
    description: "Represents the tribal banner or standard, signaling shelter, victory, and fraternal peace.",
    guidance: "Breathe. You have aligned your intentions with the cosmic loom. Enjoy the harmony of the present moment and the shelter of your community."
  },
  {
    name: "Hagalaz",
    symbol: "ᚺ",
    literal: "Hail",
    keywords: ["Disruption", "Sudden storm", "Natural forces", "Structural reset"],
    description: "The cold, crushing force of a sudden hailstorm, destroying the harvest to force rebirth.",
    guidance: "A sudden disruption is at work. Do not resist the storm; it is a natural reset. Let the obsolete structures collapse so you can rebuild on solid bedrock."
  },
  {
    name: "Nauthiz",
    symbol: "ᚾ",
    literal: "Need / Constraint",
    keywords: ["Necessity", "Endurance", "Friction", "Self-reliance"],
    description: "The friction required to light fire with two sticks of wood during cold necessity.",
    guidance: "Constraints are your primary teachers now. Do not fight the limitation. Use the pressure and friction of this bottleneck to forge self-reliance and grit."
  },
  {
    name: "Isa",
    symbol: "ᛁ",
    literal: "Ice",
    keywords: ["Stasis", "Deep reflection", "Freezing action", "Preservation"],
    description: "The frozen stillness of a winter lake, preserving life beneath a thick, clear sheet of ice.",
    guidance: "The cosmic current calls for still pause. Halt all outward momentum. Withdraw into quiet, crystalline introspection before the spring thaw initiates movement."
  },
  {
    name: "Jera",
    symbol: "ᛃ",
    literal: "Year / Harvest",
    keywords: ["Cyclical change", "Fruition", "Patience", "Organic reward"],
    description: "The two interlocking seasons of the year, showing the rotation of sowing and reaping.",
    guidance: "Patience. Growth cannot be forced. Your diligent work is ripening in its own natural time. Honor the harvest and continue tending your field."
  },
  {
    name: "Eihwaz",
    symbol: "ᛇ",
    literal: "Yew Tree",
    keywords: ["Resilience", "Life & Death", "World Tree", "Spiritual backbone"],
    description: "The deep-rooted, evergreen yew tree, representing endurance through winter and connection to ancestral realms.",
    guidance: "Stand firm with a powerful, flexible spine. You are bridging life and death, visible and invisible worlds. Trust your long-term resilience."
  },
  {
    name: "Perthro",
    symbol: "ᛈ",
    literal: "Dice Cup / Lot-Box",
    keywords: ["Wyrd", "Mystery", "Unmanifested potential", "Occult chance"],
    description: "The vessel from which runes or dice are cast, indicating the unseen laws of destiny.",
    guidance: "A hidden mechanism is unfolding. The universe is rolling the bones. Align yourself with the mystery, trust your intuition, and let the dice land."
  },
  {
    name: "Algiz",
    symbol: "ᛉ",
    literal: "Elk / Shielding",
    keywords: ["Protection", "Vigilant boundaries", "Higher guidance", "Warden"],
    description: "The spreading antlers of the wild elk, shielding it from predators, or the protective sedge-grass.",
    guidance: "You are shielded by supreme ancestral watchguards. Keep your sensory arrays highly vigilant, define your boundaries clearly, and walk without fear."
  },
  {
    name: "Sowilo",
    symbol: "ᛊ",
    literal: "Sun",
    keywords: ["Absolute victory", "Vital force", "Solar illumination", "Healing"],
    description: "The lightning-like ray of the sun, delivering heat, growth, and scattering shadow-beasts.",
    guidance: "A surge of pure solar power is yours. Ignite your passion, step into absolute visibility, and let your internal light incinerate any lingering self-doubt."
  },
  {
    name: "Tiwaz",
    symbol: "ᛏ",
    literal: "Týr / Tyr's Spear",
    keywords: ["Honor", "Self-sacrifice", "Sovereign justice", "Cosmic order"],
    description: "Named after the god Týr, representing the spear and the high cosmic sky-pillar of justice.",
    guidance: "Act with absolute integrity and honor. A situation demands courage and possibly a difficult personal sacrifice to restore balance and justice."
  },
  {
    name: "Berkano",
    symbol: "ᛒ",
    literal: "Birch Goddess",
    keywords: ["Rebirth", "Maternal sanctuary", "Nurturing growth", "New beginnings"],
    description: "The fragrant birch tree, the first to leaf out in spring, representing purification and sanctuary.",
    guidance: "A gentle, nurturing energy is birthing a new chapter. Guard this vulnerable seed or idea. Provide it with a safe, quiet space to blossom."
  },
  {
    name: "Ehwaz",
    symbol: "ᛖ",
    literal: "Horse",
    keywords: ["Cooperation", "Loyal partnership", "Dynamic momentum", "Trust"],
    description: "The sacred horse, representing the harmonious bond between rider and beast.",
    guidance: "Progress is made through synergy. Cultivate deep trust with your partners or tools. Move forward in perfect, dual alignment."
  },
  {
    name: "Mannaz",
    symbol: "ᛗ",
    literal: "Human / Self",
    keywords: ["Consciousness", "Social duty", "Self-awareness", "Collective mind"],
    description: "The human archetype, reflecting our shared mortality, intellect, and communal structures.",
    guidance: "Examine your own motives first. Understand your place in the collective web. Seek intellectual clarity and govern your personal ego."
  },
  {
    name: "Laguz",
    symbol: "ᛚ",
    literal: "Water / Flow",
    keywords: ["Fluid intuition", "Deep unconscious", "Ocean currents", "Emotional storm"],
    description: "The deep, flowing waters of the northern seas, holding both danger and the tide of life.",
    guidance: "Dive into the water. Trust your subconscious currents and dreams. Let go of rigid structures and flow with the raw liquid tide of your feelings."
  },
  {
    name: "Ingwaz",
    symbol: "ᛜ",
    literal: "Ing / Seed",
    keywords: ["Potential energy", "Gestative rest", "Internal fire", "Sacred boundary"],
    description: "The seed containing the entire blueprint of the future, resting in the earth during winter.",
    guidance: "Store your energy. This is a time of internal development, away from the eyes of the world. Trust that your hidden potential is maturing perfectly."
  },
  {
    name: "Dagaz",
    symbol: "ᛞ",
    literal: "Day / Dawn",
    keywords: ["Breakthrough", "Transmutation", "Polarity synthesis", "Absolute Light"],
    description: "The infinite horizon of dawn where night is instantly balanced and consumed by day.",
    guidance: "A radical, positive breakthrough is here. Opposites are synthesizing into a single, higher understanding. Walk out of the shadow into full daylight."
  },
  {
    name: "Othala",
    symbol: "ᛟ",
    literal: "Heritage / Homeland",
    keywords: ["Ancestral roots", "Permanent foundation", "Inherited wisdom", "Sanctuary"],
    description: "The walled estate or homestead, representing lineage, inherited property, and genetic memory.",
    guidance: "Connect with your deep ancestral roots. Draw strength from the permanent foundations laid by those who walked before you. Honor your heritage."
  }
];

export const NORSE_GODS: NorseGod[] = [
  {
    name: "Odin",
    archetype: "The Seeker / Sage / Magician",
    domains: ["Wisdom", "Magic (Seiðr)", "Poetry", "Occult Secrets", "Strategy"],
    symbol: "Single Eye / Huginn & Muninn",
    lore: "The Allfather who sacrificed his eye at Mímir's Well and hung himself on Yggdrasil to unlock the runes. He travels as a hooded grey wanderer.",
    guidance: "Seek wisdom at any personal cost. Apply strategy, use the power of the spoken and written word, and understand that deep perspective demands a sacrifice."
  },
  {
    name: "Thor",
    archetype: "The Champion / Guardian / Warrior",
    domains: ["Thunder", "Protection", "Direct Action", "Indomitable Strength"],
    symbol: "Mjölnir (The Thunder Hammer)",
    lore: "The defender of Asgard and Midgard, battling the wild jötnar forces. Direct, courageous, and fiercely protective of the human realm.",
    guidance: "The time for overthinking is over. Stand up, define your boundaries with thunderous clarity, and take courageous, uncomplicated action."
  },
  {
    name: "Loki",
    archetype: "The Trickster / Catalyst / Shadow",
    domains: ["Chaos", "Disruption", "Shape-shifting", "Uncomfortable Truths"],
    symbol: "Scarred Lips / Fishnet",
    lore: "Odin's blood-brother, whose cunning acts both save the gods and precipitate their downfall. He is the ultimate agent of volatile transformation.",
    guidance: "Embrace the disruption. Chaos has arrived to smash your rigid outlines. Look for self-deception, find the hidden leverage, and transmute crisis into creation."
  },
  {
    name: "Frigg",
    archetype: "The Matriarch / Silent Seer / Weaver",
    domains: ["Prophecy", "Motherhood", "Sanctuary", "Social Fabric"],
    symbol: "Distaff / Golden Key",
    lore: "The Queen of Asgard who knows the ultimate fates of all beings but keeps them silent. She desperately tried to protect her beloved son Baldr.",
    guidance: "Trust your silent intuition. Weave connection with those around you, protect what is precious, and accept that some fates must be gracefully met."
  },
  {
    name: "Freyja",
    archetype: "The Wild Queen / Sorceress / Lover",
    domains: ["Sovereignty", "Passion", "Seiðr", "Sensual Magic", "War"],
    symbol: "Brísingamen (Golden Necklace) / Falcon Cloak",
    lore: "The Vanir goddess who presides over her own war hall Fólkvangr. She taught the Æsir the magical arts of shaping destiny and claims half of the fallen.",
    guidance: "Claim your absolute personal sovereignty. Do not bend your knee or hide your desire. Combine wild passion with structured, magical mastery."
  },
  {
    name: "Freyr",
    archetype: "The Sacrificed King / Lord of Abundance",
    domains: ["Peace", "Prosperity", "Fertile Growth", "Sensual Joy"],
    symbol: "Golden Boar (Gullinbursti) / Skíðblaðnir",
    lore: "The Lord of Plenty who rules Álfheimr. He famously traded away his self-fighting sword to win the love of the giantess Gerðr, leaving himself defenseless.",
    guidance: "Nurture peace and enjoy life's ripe harvests. But heed the warning: verify that what you are trading away for passion does not leave you defenseless."
  },
  {
    name: "Heimdall",
    archetype: "The Sentinel / Watchman / Liminal Guard",
    domains: ["Vigilance", "Thresholds", "Keen Perception", "Transitions"],
    symbol: "Gjallarhorn (The Alarm Horn)",
    lore: "The white god who guards the Bifröst bridge. Possessing unmatched sight and hearing, he stands at the border of worlds, destined to fight Loki.",
    guidance: "Be completely awake. Pay attention to the subtle warnings on your horizon. You are standing at a major threshold of transition; sound your horn."
  },
  {
    name: "Týr",
    archetype: "The Lawgiver / Justiciar / Oath-Keeper",
    domains: ["Sovereignty", "Oaths", "Justice", "Heroic Integrity"],
    symbol: "Severed Right Hand",
    lore: "The boldest god of justice who placed his right hand into the mouth of the giant wolf Fenrir as a pledge of law, sacrificing it to bind chaos.",
    guidance: "Let integrity be your north star. Stand by your word, defend structural justice, and face the necessary sacrifice required to bind chaotic forces."
  },
  {
    name: "Baldr",
    archetype: "The Innocent / Dying Light / Rebirth Seed",
    domains: ["Beauty", "Purity", "Inevitable Loss", "Future Hope"],
    symbol: "Mistletoe Arrow / Shining Hall",
    lore: "The most beautiful, radiant god whose tragic death triggered the winter of Ragnarök. He resides in Hel, fated to return and rule the new golden age.",
    guidance: "Grieve what has passed, for some beautiful eras must end. Do not lose faith; the seed of your light is preserved in the deep dark, ready to arise again."
  }
];

export const NORSE_REALMS: NorseRealm[] = [
  {
    name: "Asgard",
    archetype: "Realm of Divine Order & Ambition",
    axis: "Vertical",
    description: "The fortress-home of the Æsir, a realm of laws, golden halls, and conscious aspiration.",
    guidance: "Elevate your thoughts to the highest plane of order. Organise your project with clear hierarchy, structural ambition, and executive discipline."
  },
  {
    name: "Midgard",
    archetype: "Realm of Daily Action & Ego",
    axis: "Vertical",
    description: "The middle world of humanity, surrounded by the deep ocean where the World Serpent bites its tail.",
    guidance: "Ground your intentions in the concrete physical world. Take immediate, tactile action. You are on the main stage of choice and consequence."
  },
  {
    name: "Hel",
    archetype: "Realm of Ancestral Memory & Shadow",
    axis: "Vertical",
    description: "The subterranean kingdom of the dead, a quiet sanctuary of integration and subconscious roots.",
    guidance: "Journey down into your quiet subconscious. Listen to ancestral echoes, integrate your shadow aspects, and process loss without fear."
  },
  {
    name: "Muspelheim",
    archetype: "Realm of Primordial Fire & Passion",
    axis: "Horizontal",
    description: "The southern world of intense heat and raging flames, ruled by the giant Surtr.",
    guidance: "Ignite your raw, untamed passion. Let your creative fury run wild; burn down obsolete outlines and let the heat of your direct voice erupt."
  },
  {
    name: "Niflheim",
    archetype: "Realm of Primordial Ice & Mist",
    axis: "Horizontal",
    description: "The northern world of freezing mists, dark ice, and undifferentiated water.",
    guidance: "Embrace the quiet cold. Do not force movement where there is stasis. Use this foggy delay to rest, contemplate, and clarify your blueprint."
  },
  {
    name: "Jötunheimr",
    archetype: "Realm of Wild Nature & Obstacles",
    axis: "Horizontal",
    description: "The rugged mountain land of the jötnar, a wild, dark territory of raw elemental challenges and ancient wisdom.",
    guidance: "An immense, untamed force is testing you. Face the rocky, frozen giant in your path. Deep wisdom lies hidden within this heavy confrontation."
  },
  {
    name: "Vanaheim",
    archetype: "Realm of Fertility & Organic Rhythm",
    axis: "Horizontal",
    description: "The home of the Vanir, representing peace, sensuality, growth, and integration with nature.",
    guidance: "Flow with the natural cycles. Let your writing and life grow organically. Focus on relationships, pleasure, and the natural timing of growth."
  },
  {
    name: "Álfheimr",
    archetype: "Realm of Sublime Creative Inspiration",
    axis: "Horizontal",
    description: "The luminous world of the Light Elves, radiant with beauty, healing, and light.",
    guidance: "Open your mind to receive sublime, aesthetic inspiration. Polish your work with elegance, beauty, and refined creative grace."
  },
  {
    name: "Svartálfaheimr",
    archetype: "Realm of Master Craftsmanship & Wealth",
    axis: "Horizontal",
    description: "The dark underground tunnels and busy blacksmith forges of the dark elves and dwarves.",
    guidance: "Descend to the forge. This situation demands hard work, skilled labor, and technical refinement. Shape your raw materials into lasting wealth."
  }
];

export const NORSE_CONCEPTS: NorseConcept[] = [
  {
    name: "Wyrd & Örlög",
    theme: "The Flow of Becoming",
    description: "The cosmic loom where the Norns weave past actions (Urðr) into present moments (Verðandi) to shape necessity (Skuld).",
    guidance: "You are the active weaver of your own thread. Look at your past decisions, align yourself with current momentum, and weave with direct conscious intent."
  },
  {
    name: "Honor & Dómr",
    theme: "Lineage of Deeds",
    description: "The understanding that cattle, kinsmen, and our physical bodies die, but the lasting reputation of our honorable deeds never fades.",
    guidance: "Act with uncompromising integrity. Focus on producing work of lasting excellence and honor that will echo long after the present moment has dissolved."
  },
  {
    name: "Courage",
    theme: "Heroic Defiance",
    description: "Confronting fated doom and raw danger with fierce laughter, refusal to despair, and unwavering inner resolve.",
    guidance: "Unleash your inner warrior. Defy the limitations and fears that hold you back. Even if success is not guaranteed, the act of courageous resistance is your victory."
  },
  {
    name: "Ragnarök",
    theme: "The Great Rebirth Cycle",
    description: "The absolute collapse of the cosmic order and fated death of the old gods, followed by a beautiful, clean earth rising from the sea.",
    guidance: "A major, fated ending is occurring. Do not cling to the collapsing ruins. Let the old world burn completely; your green, fertile rebirth is absolutely inevitable."
  }
];
