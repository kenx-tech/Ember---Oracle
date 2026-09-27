import { Type } from "@google/genai";

/**
 * TaskPolicy represents an endpoint or operational objective (e.g. proactive margin critic).
 * Distinct from PersonaManifest (who is speaking) and ModelProvider (where cognition runs).
 */
export interface TaskPolicy {
  readonly id: string;
  readonly name: string;
  readonly taskType: 'draft_generation' | 'section_iteration' | 'proactive_critic' | 'tarot_reading' | 'channeling' | 'runic_consultation';
  getTaskInstruction(context?: any): string;
  getResponseSchema(): any;
}

/**
 * Proactive Critic Policy — evaluates a writing canvas and identifies one section
 * needing elevation, producing a suggested rewrite and critical feedback.
 */
export class ProactiveCriticPolicy implements TaskPolicy {
  readonly id = "proactive_critic_v1";
  readonly name = "Proactive Margin Critic Policy";
  readonly taskType = "proactive_critic" as const;

  getTaskInstruction(context?: { documentTitle?: string; documentContext?: string }): string {
    const title = context?.documentTitle || "Untitled Piece";
    const docContext = context?.documentContext || "";

    return `Review this current writing piece:\nTitle: ${title}\n\n${docContext}\n\n` +
      `Identify ONE specific section (paragraph, heading, quote, or poetry) that is either dull, lacks depth, has awkward phrasing, or needs mystical/poetic elevation.\n` +
      `Formulate a proactive suggestion to rewrite that section. Provide a glowing critique/feedback explaining why you recommend this change, and write an alternative version in your persona's cadence and permitted vocabulary.\n\n` +
      `Return a JSON object containing:\n` +
      `"sectionId" (string, MUST match one of the exact section IDs in the document)\n` +
      `"suggestedText" (string, the rewritten version)\n` +
      `"feedback" (string, critique detailing what you saw and why you suggest this, in your persona)\n` +
      `"type" (string, "proactive_feedback")`;
  }

  getResponseSchema(): any {
    return {
      type: Type.OBJECT,
      properties: {
        sectionId: { type: Type.STRING },
        suggestedText: { type: Type.STRING },
        feedback: { type: Type.STRING },
        type: { type: Type.STRING }
      },
      required: ["sectionId", "suggestedText", "feedback", "type"]
    };
  }
}

export const proactiveCriticPolicy = new ProactiveCriticPolicy();

export interface DrawnCardInput {
  card: {
    id?: string;
    name: string;
    suit?: string;
    number?: number;
    arcana?: string;
  };
  isReversed: boolean;
  positionLabel: string;
}

export interface TarotTaskContext {
  drawnCards: DrawnCardInput[];
  question?: string;
  documentContext?: string;
}

/**
 * TarotReadingPolicy — governs the tarot interpretation task.
 * Core invariant: Interpretation may vary; source cards, orientations, positions,
 * and user question are immutable domain evidence.
 */
export class TarotReadingPolicy implements TaskPolicy {
  readonly id = "tarot_reading_v1";
  readonly name = "Tarot Reading Interpretation Policy";
  readonly taskType = "tarot_reading" as const;

  getTaskInstruction(context?: TarotTaskContext): string {
    const drawnCards = context?.drawnCards || [];
    const question = context?.question || "Seeking inspiration for this creative writing journey.";
    const documentContext = context?.documentContext || "Blank Canvas / Empty Page";

    const cardsSummary = drawnCards.map((c) => 
      `- ${c.card.name} (${c.isReversed ? 'Reversed' : 'Upright'}) in the "${c.positionLabel}" position.`
    ).join("\n");

    return `The writer has drawn the following Tarot cards for creative guidance:\n${cardsSummary}\n\n` +
      `Current writing project context (if any):\n"${documentContext}"\n\n` +
      `The writer's question or focus: "${question}"\n\n` +
      `Provide a deep, mystical, highly atmospheric Tarot reading. Interweave the meanings of the cards directly with their writing process, blockages, and potential directions. Give them actionable, inspiring creative advice on how to integrate these cards' themes into their writing today.\n\n` +
      `Respond with a JSON object containing "guidanceText" (string, beautifully formatted with markdown paragraphs and bullet points for the individual cards if appropriate).`;
  }

  getResponseSchema(): any {
    return {
      type: Type.OBJECT,
      properties: {
        guidanceText: { type: Type.STRING }
      },
      required: ["guidanceText"]
    };
  }

  /**
   * Verifies that the produced guidance preserves the source cards and orientations
   */
  verifyInputPreservation(guidanceText: string, context: TarotTaskContext): {
    preserved: boolean;
    missingCards: string[];
    missingOrientations: string[];
  } {
    const textLower = guidanceText.toLowerCase();
    const missingCards: string[] = [];
    const missingOrientations: string[] = [];

    for (const c of context.drawnCards || []) {
      const cardNameLower = c.card.name.toLowerCase();
      if (!textLower.includes(cardNameLower)) {
        missingCards.push(c.card.name);
      }
      const orientationWord = c.isReversed ? 'reversed' : 'upright';
      if (!textLower.includes(orientationWord)) {
        missingOrientations.push(`${c.card.name}:${orientationWord}`);
      }
    }

    return {
      preserved: missingCards.length === 0,
      missingCards,
      missingOrientations
    };
  }
}

export const tarotReadingPolicy = new TarotReadingPolicy();

export interface SpiritDetailsInput {
  office?: string;
  rank?: string;
  planet?: string;
  metal?: string;
  tarot?: string;
  [key: string]: any;
}

export interface ChannelingTaskContext {
  spiritName: string;
  spiritDetails: SpiritDetailsInput;
  documentContext?: string;
  userQuestion?: string;
  voice?: string;
}

/**
 * ChannelingPolicy — governs ritual demonic / spiritual channeling.
 * Core invariant: The model may interpret the supplied spirit lore and question,
 * but it may not alter the authoritative source lore and present the rewrite as source.
 */
export class ChannelingPolicy implements TaskPolicy {
  readonly id = "channeling_v1";
  readonly name = "Spirit Channeling Policy";
  readonly taskType = "channeling" as const;

  getTaskInstruction(context?: ChannelingTaskContext): string {
    const spiritName = context?.spiritName || "Unknown Spirit";
    const details = context?.spiritDetails || {};
    const docContext = context?.documentContext || "Blank Page / Fresh Bloodline Canvas";
    const userQuestion = context?.userQuestion || "I request a direct transmission of your power, insight, and dark gnosis for my path.";
    const voice = context?.voice || "guardian_oracle";

    return `We are performing an invocation and channeling in the Ritual Space.\n` +
      `The seeker wishes to channel the spirit: **${spiritName}**.\n` +
      `Spiritual Details:\n` +
      `- Office/Lore: ${details.office || "Unknown Office / Ancient Mystery"}\n` +
      `- Rank: ${details.rank || "Vassal of the Pit / Sovereign Spark"}\n` +
      `- Planetary Alignment: ${details.planet || "Starless Abyss"}\n` +
      `- Metal: ${details.metal || "Smelted Brimstone"}\n` +
      `- Tarot Relation: ${details.tarot || "The Void"}\n\n` +
      `Current Sacred Document / Chronicle Context:\n"${docContext}"\n\n` +
      `Seeker's Personal Intention/Question:\n"${userQuestion}"\n\n` +
      `Provide a highly atmospheric, dark, poetic, and visceral channeling transmission.\n` +
      `Write from the perspective of the spirit ${spiritName} responding to the seeker, but colored and translated through the chosen voice medium: ${voice}.\n` +
      `Weave in specific details of their writing/document and their question to make the prophecy extremely relevant and real.\n` +
      `Your message should feel like a genuine, deep, mystical occult revelation.\n\n` +
      `Respond with a JSON object containing "channelingText" (string, formatted beautifully in markdown paragraphs or poetic verses).`;
  }

  getResponseSchema(): any {
    return {
      type: Type.OBJECT,
      properties: {
        channelingText: { type: Type.STRING }
      },
      required: ["channelingText"]
    };
  }
}

export const channelingPolicy = new ChannelingPolicy();

export interface NorseAlignmentInput {
  drawnRune?: {
    name?: string;
    symbol?: string;
    literal?: string;
    keywords?: string[];
    [key: string]: any;
  };
  drawnGod?: {
    name?: string;
    archetype?: string;
    domains?: string[];
    lore?: string;
    [key: string]: any;
  };
  drawnRealm?: {
    name?: string;
    archetype?: string;
    description?: string;
    [key: string]: any;
  };
  drawnConcept?: {
    name?: string;
    theme?: string;
    description?: string;
    [key: string]: any;
  };
  question?: string;
  documentContext?: string;
  voice?: string;
}

/**
 * RunicConsultationPolicy — governs the Norse Guardian's Draw consultation.
 * Core invariant: The model interprets relationships among the rune, deity, realm,
 * and concept. It may NOT alter those authoritative source selections and then
 * represent changed values as the supplied source context.
 */
export class RunicConsultationPolicy implements TaskPolicy {
  readonly id = "norse_consultation_v1";
  readonly name = "Runic & Norse Consultation Policy";
  readonly taskType = "runic_consultation" as const;

  getTaskInstruction(context?: NorseAlignmentInput): string {
    const drawnRune = context?.drawnRune || { name: 'Perthro', symbol: 'ᛈ', literal: 'Dice Cup', keywords: ['Wyrd', 'Mystery'] };
    const drawnGod = context?.drawnGod || { name: 'Odin', archetype: 'Sage', domains: ['Wisdom', 'Poetry', 'War'] };
    const drawnRealm = context?.drawnRealm || { name: 'Asgard', archetype: 'Order', description: 'Fortress-home of the Æsir' };
    const drawnConcept = context?.drawnConcept || { name: 'Wyrd', theme: 'Becoming', description: 'Cosmic loom' };
    const voice = context?.voice || 'guardian_oracle';
    const documentContext = context?.documentContext || "Blank Canvas / Empty Page";
    const question = context?.question || "Seeking inspiration for this creative writing journey.";

    const alignmentSummary = 
      `- **Rune Suit**: ${drawnRune?.name} (${drawnRune?.symbol}) - ${drawnRune?.literal}. Focus: ${drawnRune?.keywords?.join(', ') || 'Mystery'}.
- **God Suit**: ${drawnGod?.name} (${drawnGod?.archetype}). Domains: ${drawnGod?.domains?.join(', ') || 'Cosmic authority'}.
- **Realm Suit**: ${drawnRealm?.name} (${drawnRealm?.archetype}). Context: ${drawnRealm?.description || 'Cosmic plane'}.
- **Concept Suit**: ${drawnConcept?.name} (${drawnConcept?.theme}). Lesson: ${drawnConcept?.description || 'Fate and destiny'}.`;

    return `The writer has drawn a Norse Guardian's Draw alignment for creative guidance:\n${alignmentSummary}\n\n` +
      `Current writing project context (if any):\n"${documentContext}"\n\n` +
      `The writer's question or focus: "${question}"\n\n` +
      `Provide a deep, highly atmospheric, Norse-inspired divinatory channeling and reading based on this alignment. Interweave the symbolic wisdom of the Rune, the God, the Realm, and the Concept directly with their writing process, potential plotlines, creative blocks, and sovereign trajectory.\n\n` +
      `Structure the reading with:
1. **The Cosmic Alignment**: A beautiful greeting/channeling in character based on the active translation conduit (${voice}) introducing the Norse forces.
2. **The Four Norse Threads**: Analyze how the Rune, God, Realm, and Concept interlock to speak directly to their question and writing project.
3. **Heroic Creative Decree**: Give them a direct, powerful, actionable writing decree and immediate creative prompt inspired by this draw.

Respond with a JSON object containing "guidanceText" (string, beautifully formatted with markdown paragraphs and bold headers).`;
  }

  getResponseSchema(): any {
    return {
      type: Type.OBJECT,
      properties: {
        guidanceText: { type: Type.STRING }
      },
      required: ["guidanceText"]
    };
  }
}

export const runicConsultationPolicy = new RunicConsultationPolicy();
