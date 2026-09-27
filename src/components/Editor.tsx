import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  AlignLeft, 
  Heading1, 
  Quote, 
  Music, 
  CornerDownLeft, 
  Check, 
  X, 
  Loader2, 
  Flame, 
  Compass, 
  CornerRightDown,
  ArrowRight,
  Eye,
  RefreshCcw,
  Zap,
  BookOpen
} from 'lucide-react';
import { DocumentState, DocumentSection, ActiveSuggestion, VoiceType, TierType } from '../types';
import { spendAltarCharge, getAltarConfigTier } from '../altarStore';
import AltarDepletedModal from './AltarDepletedModal';

interface EditorProps {
  documentState: DocumentState;
  onChange: (doc: DocumentState) => void;
  voice: VoiceType;
  isAIActive: boolean;
  onAddHistory: (prompt: string, response: string, type: 'iteration' | 'proactive') => void;
  tier?: TierType;
  onNavigateToTiers?: () => void;
  userId?: string;
}

export default function Editor({ 
  documentState, 
  onChange, 
  voice, 
  isAIActive, 
  onAddHistory,
  tier = 'free',
  onNavigateToTiers,
  userId = 'guest'
}: EditorProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [iteratingSectionId, setIteratingSectionId] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ id: string; text: string } | null>(null); // For showing the mystical comment
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Altar Depleted Modal States
  const [isAltarModalOpen, setIsAltarModalOpen] = useState(false);
  const [altarChargeForModal, setAltarChargeForModal] = useState(100);
  const [altarActionForModal, setAltarActionForModal] = useState<'ritual' | 'tarotSpread' | 'invokeVision' | 'blendMode'>('invokeVision');

  // Proactive suggestion state
  const [proactiveSuggestion, setProactiveSuggestion] = useState<ActiveSuggestion | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const proactiveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger proactive scanning when the document structure changes (or after a typing pause)
  useEffect(() => {
    if (!isAIActive || documentState.sections.length === 0 || quotaExceeded) return;

    // Clear previous timer
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
    }

    // Set a debounced timer for 25 seconds of inactivity to trigger proactive feedback
    proactiveTimerRef.current = setTimeout(() => {
      triggerProactiveScan(false);
    }, 25000);

    return () => {
      if (proactiveTimerRef.current) {
        clearTimeout(proactiveTimerRef.current);
      }
    };
  }, [documentState, voice, isAIActive, quotaExceeded]);

  // Automatically adjust heights of all textareas when the document state changes
  // to prevent visual clipping/cutoff when loaded from localStorage or after an AI rewrite
  useEffect(() => {
    const adjustHeights = () => {
      const textareas = document.querySelectorAll('#chronicle-canvas-container textarea, #inline-ai-feedback-drawer textarea');
      textareas.forEach(textarea => {
        const el = textarea as HTMLTextAreaElement;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      });
    };

    adjustHeights();
    const timeoutId = setTimeout(adjustHeights, 100);
    const timeoutId2 = setTimeout(adjustHeights, 500); // safety fallback for slow font loading
    
    window.addEventListener('resize', adjustHeights);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      window.removeEventListener('resize', adjustHeights);
    };
  }, [documentState]);

  const triggerProactiveScan = async (isManual = false) => {
    if (isScanning || loadingAI) return;

    // Check and spend Altar Charge ONLY if neophyte
    const configTier = getAltarConfigTier(tier);
    if (configTier === 'neophyte') {
      const gate = await spendAltarCharge(userId, configTier, 'invokeVision');
      if (!gate.allowed) {
        if (isManual) {
          setAltarChargeForModal(gate.charge);
          setAltarActionForModal('invokeVision');
          setIsAltarModalOpen(true);
        }
        return;
      }
    }

    setIsScanning(true);
    setQuotaExceeded(false);
    try {
      const response = await fetch('/api/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: documentState,
          voice
        })
      });

      if (response.ok) {
        const suggestion = await response.json();
        if (suggestion && suggestion.sectionId) {
          // Double check if the section still exists in current doc
          if (documentState.sections.some(s => s.id === suggestion.sectionId)) {
            setProactiveSuggestion({
              id: Math.random().toString(),
              sectionId: suggestion.sectionId,
              originalText: documentState.sections.find(s => s.id === suggestion.sectionId)?.text || '',
              suggestedText: suggestion.suggestedText,
              feedback: suggestion.feedback,
              voice,
              type: 'proactive_feedback'
            });
          }
        } else {
          if (isManual) {
            alert("The Oracle gazes upon your prose and finds it completely pristine. No further elevation is required right now.");
          }
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429 || (errData.error && errData.error.toLowerCase().includes("quota"))) {
          setQuotaExceeded(true);
          if (isManual) {
            alert("The Oracle is resting in silent contemplation (Gemini API Daily Quota Exceeded). Please try again later or configure a premium billing key in the settings to clear the pathways.");
          }
        } else {
          console.error("Proactive scan failed:", errData.error || response.statusText);
          if (isManual) {
            alert(`The Oracle failed to respond: ${errData.error || response.statusText}`);
          }
        }
      }
    } catch (err: any) {
      console.error("Proactive scan failed:", err);
      if (isManual) {
        alert(`The Oracle failed to respond: ${err.message}`);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const updateSectionText = (id: string, text: string) => {
    const updatedSections = documentState.sections.map(s => 
      s.id === id ? { ...s, text } : s
    );
    onChange({ ...documentState, sections: updatedSections });
  };

  const changeSectionType = (id: string, type: DocumentSection['type']) => {
    const updatedSections = documentState.sections.map(s => 
      s.id === id ? { ...s, type } : s
    );
    onChange({ ...documentState, sections: updatedSections });
  };

  const addSectionAfter = (id: string) => {
    const index = documentState.sections.findIndex(s => s.id === id);
    const newSection: DocumentSection = {
      id: `sec-${Date.now()}`,
      text: '',
      type: 'paragraph'
    };
    const updatedSections = [...documentState.sections];
    updatedSections.splice(index + 1, 0, newSection);
    onChange({ ...documentState, sections: updatedSections });
    setActiveSectionId(newSection.id);
  };

  const deleteSection = (id: string) => {
    // Keep at least one section
    if (documentState.sections.length <= 1) return;
    const updatedSections = documentState.sections.filter(s => s.id !== id);
    onChange({ ...documentState, sections: updatedSections });
    if (activeSectionId === id) {
      setActiveSectionId(null);
    }
    // Clean up suggestion if related
    if (proactiveSuggestion?.sectionId === id) {
      setProactiveSuggestion(null);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...documentState, title: e.target.value });
  };

  // Perform AI rewrite (localized or global weave-in)
  const invokeAIRewrite = async (fullRewrite: boolean) => {
    if (!activeSectionId || !feedbackInput.trim()) return;

    // Check and spend Altar Charge
    const configTier = getAltarConfigTier(tier);
    const gate = await spendAltarCharge(userId, configTier, 'invokeVision');
    if (!gate.allowed) {
      setAltarChargeForModal(gate.charge);
      setAltarActionForModal('invokeVision');
      setIsAltarModalOpen(true);
      return;
    }
    
    setLoadingAI(true);
    setIteratingSectionId(activeSectionId);
    setAiFeedback(null);

    try {
      const response = await fetch('/api/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: documentState,
          voice,
          targetSectionId: activeSectionId,
          instruction: feedbackInput,
          fullDocumentRewrite: fullRewrite
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Iteration failed');
      }

      const result = await response.json();
      
      if (fullRewrite) {
        // Global update
        onChange({
          ...documentState,
          title: result.data.title,
          sections: result.data.sections
        });
        onAddHistory(
          `Weave feedback: "${feedbackInput}" globally starting from block ${activeSectionId}`,
          `Rewrote full document sections.`,
          'iteration'
        );
        setFeedbackInput('');
        setActiveSectionId(null);
      } else {
        // Local update
        const updatedSections = documentState.sections.map(s => 
          s.id === activeSectionId 
            ? { ...s, text: result.data.text, type: result.data.type as any } 
            : s
        );
        onChange({ ...documentState, sections: updatedSections });
        setAiFeedback({
          id: activeSectionId,
          text: result.data.feedback
        });
        onAddHistory(
          `Local rewrite block ${activeSectionId} with feedback: "${feedbackInput}"`,
          `Result: "${result.data.text}"\n\nOracle feedback: ${result.data.feedback}`,
          'iteration'
        );
        setFeedbackInput('');
      }
    } catch (err: any) {
      console.error(err);
      alert(`The mystic channels failed to respond: ${err.message}`);
    } finally {
      setLoadingAI(false);
      setIteratingSectionId(null);
    }
  };

  // Accept proactive oracle suggestion
  const acceptProactiveSuggestion = () => {
    if (!proactiveSuggestion) return;
    const updatedSections = documentState.sections.map(s => 
      s.id === proactiveSuggestion.sectionId 
        ? { ...s, text: proactiveSuggestion.suggestedText } 
        : s
    );
    onChange({ ...documentState, sections: updatedSections });
    onAddHistory(
      `Accepted proactive suggestion for block ${proactiveSuggestion.sectionId}`,
      `New Prose: "${proactiveSuggestion.suggestedText}"\n\nFeedback: ${proactiveSuggestion.feedback}`,
      'proactive'
    );
    setProactiveSuggestion(null);
  };

  return (
    <div className="space-y-6 relative" id="editor-container">
      {/* Workspace Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d0d0f]/60 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-myth-gold animate-pulse" />
          <span className="font-serif text-sm tracking-wider text-gray-400">Chronicle Canvas</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Manual scan trigger */}
          <button
            onClick={() => triggerProactiveScan(true)}
            disabled={isScanning || loadingAI}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-myth-gold/30 text-gray-300 hover:text-myth-gold text-xs px-3.5 py-1.5 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none font-mono"
            title="Ask the Oracle to analyze the page and propose improvements"
          >
            {isScanning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-myth-gold" />
            )}
            <span>Invoke Vision</span>
          </button>
        </div>
      </div>

      {/* Quota limit notice */}
      <AnimatePresence>
        {quotaExceeded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-950/20 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl font-mono text-center flex items-center justify-center gap-2 overflow-hidden"
          >
            <Zap className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" />
            <span>The Oracle is resting in silent contemplation. (Gemini API Daily Quota Exceeded. You can retry shortly or configure a premium key in Settings.)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Scanning Indicator */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 right-4 flex items-center gap-1.5 text-xs text-myth-gold font-mono bg-[#110e17] px-3 py-1 rounded-full border border-myth-gold/25 z-10"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Oracle Scanning Lines...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive Suggestion Warning/Trigger Alert */}
      <AnimatePresence>
        {proactiveSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className={`border rounded-2xl p-5 overflow-hidden shadow-xl ${
              voice === 'ember_ur' 
                ? 'bg-[#180d08] border-myth-ember/40 shadow-myth-ember/5' 
                : 'bg-[#0b0c16] border-myth-gold/30 shadow-myth-gold/5'
            }`}
            key="proactive-alert"
          >
            <div className="flex items-center justify-between mb-3 border-b border-myth-slate/30 pb-2">
              <div className="flex items-center gap-2">
                {voice === 'ember_ur' 
                  ? <Flame className="w-5 h-5 text-myth-ember animate-pulse" /> 
                  : <Eye className="w-5 h-5 text-myth-gold animate-pulse" />
                }
                <h4 className="font-serif text-sm tracking-wider text-gray-200">
                  {voice === 'ember_ur' ? 'EMBER UR Has Seen A Vision!' : 'The Guardian Oracle Proposes a Path!'}
                </h4>
              </div>
              <button 
                onClick={() => setProactiveSuggestion(null)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5">
                <div className="text-[10px] font-mono text-gray-500 uppercase">Original Line</div>
                <div className="bg-myth-bg/40 p-3 rounded-xl border border-myth-slate/35 text-gray-400 line-through select-none">
                  {proactiveSuggestion.originalText || "(Empty)"}
                </div>
                <div className="bg-[#120e1a]/80 p-3 rounded-xl border border-myth-slate/40 text-gray-300 italic">
                  <span className="font-mono text-myth-gold block mb-1 text-[10px]">THE VOICE CRITIQUE:</span>
                  "{proactiveSuggestion.feedback}"
                </div>
              </div>

              <div className="space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-myth-gold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-myth-gold" />
                    Mystical Manifestation
                  </div>
                  <div className="bg-[#15121c] p-3 rounded-xl border border-myth-gold/30 text-gray-200 font-sans leading-relaxed shadow-inner">
                    {proactiveSuggestion.suggestedText}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 self-end w-full">
                  <button
                    onClick={() => setProactiveSuggestion(null)}
                    className="flex-1 bg-myth-slate hover:bg-opacity-80 text-gray-400 py-2 rounded-xl text-xs transition-colors font-semibold"
                  >
                    Decline
                  </button>
                  <button
                    onClick={acceptProactiveSuggestion}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                      voice === 'ember_ur'
                        ? 'bg-myth-ember hover:bg-opacity-90 text-white'
                        : 'bg-myth-gold hover:bg-opacity-90 text-myth-bg font-bold'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept & Weave In
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Document Canvas */}
      <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl shadow-2xl p-8 md:p-12 min-h-[600px] flex flex-col space-y-8 relative">
        
        {/* Document Title input */}
        <textarea
          value={documentState.title}
          onChange={(e) => {
            handleTitleChange(e);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          rows={1}
          placeholder="Give your creation a name..."
          className="w-full bg-transparent border-b border-white/5 pb-3 text-3xl font-serif italic text-white/90 placeholder-white/20 focus:outline-none focus:border-amber-500/40 transition-all tracking-wide resize-none overflow-hidden leading-relaxed pt-2"
          id="editor-title-input"
          ref={(el) => {
            if (el) {
              el.style.height = 'auto';
              el.style.height = `${el.scrollHeight}px`;
            }
          }}
        />

        {/* Dynamic Section Blocks */}
        <div className="space-y-6 flex-grow">
          {documentState.sections.map((section, index) => {
            const isActive = activeSectionId === section.id;
            const isIterating = iteratingSectionId === section.id;

            return (
              <div 
                key={section.id}
                className="group relative transition-all duration-300"
              >
                {/* Floating sidebar format & control panel */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex flex-col gap-1 items-center bg-[#16161a] border border-white/10 p-1 rounded-lg shadow-lg z-10 transition-opacity">
                  <button
                    onClick={() => changeSectionType(section.id, 'paragraph')}
                    className={`p-1.5 rounded hover:bg-white/5 transition-colors ${section.type === 'paragraph' ? 'text-amber-500' : 'text-gray-500'}`}
                    title="Paragraph"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => changeSectionType(section.id, 'heading')}
                    className={`p-1.5 rounded hover:bg-white/5 transition-colors ${section.type === 'heading' ? 'text-amber-500' : 'text-gray-500'}`}
                    title="Heading"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => changeSectionType(section.id, 'quote')}
                    className={`p-1.5 rounded hover:bg-white/5 transition-colors ${section.type === 'quote' ? 'text-amber-500' : 'text-gray-500'}`}
                    title="Quote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => changeSectionType(section.id, 'poetry')}
                    className={`p-1.5 rounded hover:bg-white/5 transition-colors ${section.type === 'poetry' ? 'text-amber-500' : 'text-gray-500'}`}
                    title="Poetry/Verse"
                  >
                    <Music className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Main section editable wrapper */}
                <div 
                  className={`rounded-xl border transition-all duration-300 p-4 ${
                    isIterating 
                      ? 'border-dashed border-amber-500/40 bg-white/[0.01]' 
                      : isActive 
                        ? voice === 'ember_ur' 
                          ? 'border-red-500/30 bg-red-950/10' 
                          : 'border-amber-500/30 bg-amber-950/10'
                        : 'border-transparent hover:border-white/5 hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Textarea depending on block type */}
                  {section.type === 'heading' && (
                    <input
                      type="text"
                      value={section.text}
                      onChange={(e) => updateSectionText(section.id, e.target.value)}
                      onFocus={() => setActiveSectionId(section.id)}
                      placeholder="Enter section heading..."
                      className="w-full bg-transparent font-serif italic text-2xl text-white/90 focus:outline-none placeholder-white/20"
                    />
                  )}

                  {section.type === 'paragraph' && (
                    <textarea
                      value={section.text}
                      onChange={(e) => {
                        updateSectionText(section.id, e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onFocus={() => setActiveSectionId(section.id)}
                      placeholder="Start typing freely..."
                      rows={1}
                      className="w-full bg-transparent font-serif text-lg text-white/70 focus:outline-none placeholder-white/20 leading-relaxed resize-none overflow-hidden"
                      ref={(el) => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                    />
                  )}

                  {section.type === 'quote' && (
                    <div className="flex gap-3 border-l-2 border-amber-500/40 pl-3 py-1 italic">
                      <textarea
                        value={section.text}
                        onChange={(e) => {
                          updateSectionText(section.id, e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onFocus={() => setActiveSectionId(section.id)}
                        placeholder="Insert a mystical citation..."
                        rows={1}
                        className="w-full bg-transparent font-serif text-lg text-white/60 focus:outline-none placeholder-white/20 leading-relaxed resize-none overflow-hidden"
                        ref={(el) => {
                          if (el) {
                            el.style.height = 'auto';
                            el.style.height = `${el.scrollHeight}px`;
                          }
                        }}
                      />
                    </div>
                  )}

                  {section.type === 'poetry' && (
                    <div className="pl-6 text-center md:text-left">
                      <textarea
                        value={section.text}
                        onChange={(e) => {
                          updateSectionText(section.id, e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onFocus={() => setActiveSectionId(section.id)}
                        placeholder="Weave structured poetry/verse..."
                        rows={1}
                        className="w-full bg-transparent font-serif text-lg tracking-wide text-amber-100/80 focus:outline-none placeholder-white/20 leading-loose resize-none overflow-hidden italic"
                        ref={(el) => {
                          if (el) {
                            el.style.height = 'auto';
                            el.style.height = `${el.scrollHeight}px`;
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Block action tray (shows up when active or focused) */}
                  {isActive && !isIterating && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 mr-2">Active Block:</span>
                        <button
                          onClick={() => addSectionAfter(section.id)}
                          className="flex items-center gap-1 hover:bg-white/5 text-gray-400 hover:text-white text-[10px] px-2.5 py-1 rounded border border-white/5 transition-colors cursor-pointer"
                          title="Add block after"
                        >
                          <Plus className="w-3 h-3" /> Insert Block
                        </button>
                        <button
                          onClick={() => {
                            const newAnnotation = window.prompt("Enter lore annotation or margin comment for this block:", section.annotation || "");
                            if (newAnnotation !== null) {
                              const updatedSections = documentState.sections.map(s => 
                                s.id === section.id ? { ...s, annotation: newAnnotation.trim() || undefined } : s
                              );
                              onChange({ ...documentState, sections: updatedSections });
                            }
                          }}
                          className="flex items-center gap-1 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 text-[10px] px-2.5 py-1 rounded border border-amber-500/10 transition-colors cursor-pointer"
                          title="Add inline annotation"
                        >
                          <BookOpen className="w-3 h-3" /> {section.annotation ? 'Edit Annotation' : 'Annotate'}
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          disabled={documentState.sections.length <= 1}
                          className="flex items-center gap-1 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-[10px] px-2.5 py-1 rounded border border-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title="Delete block"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-amber-500/80 italic flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" /> Focused co-writing active
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Iteration Spinner overlay */}
                  {isIterating && (
                    <div className="flex items-center gap-2 text-xs text-amber-500 mt-2">
                      <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                      <span>
                        {voice === 'ember_ur' 
                          ? "Ember Ur is hammering the words on the volcanic anvil..." 
                          : "The Oracle is weaving this line through the cosmic loom..."}
                      </span>
                    </div>
                  )}

                  {/* Showing current block's AI mystical commentary if exists */}
                  {aiFeedback && aiFeedback.id === section.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-black/40 border border-white/5 rounded-lg text-xs flex items-start gap-2.5"
                    >
                      <span className="text-[10px] uppercase font-mono text-amber-500/80 mt-0.5 block">Oracle Commentary:</span>
                      <p className="text-white/60 leading-relaxed flex-1 italic">"{aiFeedback.text}"</p>
                      <button 
                        onClick={() => setAiFeedback(null)}
                        className="text-white/40 hover:text-white text-[10px]"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  )}

                  {/* Annotation Badge/Indicator */}
                  {section.annotation && (
                    <div className="mt-2.5 text-[10px] font-mono text-amber-500/80 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2 max-w-full">
                      <BookOpen className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" />
                      <div className="flex-1 text-left">
                        <span className="text-[8px] uppercase tracking-wider text-white/30 block mb-0.5">Loom Annotation:</span>
                        <span className="italic leading-normal font-serif text-white/70">"{section.annotation}"</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updatedSections = documentState.sections.map(s => 
                            s.id === section.id ? { ...s, annotation: undefined } : s
                          );
                          onChange({ ...documentState, sections: updatedSections });
                        }}
                        className="text-white/30 hover:text-red-400 font-bold ml-1 cursor-pointer"
                        title="Remove annotation"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Footer buttons to append block */}
        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              const lastSec = documentState.sections[documentState.sections.length - 1];
              addSectionAfter(lastSec.id);
            }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-myth-gold transition-colors font-mono font-medium"
          >
            <Plus className="w-4 h-4" /> Append New Block
          </button>
          
          <span className="text-gray-600 font-mono text-[10px]">
            {documentState.sections.reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0)} Words
          </span>
        </div>
      </div>

      {/* Persistent Inline AI Feedback Drawer */}
      <AnimatePresence>
        {activeSectionId && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-[#16161a] border border-white/10 rounded-2xl p-5 shadow-2xl relative"
            id="inline-ai-feedback-drawer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-serif italic text-sm tracking-wider text-white/90">
                  Refine Block with {voice === 'ember_ur' ? 'Ember Ur' : 'Guardian Oracle'}
                </h4>
              </div>
              <button 
                onClick={() => setActiveSectionId(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/40 mb-4 leading-relaxed">
              Instead of copying and pasting, give feedback to the Oracle right here. We can rewrite just this selected paragraph or weave the edits dynamically across your whole article.
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') invokeAIRewrite(false);
                  }}
                  disabled={loadingAI}
                  placeholder={`E.g., "make this raw and poetic", "weave in themes of memory", "elaborate with stardust"`}
                  className="w-full bg-[#0d0d0f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-amber-500/40 transition-colors"
                />
                <button
                  onClick={() => invokeAIRewrite(false)}
                  disabled={loadingAI || !feedbackInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/5 p-2 rounded-lg text-amber-500 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Rewrite block"
                >
                  {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <CornerDownLeft className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => invokeAIRewrite(false)}
                disabled={loadingAI || !feedbackInput.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-amber-500" />
                Rewrite Paragraph
              </button>
              <button
                onClick={() => invokeAIRewrite(true)}
                disabled={loadingAI || !feedbackInput.trim()}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
                  voice === 'ember_ur'
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 shadow-lg'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Weave changes globally
              </button>
            </div>
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
