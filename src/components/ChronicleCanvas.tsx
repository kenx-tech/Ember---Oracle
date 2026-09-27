import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, BookOpen, Clock, Sparkles, HelpCircle, Archive } from 'lucide-react';
import { DocumentState, DocumentSection, VoiceType, TierType } from '../types';
import Editor from './Editor';
import ChronicleCanvasHistory, { ChronicleVersion } from './ChronicleCanvasHistory';

interface ChronicleCanvasProps {
  documentState: DocumentState;
  onChange: (doc: DocumentState) => void;
  voice: VoiceType;
  isAIActive: boolean;
  onAddHistory: (prompt: string, response: string, type: 'iteration' | 'proactive') => void;
  isDistractionFree?: boolean;
  tier?: TierType;
  onNavigateToTiers?: () => void;
  userId?: string;
}

export default function ChronicleCanvas({
  documentState,
  onChange,
  voice,
  isAIActive,
  onAddHistory,
  isDistractionFree = false,
  tier,
  onNavigateToTiers,
  userId
}: ChronicleCanvasProps) {
  const [activeSideTab, setActiveSideTab] = useState<'branches' | 'annotations'>('branches');
  const [versions, setVersions] = useState<ChronicleVersion[]>([]);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [isSnapshotFormOpen, setIsSnapshotFormOpen] = useState(false);

  // Persistence helpers matching window.storage standard
  const getStorageItem = (key: string): string | null => {
    if (typeof window !== 'undefined' && (window as any).storage && typeof (window as any).storage.get === 'function') {
      return (window as any).storage.get(key) || null;
    }
    return localStorage.getItem(key);
  };

  const setStorageItem = (key: string, value: string) => {
    if (typeof window !== 'undefined' && (window as any).storage && typeof (window as any).storage.set === 'function') {
      (window as any).storage.set(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  };

  // Load versions timeline on mount
  useEffect(() => {
    const saved = getStorageItem('chronicle_branches_v1');
    if (saved) {
      try {
        setVersions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse chronicle branches:', e);
      }
    }
  }, []);

  // Save a custom snapshot branch manually
  const createManualSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotLabel.trim()) return;
    saveSnapshot(snapshotLabel.trim());
    setSnapshotLabel('');
    setIsSnapshotFormOpen(false);
  };

  // Generic snapshot function
  const saveSnapshot = (description: string) => {
    const newVersion: ChronicleVersion = {
      id: `ver-${Date.now()}`,
      timestamp: new Date().toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      changeDescription: description,
      sections: JSON.parse(JSON.stringify(documentState.sections)),
      title: documentState.title
    };

    const updated = [newVersion, ...versions];
    setVersions(updated);
    setStorageItem('chronicle_branches_v1', JSON.stringify(updated));
  };

  // Auto-backup whenever an AI rewrite is about to occur
  // We can track document updates or let restorations trigger back-ups automatically.
  const handleRestoreVersion = (version: ChronicleVersion) => {
    // 1. Create a backup of the CURRENT state first so they can undo restores!
    const currentWordCount = documentState.sections.reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0);
    saveSnapshot(`Auto Backup before restoring [${version.changeDescription}] (${currentWordCount} words)`);

    // 2. Restore active state
    onChange({
      ...documentState,
      title: version.title,
      sections: JSON.parse(JSON.stringify(version.sections))
    });
  };

  const handleDeleteVersion = (id: string) => {
    const updated = versions.filter(v => v.id !== id);
    setVersions(updated);
    setStorageItem('chronicle_branches_v1', JSON.stringify(updated));
  };

  const handleClearTimeline = () => {
    setVersions([]);
    setStorageItem('chronicle_branches_v1', JSON.stringify([]));
  };

  // Extract all sections that currently have annotations
  const annotatedSections = documentState.sections.filter(s => s.annotation && s.annotation.trim().length > 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start" id="chronicle-canvas-container">
      {/* Left Panel: Main Editor */}
      <div className="flex-1 w-full">
        <Editor
          documentState={documentState}
          onChange={(newDoc) => {
            // If the user accepted an iteration, we might want to auto-backup.
            // Our normal editor updates will propagate through onChange.
            onChange(newDoc);
          }}
          voice={voice}
          isAIActive={isAIActive}
          onAddHistory={(prompt, response, type) => {
            // Auto-snapshot the preceding state to branching timeline before AI overrides it!
            const wordCount = documentState.sections.reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0);
            saveSnapshot(`Pre-Iteration snapshot (${wordCount} words)`);
            onAddHistory(prompt, response, type);
          }}
          tier={tier}
          onNavigateToTiers={onNavigateToTiers}
          userId={userId}
        />
      </div>

      {/* Right Panel: The Astral Loom (Branches and Annotations Gutter) */}
      {!isDistractionFree && (
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Archive className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                <h3 className="font-serif text-sm tracking-wider text-white font-semibold">Astral Loom console</h3>
              </div>

              {/* Manual snapshot trigger */}
              <button
                onClick={() => setIsSnapshotFormOpen(!isSnapshotFormOpen)}
                className="text-[9px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg font-mono transition-all cursor-pointer"
              >
                {isSnapshotFormOpen ? 'Cancel' : 'Manual Save'}
              </button>
            </div>

            {/* Manual Snapshot Form */}
            <AnimatePresence>
              {isSnapshotFormOpen && (
                <motion.form
                  onSubmit={createManualSnapshot}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2 overflow-hidden text-xs"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-white/40 uppercase block">Branch / Milestone Label:</label>
                    <input
                      type="text"
                      required
                      value={snapshotLabel}
                      onChange={(e) => setSnapshotLabel(e.target.value)}
                      placeholder="E.g., Chapter 1 draft complete"
                      className="w-full bg-[#121216] border border-white/5 rounded-lg px-2.5 py-1.5 text-white/80 focus:outline-none focus:border-amber-500/30 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Weave Branch Snapshot
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Tab Selection */}
            <div className="flex border-b border-white/[0.03] p-0.5 bg-black/20 rounded-xl">
              <button
                onClick={() => setActiveSideTab('branches')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSideTab === 'branches'
                    ? 'bg-amber-500 text-black'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Branches ({versions.length})
              </button>
              <button
                onClick={() => setActiveSideTab('annotations')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSideTab === 'annotations'
                    ? 'bg-amber-500 text-black'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Lore Index ({annotatedSections.length})
              </button>
            </div>

            {/* Render Tab Contents */}
            <div className="pt-2">
              {activeSideTab === 'branches' ? (
                <ChronicleCanvasHistory
                  versions={versions}
                  onRestore={handleRestoreVersion}
                  onDelete={handleDeleteVersion}
                  onClearAll={handleClearTimeline}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/90">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <h4 className="font-serif text-sm">Scroll Lore Index</h4>
                  </div>

                  <p className="text-xs text-white/40 leading-relaxed">
                    A dynamic map of the sacred insights, callbacks, or margin annotations structured across your active paragraphs.
                  </p>

                  {annotatedSections.length === 0 ? (
                    <div className="text-center py-10 border border-white/5 bg-black/15 rounded-xl p-4">
                      <BookOpen className="w-7 h-7 text-white/10 mb-2 mx-auto" />
                      <span className="text-[10px] text-white/30 font-mono italic">No annotations placed.</span>
                      <p className="text-[9px] text-white/20 mt-1">
                        Focus on any block in the canvas and press the "Annotate" quill to start tagging.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {annotatedSections.map((sec) => (
                        <div
                          key={sec.id}
                          className="bg-[#0b0b0d] border border-amber-500/10 rounded-xl p-3.5 space-y-2 hover:border-amber-500/30 transition-all text-left"
                        >
                          <div className="flex justify-between items-center border-b border-white/[0.03] pb-1.5">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500 font-bold">
                              Block: {sec.type.toUpperCase()}
                            </span>
                          </div>

                          <p 
                            className="text-[10px] text-white/40 italic font-serif leading-normal line-clamp-2 cursor-help"
                            title={sec.text}
                          >
                            "{sec.text}"
                          </p>

                          <div className="bg-amber-500/5 border border-amber-500/25 p-2 rounded-lg text-[10px]">
                            <span className="text-[8px] uppercase font-mono text-white/30 block mb-0.5">Annotation Note:</span>
                            <span className="font-serif text-white/80 leading-normal">"{sec.annotation}"</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
