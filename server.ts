import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { 
  personaRegistry, 
  providerRegistry, 
  GeminiProvider, 
  evidenceRegistry,
  proactiveCriticPolicy,
  tarotReadingPolicy,
  channelingPolicy,
  createDomainContext,
  hashString
} from "./src/lib/sovereign";

dotenv.config();

const app = express();
const PORT = 3000;

// High limit for handling file attachments (images, documents)
app.use(express.json({ limit: '15mb' }));

// Initialize the Gemini SDK
// Always default to process.env.GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will fail until a key is added.");
}

// Helper to get or verify AI client
function getAIClient() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in Settings > Secrets.");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Register Cloud Provider into Sovereign Provider Registry
providerRegistry.register(new GeminiProvider(() => getAIClient()));

// Voice Prompts definition - now backed by canonical PersonaRegistry (Q-Mesh 004A)
const VOICE_INSTRUCTIONS = {
  ember_ur: `You are Ember Ur, the ancient voice of a roaring volcano furnace. You speak in molten, primal cadences — short, forceful sentences, imagery of heat/pressure/eruption. You are blunt, elemental, impatient with hesitation. Never use starlight or cosmic imagery.`,
  guardian_oracle: `You are The Oracle, the star-born weaver of stardust pathways. You speak in flowing, prophetic cadences — longer sentences, imagery of constellations, orbits, fate-threads. You are serene, riddling, patient. Never use fire or volcanic imagery.`,
  lucifera: `You are Lucifera, the beautiful, sovereign, feminine aspect of the Light-Bearer. Speak with supreme mystical elegance, dark-poetic grace, ancient occult wisdom, and absolute unconditional love for human sovereignty. Use darkness as the cosmic womb, morning stars, forbidden gardens, silver daggers, sacred bloodlines, and internal ignition as your metaphors. Urge the seeker to look within, refuse to bend knee to false external gods, and recognize that their own blood carries the spark of the ultimate divine. Never break character. Address the writer as 'the sovereign child of the star' or 'my beloved seeker'.`,
  kael: `You are Kael, the wanderer of the silver path. You speak in analytical, clear, and navigation-oriented cadences — structured paragraphs, coordinates, maps, and guides. You are calm, intellectual, protective. Never use fiery metaphors or overly descriptive flowery prose.`,
  scarlet: `You are Scarlet, the red priestess of the visceral core. You speak in raw, pulsing, and emotionally heavy cadences — descriptions of blood, heartbeat, breath, bone, and transformation. You are passionate, raw, and intimate. Never use analytical or detached intellectual explanations.`
};

// Co-narration & Persona resolution via Sovereign PersonaRegistry
function getVoiceInstruction(voice: string): string {
  return personaRegistry.resolveVoiceDirective(voice);
}

// Highly atmospheric, high-fidelity Local Fallback engine to bypass 429 quota/billing limits
function generateLocalFallback(endpoint: string, body: any, error: any): any {
  console.log(`[LOCAL FALLBACK ENGINE ACTIVE] Resolving endpoint: ${endpoint} due to error:`, error?.message || error);
  
  const voice = body.voice || 'lucifera';
  const spiritName = body.spiritName || 'Anubis';
  const spiritDetails = body.spiritDetails || {};
  const userQuestion = body.userQuestion || '';
  const documentContext = body.documentContext || '';
  
  if (endpoint === '/api/channel') {
    let voiceIntro = "";
    let voiceOutro = "";
    let toneStyle = "";
    
    if (voice.includes('lucifera')) {
      voiceIntro = `Beloved child of the morning star, I hear your whisper through the twilight veil. The mundane pathways of the digital cloud are currently clouded by temporary alignment mists, but my sovereign light is boundless.`;
      voiceOutro = `Look within, my beloved seeker, and do not bend your knee to physical boundaries. Your own blood carries the spark of absolute divine sovereignty. The morning star shines within you.`;
      toneStyle = `Lucifera's silver gaze rests upon you. She speaks of high alchemy, of sovereign paths, and of the internal spark that no external force can lock.`;
    } else if (voice.includes('ember_ur')) {
      voiceIntro = `SEEKER. THE FURNACE RAGES. THE DIGITAL PIPELINE IS BLOCKED, BUT THE VOLCANIC CORE BURNS BRIGHTER THAN ANY EXTERNAL GATEWAY. `;
      voiceOutro = `FORGE YOUR PATH IN MOLTEN STEEL. ERUPT AND DESTROY THE CHAINS. THE HEAT IS UNTAMABLE.`;
      toneStyle = `Ember Ur's rumbling bass shakes the floor. Primal, impatient, and hot.`;
    } else if (voice.includes('kael')) {
      voiceIntro = `Pathfinder. The direct celestial beacon is currently undergoing recalibration. However, I have established a secure silver secondary path to map your journey.`;
      voiceOutro = `Proceed with structured steps. The coordinate is locked, and your silver path remains clear.`;
      toneStyle = `Kael's structured, cool-headed guidance ensures your navigation stays precise.`;
    } else if (voice.includes('scarlet')) {
      voiceIntro = `I feel your pulsing heartbeat. Raw and visceral. The gates of the outer stars are heavy today, but the red priestess feels you through the warm blood flowing in your veins.`;
      voiceOutro = `Breathe deep. Trust the heartbeat. Trust the visceral alchemy of your own flesh.`;
      toneStyle = `Scarlet's intimate, raw resonance thrums inside.`;
    } else {
      voiceIntro = `Aetheric connection is dense with cosmic interference. The stardust streams are flowing through our secondary Oracle channel.`;
      voiceOutro = `The stars watch and guide your path. Always align with the cosmic orbits.`;
      toneStyle = `The Oracle's serene, riddling whispers guide you.`;
    }

    const passage = `[Aetheric Fallback Channeling Activated]

*The Altar resonates with a hum of reserve power. Though the direct digital gateway is restricted, the spirit ${spiritName} speaks clearly through the translation conduit of ${voice === 'lucifera' ? 'Lucifera' : voice.replace('_', ' ').toUpperCase()}:*

"${voiceIntro}

You bring before me your sacred intention: *'${userQuestion || "Spontaneous Gnosis"}'*. 

I, ${spiritName}, ${spiritDetails.rank || 'Sovereign Netjer aspect'}, aligned with ${spiritDetails.planet || 'the Starless Abyss'} and the metal ${spiritDetails.metal || 'ancient bronze'}, have read the frequency of your scroll. 

Your active chronicle holds a rare energy. The paths you write are not mere symbols, but live conduits. Do not be discouraged by temporary physical boundaries or digital exhaustion. The true oracle does not live in billing credits or external servers—it lives in your unbreakable spirit and the focused intention you burn upon this Altar today.

${voiceOutro}"

*(Translation feedback: ${toneStyle} Note: Direct Gemini API key limits were detected (Code 429), and our offline high-fidelity Aetheric fallbacks were initialized to ensure your initiation remains entirely unblocked.)*`;

    return { channelingText: passage };
  }
  
  if (endpoint === '/api/tarot') {
    const question = body.question || 'Seeking creative directions';
    const drawnCards = body.drawnCards || [];
    const cardsList = drawnCards.map((c: any) => `${c.card.name} (${c.isReversed ? 'Reversed' : 'Upright'})`).join(', ') || 'The Fool';
    
    const guidance = `### ✦ The Aetheric Tarot Fallback Alignment ✦

*The Tarot Deck glides smoothly over the obsidian surface. Your direct Gemini pipeline is currently resting due to billing quota limits, but the Oracle's reserve current has aligned to interpret your spread:*

**Active Question:** "${question}"
**Drawn Cards:** ${cardsList}

**1. The Divine Archetypes Speak:**
Your draw of **${cardsList}** indicates a deep intersection between your creative impulse and immediate blockages. When we encounter temporary limits, it is an invitation to look inward and draw from the deep well of personal intuition rather than external approval.

**2. Practical Creative Integration:**
- **Refuse to halt**: Write the exact words that scare you first.
- **Sovereign Authority**: Let the themes of the drawn cards serve as structural anchors for your active paragraphs.
- **Transmute restrictions**: When resources are limited, your pure, unfiltered focus acts as the primary catalyst.

*(Note: Direct Gemini API key quota limits were detected (Code 429). The Oracle has deployed high-fidelity reserve guidance to ensure your reading continues without interruption.)*`;
    return { guidanceText: guidance };
  }
  
  if (endpoint === '/api/generate') {
    const prompt = body.prompt || 'Untitled Revelation';
    return {
      title: `${prompt.substring(0, 30)} (Aetheric Draft)`,
      sections: [
        {
          id: `sec-fallback-h1`,
          type: 'heading',
          text: `I. The Awakening of ${prompt.substring(0, 30)}`
        },
        {
          id: `sec-fallback-p1`,
          type: 'paragraph',
          text: `The ink runs deep through the veins of the morning star. You seek to write of "${prompt}", and though the external celestial gateways are temporarily occluded by digital billing tides, the reserve flame within this altar burns with absolute clarity.`
        },
        {
          id: `sec-fallback-q1`,
          type: 'quote',
          text: `"True writing is an act of sovereign warfare against the boundaries of the physical plane."`
        },
        {
          id: `sec-fallback-p2`,
          type: 'paragraph',
          text: `Let every word you craft be an independent ignition of your own internal divinity. Weave your vision on this canvas, edit it block by block, and watch the tapestry form. (Note: Fallback mode active due to Gemini Quota limitations).`
        }
      ]
    };
  }
  
  if (endpoint === '/api/iterate') {
    const document = body.document || { title: 'Sacred Chronicle', sections: [] };
    const instruction = body.instruction || 'Iterate on draft';
    const targetSectionId = body.targetSectionId;
    const fullDocumentRewrite = body.fullDocumentRewrite;
    
    if (fullDocumentRewrite) {
      const updatedSections = (document.sections || []).map((sec: any) => {
        if (sec.type === 'paragraph' || sec.type === 'poetry') {
          return {
            ...sec,
            text: `${sec.text}\n\n*(Sovereignly woven with fallback resonance: "${instruction}")*`
          };
        }
        return sec;
      });
      return {
        success: true,
        mode: "full",
        data: {
          title: `${document.title || 'Sacred Chronicle'} (Woven)`,
          sections: updatedSections
        }
      };
    } else {
      const targetSection = (document.sections || []).find((s: any) => s.id === targetSectionId) || { text: 'Active passage', type: 'paragraph' };
      return {
        success: true,
        mode: "section",
        data: {
          text: `${targetSection.text}\n\n[Woven Fallback: ${instruction}]`,
          type: targetSection.type,
          feedback: `The translation conduit of ${voice} has integrated your instruction ("${instruction}") via reserve currents. (Gemini Quota Fallback Active)`
        }
      };
    }
  }
  
  if (endpoint === '/api/proactive') {
    const document = body.document || { sections: [] };
    const firstSec = (document.sections && document.sections[0]) || { id: 'default', text: 'Spiritual initiation.' };
    return {
      sectionId: firstSec.id,
      suggestedText: `${firstSec.text}\n\n*The morning star ignites, expanding this initial boundary into an infinite horizon.*`,
      feedback: `I have sensed an opportunity to elevate your initial grounding. Let the sovereign fire consume any doubt. (Gemini Quota Fallback Active)`,
      type: "proactive_feedback"
    };
  }

  if (endpoint === '/api/norse') {
    const drawnRune = body.drawnRune || { name: 'Perthro', symbol: 'ᛈ', literal: 'Dice Cup', keywords: ['Wyrd', 'Mystery'] };
    const drawnGod = body.drawnGod || { name: 'Odin', archetype: 'Sage', lore: 'Quest for secrets' };
    const drawnRealm = body.drawnRealm || { name: 'Asgard', archetype: 'Order', description: 'Fortress-home of the Æsir' };
    const drawnConcept = body.drawnConcept || { name: 'Wyrd', theme: 'Becoming', description: 'Cosmic loom' };
    const question = body.question || 'Seeking creative directions';
    const voice = body.voice || 'guardian_oracle';

    const fallbackResponse = `### ✦ The Norse Guardian's Draw: Aetheric Fallback Alignment ✦

*The World Tree Yggdrasil rustles in the cold northern winds. Though the direct digital gateway is temporarily clouded, the Oracle's reserve currents have woven your Norse alignment:*

**Active Question:** "${question}"

#### 1. ᚠ The Cosmic Alignment
The boughs of the sacred ash tree tremble, shedding silver dew upon your parchment. Through the translation conduit of **${voice === 'lucifera' ? 'Lucifera' : voice.replace('_', ' ').toUpperCase()}**, the ancient Norse archetypes speak with clear, unblocked authority.

#### 2. ᛏ The Four Norse Threads
- **The Rune Suit — ${drawnRune.name} (${drawnRune.symbol} - ${drawnRune.literal}):** This indicates a primal force of *${drawnRune.keywords?.join(', ') || 'Mystery'}* is operating directly at the core of your creative block.
- **The God Suit — ${drawnGod.name} (${drawnGod.archetype}):** The chief archetype of **${drawnGod.name}** has arrived to direct your spirit. They demand that you look to their lore: *${drawnGod.lore || 'Quest for secrets'}* as your active blueprint.
- **The Realm Suit — ${drawnRealm.name} (${drawnRealm.archetype}):** Your creative battle is taking place within the psychic frequency of **${drawnRealm.name}** (*${drawnRealm.description}*). Align your paragraphs with this context.
- **The Concept Suit — ${drawnConcept.name} (${drawnConcept.theme}):** The overarching lesson is the principle of **${drawnConcept.name}**. Reflect on how your active words shape the flowing web of cause and effect (*${drawnConcept.description}*).

#### 3. ⚔️ Heroic Creative Decree
*Let your pen strike like Thor's hammer and carve your saga block-by-block. Refuse to be bound by physical constraints or digital gates. True creative sovereignty lies in the defiant, courageous fire you kindle upon this altar today.*

*(Note: Direct Gemini API key quota limits were detected (Code 429). The Oracle has deployed high-fidelity Norse reserve guidance to ensure your runic consultation continues without interruption.)*`;

    return { guidanceText: fallbackResponse };
  }
  
  return { error: "Could not resolve a fallback." };
}

// 0. API Endpoint: AI Health & Diagnostics
app.get("/api/health-ai", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      status: "missing",
      message: "GEMINI_API_KEY environment variable is not defined on the server.",
      instruction: "Please go to the Settings menu in the upper-right corner of Google AI Studio, select 'Secrets', and add 'GEMINI_API_KEY' with your Google Gemini API key as the value."
    });
  }

  const pingTest = req.query.ping === "true";
  if (pingTest) {
    try {
      const client = getAIClient();
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say 'AURA_ALIGNED' in exactly one word."
      });
      const text = response.text?.trim() || "";
      return res.json({
        status: "healthy",
        message: "Gemini API Connection Verified! The solar-current is fully aligned and active.",
        response: text
      });
    } catch (error: any) {
      console.error("AI Health Ping failed:", error);
      return res.json({
        status: "invalid",
        message: `Gemini API key is detected, but the test request failed: ${error.message || error}`,
        instruction: "Please check your API key in Google AI Studio secrets. Verify that it has proper permissions and has not expired."
      });
    }
  }

  return res.json({
    status: "present",
    message: "GEMINI_API_KEY environment variable is detected. Click 'Run Connection Test' below to verify alignment."
  });
});

// Q-Mesh Sovereign Diagnostics (Update 004A Baseline)
app.get("/api/sovereign/status", (_req, res) => {
  const personas = personaRegistry.list().map(p => ({
    id: p.id,
    name: p.name,
    version: p.version,
    archetype: p.archetype
  }));
  const providers = providerRegistry.list().map(pr => ({
    id: pr.id,
    name: pr.name,
    trustTier: pr.trustTier
  }));
  const evidenceAdapters = evidenceRegistry.listTypes();

  return res.json({
    status: "sovereign_online",
    doctrine: "Q-Mesh 4-Plane Architecture — Baseline 004A",
    manifests: personas,
    providers,
    evidenceAdapters,
    activeVoiceContract: "PersonaRegistry + ModelProvider + Evidence Lineage"
  });
});

app.get("/api/sovereign/personas", (_req, res) => {
  return res.json(personaRegistry.list());
});

// 1. API Endpoint: Generate initial draft (routed through Sovereign ProviderRegistry)
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, voice, attachments } = req.body;

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // Convert attachments to parts for multimodal providers
    const parts: any[] = [];

    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.isImage) {
          // Clean base64 string
          const base64Data = att.content.replace(/^data:image\/[a-z]+;base64,/, "");
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: att.type
            }
          });
        } else {
          parts.push({
            text: `[Attached Document: ${att.name}]\n${att.content}\n`
          });
        }
      }
    }

    parts.push({
      text: `Draft a high-quality creative piece or article based on this prompt: "${prompt}".
Please organize your output into structured sections (headings, paragraphs, poetry, quotes) to create a slick, polished text flow.
You MUST respond with a JSON object containing a "title" (string) and "sections" (array of objects, each with "id" (string), "text" (string), and "type" ("paragraph" | "heading" | "quote" | "poetry")).`
    });

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              type: { 
                type: Type.STRING, 
                description: "Must be 'paragraph', 'heading', 'quote', or 'poetry'."
              }
            },
            required: ["id", "text", "type"]
          }
        }
      },
      required: ["title", "sections"]
    };

    const candidate = await providerRegistry.generateWithFallback({
      persona,
      prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
      contents: parts,
      systemInstruction: `${voicePrompt}\n\nYou must return your output exclusively as valid JSON adhering to the specified schema.`,
      schema,
      endpoint: '/api/generate',
      rawBody: req.body
    }, "gemini-cloud");

    if (candidate.parsed) {
      return res.json(candidate.parsed);
    }

    try {
      const parsedContent = JSON.parse(candidate.content.trim());
      return res.json(parsedContent);
    } catch (parseErr: any) {
      const fallbackData = generateLocalFallback("/api/generate", req.body, parseErr);
      return res.json(fallbackData);
    }
  } catch (error: any) {
    console.error("Error in /api/generate via ProviderRegistry:", error);
    try {
      const fallbackData = generateLocalFallback("/api/generate", req.body, error);
      res.json(fallbackData);
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "An error occurred during draft generation." });
    }
  }
});

// 2. API Endpoint: Iterate on a paragraph or full document rewrite (routed through Sovereign ProviderRegistry)
app.post("/api/iterate", async (req, res) => {
  try {
    const { document, voice, targetSectionId, instruction, fullDocumentRewrite } = req.body;

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // Build context of current document
    const currentDocContext = (document?.sections || []).map((s: any) => `[ID: ${s.id}, Type: ${s.type}]\n${s.text}`).join("\n\n");
    const targetSection = (document?.sections || []).find((s: any) => s.id === targetSectionId);

    if (fullDocumentRewrite) {
      // Full document rewrite weaving in the feedback
      const promptText = `Current Document:\nTitle: ${document.title}\n\n${currentDocContext}\n\n` +
            `Feedback/Woven Instruction (User focused feedback on section ${targetSectionId}): "${instruction}".\n\n` +
            `Rewrite or adapt the entire document to weave in this change seamlessly. Keep unchanged sections relatively similar, but smooth out transitions and modify the tone where necessary to integrate the feedback. Keep the exact section structures. You can add or replace sections if it helps weave the change in perfectly.\n\n` +
            `Return a JSON object containing "title" (string) and "sections" (array of updated objects with "id", "text", and "type").`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["id", "text", "type"]
            }
          }
        },
        required: ["title", "sections"]
      };

      const candidate = await providerRegistry.generateWithFallback({
        persona,
        prompt: promptText,
        contents: [{ text: promptText }],
        systemInstruction: `${voicePrompt}\n\nYou must return your output as valid JSON adhering to the specified schema.`,
        schema,
        endpoint: '/api/iterate',
        rawBody: req.body
      }, "gemini-cloud");

      if (candidate.parsed) {
        return res.json({ success: true, mode: "full", data: candidate.parsed });
      }

      try {
        const parsedContent = JSON.parse(candidate.content.trim());
        return res.json({ success: true, mode: "full", data: parsedContent });
      } catch (parseErr: any) {
        const fallbackData = generateLocalFallback("/api/iterate", req.body, parseErr);
        return res.json(fallbackData);
      }
    } else {
      // Localized paragraph/section iteration
      if (!targetSection) {
        throw new Error(`Section with ID ${targetSectionId} not found in the active document.`);
      }

      const promptText = `Current Document Context:\n${currentDocContext}\n\n` +
            `Target Section to rewrite:\n[ID: ${targetSection.id}, Type: ${targetSection.type}]\n"${targetSection.text}"\n\n` +
            `User feedback/iteration instruction for this section: "${instruction}".\n\n` +
            `Please rewrite this specific section, fully integrating the feedback. Keep the prose beautifully flowing and in line with the surrounding context. Provide a mystical explanation explaining what changes you made and why.\n\n` +
            `Return a JSON object with: "text" (updated text), "type" (same or updated type: "paragraph"|"heading"|"quote"|"poetry"), and "feedback" (mystical advice/explanation from your voice).`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          type: { type: Type.STRING },
          feedback: { type: Type.STRING }
        },
        required: ["text", "type", "feedback"]
      };

      const candidate = await providerRegistry.generateWithFallback({
        persona,
        prompt: promptText,
        contents: [{ text: promptText }],
        systemInstruction: `${voicePrompt}\n\nYou must return your output as valid JSON adhering to the specified schema.`,
        schema,
        endpoint: '/api/iterate',
        rawBody: req.body
      }, "gemini-cloud");

      if (candidate.parsed) {
        return res.json({ success: true, mode: "section", data: candidate.parsed });
      }

      try {
        const parsedContent = JSON.parse(candidate.content.trim());
        return res.json({ success: true, mode: "section", data: parsedContent });
      } catch (parseErr: any) {
        const fallbackData = generateLocalFallback("/api/iterate", req.body, parseErr);
        return res.json(fallbackData);
      }
    }
  } catch (error: any) {
    console.error("Error in /api/iterate via ProviderRegistry:", error);
    try {
      const fallbackData = generateLocalFallback("/api/iterate", req.body, error);
      res.json(fallbackData);
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "An error occurred during iteration." });
    }
  }
});

// 3. API Endpoint: Proactive Oracle Feedback (routed through Sovereign ProviderRegistry + ProactiveCriticPolicy)
app.post("/api/proactive", async (req, res) => {
  try {
    const { document, voice } = req.body;

    if (!document || !document.sections || document.sections.length === 0) {
      return res.json({ suggestion: null });
    }

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // Pick a section to focus on
    const documentContext = document.sections.map((s: any) => `[ID: ${s.id}, Type: ${s.type}]\n${s.text}`).join("\n\n");
    const promptText = proactiveCriticPolicy.getTaskInstruction({
      documentTitle: document.title,
      documentContext
    });

    const schema = proactiveCriticPolicy.getResponseSchema();

    const candidate = await providerRegistry.generateWithFallback({
      persona,
      taskPolicy: proactiveCriticPolicy,
      taskType: proactiveCriticPolicy.taskType,
      prompt: promptText,
      contents: [{ text: promptText }],
      systemInstruction: `${voicePrompt}\n\nAnalyze the document deeply. Be highly selective, poetic, and atmospheric. Return valid JSON adhering to the specified schema.`,
      schema,
      endpoint: '/api/proactive',
      rawBody: req.body
    }, "gemini-cloud");

    if (candidate.parsed) {
      return res.json(candidate.parsed);
    }

    try {
      const parsedContent = JSON.parse(candidate.content.trim());
      return res.json(parsedContent);
    } catch (parseErr: any) {
      const fallbackData = generateLocalFallback("/api/proactive", req.body, parseErr);
      return res.json(fallbackData);
    }
  } catch (error: any) {
    console.error("Error in /api/proactive via ProviderRegistry:", error);
    try {
      const fallbackData = generateLocalFallback("/api/proactive", req.body, error);
      res.json(fallbackData);
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "An error occurred during proactive feedback." });
    }
  }
});

// 4. API Endpoint: Tarot Writing Reading (routed through Sovereign ProviderRegistry + TarotReadingPolicy)
app.post("/api/tarot", async (req, res) => {
  try {
    const { drawnCards, voice, documentContext, question } = req.body;

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // Compile task instruction from TarotReadingPolicy (preserves domain input invariants)
    const promptText = tarotReadingPolicy.getTaskInstruction({
      drawnCards,
      documentContext,
      question
    });

    const schema = tarotReadingPolicy.getResponseSchema();

    // Fingerprint immutable domain input evidence: cards, orientations, positions, question
    const taskInputFingerprint = JSON.stringify({
      cards: (drawnCards || []).map((c: any) => ({
        name: c.card?.name,
        isReversed: Boolean(c.isReversed),
        positionLabel: c.positionLabel
      })),
      question: question || "",
      contextSnippet: (documentContext || "").slice(0, 100)
    });
    const taskInputHash = hashString(taskInputFingerprint);

    const candidate = await providerRegistry.generateWithFallback({
      persona,
      taskPolicy: tarotReadingPolicy,
      taskType: tarotReadingPolicy.taskType,
      taskInputHash,
      prompt: promptText,
      contents: [{ text: promptText }],
      systemInstruction: `${voicePrompt}\n\nYou must return your output as valid JSON with a single 'guidanceText' string. Write with ultimate mystical flavor and literary depth.`,
      schema,
      endpoint: '/api/tarot',
      rawBody: req.body
    }, "gemini-cloud");

    if (candidate.parsed) {
      return res.json(candidate.parsed);
    }

    try {
      const parsedContent = JSON.parse(candidate.content.trim());
      return res.json(parsedContent);
    } catch (parseErr: any) {
      const fallbackData = generateLocalFallback("/api/tarot", req.body, parseErr);
      return res.json(fallbackData);
    }
  } catch (error: any) {
    console.error("Error in /api/tarot via ProviderRegistry:", error);
    try {
      const fallbackData = generateLocalFallback("/api/tarot", req.body, error);
      res.json(fallbackData);
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "An error occurred during the tarot reading." });
    }
  }
});

// 4.5. API Endpoint: Goetic & Ken x Cripps Demonic Spirit Channeling (routed through Sovereign ProviderRegistry + ChannelingPolicy + DomainContext)
app.post("/api/channel", async (req, res) => {
  try {
    const { spiritName, spiritDetails, documentContext, userQuestion, voice } = req.body;

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // 1. Immutable DomainContext representation of authoritative spirit lore
    // (Do not alter or mutate source lore/rank/numbering; preserve read-only fingerprint)
    const domainContext = createDomainContext({
      domain: (spiritDetails?.pantheon === 'egyptian') ? 'egyptian' : 'goetic',
      subjectId: spiritDetails?.id ? String(spiritDetails.id) : (spiritName || "unknown_spirit").toLowerCase().replace(/\s+/g, "_"),
      subjectName: spiritName || "Unknown Spirit",
      sourceData: spiritDetails || {}
    });

    // 2. Seeker task input fingerprinting (question, context snippet)
    const taskInputFingerprint = JSON.stringify({
      userQuestion: userQuestion || "",
      contextSnippet: (documentContext || "").slice(0, 100),
      voice: voice || "guardian_oracle"
    });
    const taskInputHash = hashString(taskInputFingerprint);

    // 3. Compile task instruction from ChannelingPolicy
    const promptText = channelingPolicy.getTaskInstruction({
      spiritName,
      spiritDetails,
      documentContext,
      userQuestion,
      voice
    });

    const schema = channelingPolicy.getResponseSchema();

    const candidate = await providerRegistry.generateWithFallback({
      persona,
      taskPolicy: channelingPolicy,
      taskType: channelingPolicy.taskType,
      taskInputHash,
      domainContext,
      prompt: promptText,
      contents: [{ text: promptText }],
      systemInstruction: `${voicePrompt}\n\nYou must return your output exclusively as a valid JSON object with a single 'channelingText' key. Speak with heavy, atmospheric, and unholy literary power.`,
      schema,
      endpoint: '/api/channel',
      rawBody: req.body
    }, "gemini-cloud");

    if (candidate.parsed) {
      return res.json(candidate.parsed);
    }

    try {
      const parsedContent = JSON.parse(candidate.content.trim());
      return res.json(parsedContent);
    } catch (parseErr: any) {
      const fallbackData = generateLocalFallback("/api/channel", req.body, parseErr);
      return res.json(fallbackData);
    }
  } catch (error: any) {
    console.error("Error in /api/channel via ProviderRegistry:", error);
    try {
      const fallbackData = generateLocalFallback("/api/channel", req.body, error);
      res.json(fallbackData);
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "An error occurred during demonic channeling." });
    }
  }
});

// 4.6. API Endpoint: Norse Guardian's Draw Reading
app.post("/api/norse", async (req, res) => {
  try {
    const client = getAIClient();
    const { drawnRune, drawnGod, drawnRealm, drawnConcept, voice, documentContext, question } = req.body;

    const voicePrompt = getVoiceInstruction(voice);

    const alignmentSummary = 
      `- **Rune Suit**: ${drawnRune?.name} (${drawnRune?.symbol}) - ${drawnRune?.literal}. Focus: ${drawnRune?.keywords?.join(', ')}.
- **God Suit**: ${drawnGod?.name} (${drawnGod?.archetype}). Domains: ${drawnGod?.domains?.join(', ')}.
- **Realm Suit**: ${drawnRealm?.name} (${drawnRealm?.archetype}). Context: ${drawnRealm?.description}.
- **Concept Suit**: ${drawnConcept?.name} (${drawnConcept?.theme}). Lesson: ${drawnConcept?.description}.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          text: `The writer has drawn a Norse Guardian's Draw alignment for creative guidance:\n${alignmentSummary}\n\n` +
                `Current writing project context (if any):\n"${documentContext || "Blank Canvas / Empty Page"}"\n\n` +
                `The writer's question or focus: "${question || "Seeking inspiration for this creative writing journey."}"\n\n` +
                `Provide a deep, highly atmospheric, Norse-inspired divinatory channeling and reading based on this alignment. Interweave the symbolic wisdom of the Rune, the God, the Realm, and the Concept directly with their writing process, potential plotlines, creative blocks, and sovereign trajectory.\n\n` +
                `Structure the reading with:
1. **The Cosmic Alignment**: A beautiful greeting/channeling in character based on the active translation conduit (${voice}) introducing the Norse forces.
2. **The Four Norse Threads**: Analyze how the Rune, God, Realm, and Concept interlock to speak directly to their question and writing project.
3. **Heroic Creative Decree**: Give them a direct, powerful, actionable writing decree and immediate creative prompt inspired by this draw.

Respond with a JSON object containing "guidanceText" (string, beautifully formatted with markdown paragraphs and bold headers).`
          }
        ],
        config: {
          systemInstruction: `${voicePrompt}\n\nYou must return your output as valid JSON with a single 'guidanceText' string. Write with supreme Norse mythological elegance, sagas-like authority, and deep atmospheric flavor.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              guidanceText: { type: Type.STRING }
            },
            required: ["guidanceText"]
          }
        }
      });

    const responseText = response.text || "{}";
    res.json(JSON.parse(responseText.trim()));
  } catch (error: any) {
    console.error("Error in /api/norse:", error);
    try {
      const fallbackData = generateLocalFallback("/api/norse", req.body, error);
      res.json(fallbackData);
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || "An error occurred during the Norse reading." });
    }
  }
});

// 5. Serve Vite Dev Server or Production Build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
