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
  draftGenerationPolicy,
  sectionIterationPolicy,
  proactiveCriticPolicy,
  tarotReadingPolicy,
  channelingPolicy,
  runicConsultationPolicy,
  createDomainContext,
  computeCompositeDomainFingerprint,
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

// Co-narration & Persona resolution via Sovereign PersonaRegistry
function getVoiceInstruction(voice: string): string {
  return personaRegistry.resolveVoiceDirective(voice);
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

// 1. API Endpoint: Generate initial draft (routed through Sovereign ProviderRegistry + DraftGenerationPolicy)
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, voice, attachments } = req.body;

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // Compile task instruction from DraftGenerationPolicy
    const promptText = draftGenerationPolicy.getTaskInstruction({ prompt });
    const schema = draftGenerationPolicy.getResponseSchema();

    // Fingerprint complete semantic task input
    const taskInputFingerprint = JSON.stringify({
      prompt: prompt || "",
      voice: voice || "guardian_oracle",
      attachmentsCount: attachments?.length || 0
    });
    const taskInputHash = hashString(taskInputFingerprint);

    // Convert attachments to parts for multimodal providers
    const parts: any[] = [];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.isImage) {
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
    parts.push({ text: promptText });

    const candidate = await providerRegistry.generateWithFallback({
      persona,
      taskPolicy: draftGenerationPolicy,
      taskType: draftGenerationPolicy.taskType,
      taskInputHash,
      prompt: promptText,
      contents: parts,
      systemInstruction: `${voicePrompt}\n\nYou must return your output exclusively as valid JSON adhering to the specified schema.`,
      schema,
      endpoint: '/api/generate',
      rawBody: req.body
    });

    const parsedContent = candidate.parsed || JSON.parse(candidate.content.trim());
    return res.json(parsedContent);
  } catch (error: any) {
    console.error("Error in /api/generate via ProviderRegistry:", error);
    res.status(500).json({ error: error.message || "An error occurred during draft generation." });
  }
});

// 2. API Endpoint: Iterate on a paragraph or full document rewrite (routed through Sovereign ProviderRegistry + SectionIterationPolicy)
app.post("/api/iterate", async (req, res) => {
  try {
    const { document, voice, targetSectionId, instruction, fullDocumentRewrite } = req.body;

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // Build context of current document
    const currentDocContext = (document?.sections || []).map((s: any) => `[ID: ${s.id}, Type: ${s.type}]\n${s.text}`).join("\n\n");
    const targetSection = (document?.sections || []).find((s: any) => s.id === targetSectionId);

    if (!fullDocumentRewrite && !targetSection) {
      throw new Error(`Section with ID ${targetSectionId} not found in the active document.`);
    }

    const isFullRewrite = Boolean(fullDocumentRewrite);
    const promptText = sectionIterationPolicy.getTaskInstruction({
      fullDocumentRewrite: isFullRewrite,
      documentTitle: document?.title,
      documentContext: currentDocContext,
      targetSectionId,
      targetSectionText: targetSection?.text,
      targetSectionType: targetSection?.type,
      instruction
    });

    const schema = sectionIterationPolicy.getResponseSchema({ fullDocumentRewrite: isFullRewrite });

    // Fingerprint complete semantic task input
    const taskInputFingerprint = JSON.stringify({
      fullDocumentRewrite: isFullRewrite,
      targetSectionId: targetSectionId || null,
      instruction: instruction || "",
      documentContext: currentDocContext,
      voice: voice || "guardian_oracle"
    });
    const taskInputHash = hashString(taskInputFingerprint);

    const candidate = await providerRegistry.generateWithFallback({
      persona,
      taskPolicy: sectionIterationPolicy,
      taskType: sectionIterationPolicy.taskType,
      taskInputHash,
      prompt: promptText,
      contents: [{ text: promptText }],
      systemInstruction: `${voicePrompt}\n\nYou must return your output as valid JSON adhering to the specified schema.`,
      schema,
      endpoint: '/api/iterate',
      rawBody: req.body
    });

    const parsedData = candidate.parsed || JSON.parse(candidate.content.trim());

    if (isFullRewrite) {
      return res.json({ success: true, mode: "full", data: parsedData });
    } else {
      return res.json({ success: true, mode: "section", data: parsedData });
    }
  } catch (error: any) {
    console.error("Error in /api/iterate via ProviderRegistry:", error);
    res.status(500).json({ error: error.message || "An error occurred during iteration." });
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

    // Fingerprint complete semantic task input
    const taskInputFingerprint = JSON.stringify({
      documentTitle: document.title || "",
      documentContext,
      voice: voice || "guardian_oracle"
    });
    const taskInputHash = hashString(taskInputFingerprint);

    const candidate = await providerRegistry.generateWithFallback({
      persona,
      taskPolicy: proactiveCriticPolicy,
      taskType: proactiveCriticPolicy.taskType,
      taskInputHash,
      prompt: promptText,
      contents: [{ text: promptText }],
      systemInstruction: `${voicePrompt}\n\nAnalyze the document deeply. Be highly selective, poetic, and atmospheric. Return valid JSON adhering to the specified schema.`,
      schema,
      endpoint: '/api/proactive',
      rawBody: req.body
    });

    const parsedContent = candidate.parsed || JSON.parse(candidate.content.trim());
    return res.json(parsedContent);
  } catch (error: any) {
    console.error("Error in /api/proactive via ProviderRegistry:", error);
    res.status(500).json({ error: error.message || "An error occurred during proactive feedback." });
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

    // Fingerprint immutable domain input evidence with complete documentContext
    const taskInputFingerprint = JSON.stringify({
      cards: (drawnCards || []).map((c: any) => ({
        name: c.card?.name,
        isReversed: Boolean(c.isReversed),
        positionLabel: c.positionLabel
      })),
      question: question || "",
      documentContext: documentContext || "",
      voice: voice || "guardian_oracle"
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
    });

    const parsedContent = candidate.parsed || JSON.parse(candidate.content.trim());
    return res.json(parsedContent);
  } catch (error: any) {
    console.error("Error in /api/tarot via ProviderRegistry:", error);
    res.status(500).json({ error: error.message || "An error occurred during the tarot reading." });
  }
});

// 4.5. API Endpoint: Goetic & Ken x Cripps Demonic Spirit Channeling (routed through Sovereign ProviderRegistry + ChannelingPolicy + DomainContext)
app.post("/api/channel", async (req, res) => {
  try {
    const { spiritName, spiritDetails, documentContext, userQuestion, voice } = req.body;

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // 1. Immutable DomainContext representation of authoritative spirit lore
    const domainContext = createDomainContext({
      domain: (spiritDetails?.pantheon === 'egyptian') ? 'egyptian' : 'goetic',
      subjectId: spiritDetails?.id ? String(spiritDetails.id) : (spiritName || "unknown_spirit").toLowerCase().replace(/\s+/g, "_"),
      subjectName: spiritName || "Unknown Spirit",
      sourceData: spiritDetails || {}
    });

    // 2. Seeker task input fingerprinting with complete documentContext
    const taskInputFingerprint = JSON.stringify({
      userQuestion: userQuestion || "",
      documentContext: documentContext || "",
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
    });

    const parsedContent = candidate.parsed || JSON.parse(candidate.content.trim());
    return res.json(parsedContent);
  } catch (error: any) {
    console.error("Error in /api/channel via ProviderRegistry:", error);
    res.status(500).json({ error: error.message || "An error occurred during demonic channeling." });
  }
});

// 4.6. API Endpoint: Norse Guardian's Draw Reading (routed through Sovereign ProviderRegistry + RunicConsultationPolicy + composite DomainContexts)
app.post("/api/norse", async (req, res) => {
  try {
    const { drawnRune, drawnGod, drawnRealm, drawnConcept, voice, documentContext, question } = req.body;

    const voicePrompt = getVoiceInstruction(voice);
    const persona = personaRegistry.get(voice) || personaRegistry.get("guardian_oracle")!;

    // 1. Construct individual authoritative DomainContext objects for all four Norse domain inputs
    const runeContext = createDomainContext({
      domain: 'norse',
      subjectId: drawnRune?.name ? `rune_${drawnRune.name.toLowerCase()}` : 'rune_perthro',
      subjectName: drawnRune?.name || 'Perthro',
      sourceData: drawnRune || {}
    });

    const godContext = createDomainContext({
      domain: 'norse',
      subjectId: drawnGod?.name ? `god_${drawnGod.name.toLowerCase()}` : 'god_odin',
      subjectName: drawnGod?.name || 'Odin',
      sourceData: drawnGod || {}
    });

    const realmContext = createDomainContext({
      domain: 'norse',
      subjectId: drawnRealm?.name ? `realm_${drawnRealm.name.toLowerCase()}` : 'realm_asgard',
      subjectName: drawnRealm?.name || 'Asgard',
      sourceData: drawnRealm || {}
    });

    const conceptContext = createDomainContext({
      domain: 'norse',
      subjectId: drawnConcept?.name ? `concept_${drawnConcept.name.toLowerCase()}` : 'concept_wyrd',
      subjectName: drawnConcept?.name || 'Wyrd',
      sourceData: drawnConcept || {}
    });

    const domainContexts = [runeContext, godContext, realmContext, conceptContext];
    const compositeDomainFingerprint = computeCompositeDomainFingerprint(domainContexts);

    // 2. Seeker task input fingerprinting with complete documentContext
    const taskInputFingerprint = JSON.stringify({
      question: question || "",
      documentContext: documentContext || "",
      voice: voice || "guardian_oracle"
    });
    const taskInputHash = hashString(taskInputFingerprint);

    // 3. Compile task instruction from RunicConsultationPolicy
    const promptText = runicConsultationPolicy.getTaskInstruction({
      drawnRune,
      drawnGod,
      drawnRealm,
      drawnConcept,
      voice,
      documentContext,
      question
    });

    const schema = runicConsultationPolicy.getResponseSchema();

    const candidate = await providerRegistry.generateWithFallback({
      persona,
      taskPolicy: runicConsultationPolicy,
      taskType: runicConsultationPolicy.taskType,
      taskInputHash,
      domainContext: runeContext, // primary for backward compatibility
      domainContexts,            // composite array of all 4 independent domain contexts
      compositeDomainFingerprint,
      prompt: promptText,
      contents: [{ text: promptText }],
      systemInstruction: `${voicePrompt}\n\nYou must return your output as valid JSON with a single 'guidanceText' string. Write with supreme Norse mythological elegance, sagas-like authority, and deep atmospheric flavor.`,
      schema,
      endpoint: '/api/norse',
      rawBody: req.body
    });

    const parsedContent = candidate.parsed || JSON.parse(candidate.content.trim());
    return res.json(parsedContent);
  } catch (error: any) {
    console.error("Error in /api/norse via ProviderRegistry:", error);
    res.status(500).json({ error: error.message || "An error occurred during the Norse reading." });
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
