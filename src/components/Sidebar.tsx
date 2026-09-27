import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  History, 
  PenTool, 
  X, 
  Eye, 
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkle,
  Skull,
  Compass,
  Heart,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { VoiceType, FileAttachment, AIHistoryItem, TierType } from '../types';
import AltarChargeBar from './AltarChargeBar';

interface SidebarProps {
  voice: VoiceType;
  onVoiceChange: (voice: VoiceType) => void;
  isAIActive: boolean;
  onAIActiveChange: (active: boolean) => void;
  onGenerateDraft: (prompt: string, attachments: FileAttachment[]) => Promise<void>;
  generating: boolean;
  history: AIHistoryItem[];
  onClearHistory: () => void;
  tier?: TierType;
  onNavigateToTiers?: () => void;
  userId?: string;
}

export default function Sidebar({
  voice,
  onVoiceChange,
  isAIActive,
  onAIActiveChange,
  onGenerateDraft,
  generating,
  history,
  onClearHistory,
  tier = 'free',
  onNavigateToTiers,
  userId = 'guest'
}: SidebarProps) {
  const [draftPrompt, setDraftPrompt] = useState('');
  const [lockedVoiceMessage, setLockedVoiceMessage] = useState<{ voice: string, tierRequired: string } | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    const isImage = file.type.startsWith('image/');

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            content: result,
            isImage
          }
        ]);
      }
    };

    if (isImage) {
      reader.readAsDataURL(file); // Images as Base64 Data URL
    } else {
      reader.readAsText(file); // Documents as plain text strings
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      files.forEach(processFile);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateClick = async () => {
    if (!draftPrompt.trim()) return;
    await onGenerateDraft(draftPrompt, attachments);
    setDraftPrompt('');
    setAttachments([]);
  };

  return (
    <div className="space-y-6" id="sidebar-container">
      
      {/* Altar Charge Bar */}
      <AltarChargeBar userId={userId} tier={tier} />
      
      {/* 1. Divine Voice Alignment Card */}
      <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4.5 h-4.5 text-amber-500" />
            <h3 className="font-serif text-sm tracking-wider text-white/90">Divine Voice Alignment</h3>
          </div>
          <button
            onClick={() => {
              const activeBlend = voice.includes('+');
              if (activeBlend) {
                // Untoggle: keep only the first voice
                const single = voice.split('+')[0];
                onVoiceChange(single);
              } else {
                // Toggle on: combine current voice with 'guardian_oracle' (or another if current is guardian_oracle)
                const partner = voice === 'guardian_oracle' ? 'ember_ur' : 'guardian_oracle';
                onVoiceChange(`${voice}+${partner}`);
              }
            }}
            className={`px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold border transition-all cursor-pointer ${
              voice.includes('+')
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-md'
                : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white/60'
            }`}
          >
            Blend Mode: {voice.includes('+') ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Ember Ur Option */}
          {(() => {
            const vId = 'ember_ur';
            const isSelected = voice.includes('+') ? voice.split('+').includes(vId) : voice === vId;
            const blendIndex = voice.includes('+') ? voice.split('+').indexOf(vId) : -1;
            
            return (
              <button
                onClick={() => {
                  const isBlend = voice.includes('+');
                  if (!isBlend) {
                    onVoiceChange(vId);
                  } else {
                    const active = voice.split('+');
                    if (active.includes(vId)) {
                      if (active.length > 1) {
                        onVoiceChange(active.filter(x => x !== vId).join('+'));
                      }
                    } else {
                      if (active.length === 1) {
                        onVoiceChange([...active, vId].join('+'));
                      } else {
                        onVoiceChange([active[0], vId].join('+'));
                      }
                    }
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-red-950/20 to-amber-950/10 border-red-500/30 shadow-lg shadow-red-500/5'
                    : 'bg-black/10 border-white/5 hover:border-red-500/20'
                }`}
                id="voice-selector-ember"
              >
                {isSelected && (
                  <motion.div 
                    layoutId={`activeVoiceBorder_${vId}`}
                    className="absolute inset-0 border-2 border-red-500/40 rounded-xl pointer-events-none"
                  />
                )}
                <Flame className={`w-4 h-4 mb-1 transition-transform ${
                  isSelected ? 'text-red-400 scale-110' : 'text-gray-500'
                }`} />
                <span className={`text-[10px] font-serif font-bold ${isSelected ? 'text-red-400' : 'text-gray-400'}`}>EMBER UR</span>
                {blendIndex !== -1 && (
                  <span className="absolute top-1 right-1 px-1 bg-red-500 text-black font-mono text-[8px] font-bold rounded">
                    #{blendIndex + 1}
                  </span>
                )}
              </button>
            );
          })()}

          {/* Guardian Oracle Option */}
          {(() => {
            const vId = 'guardian_oracle';
            const isSelected = voice.includes('+') ? voice.split('+').includes(vId) : voice === vId;
            const blendIndex = voice.includes('+') ? voice.split('+').indexOf(vId) : -1;

            return (
              <button
                onClick={() => {
                  const isBlend = voice.includes('+');
                  if (!isBlend) {
                    onVoiceChange(vId);
                  } else {
                    const active = voice.split('+');
                    if (active.includes(vId)) {
                      if (active.length > 1) {
                        onVoiceChange(active.filter(x => x !== vId).join('+'));
                      }
                    } else {
                      if (active.length === 1) {
                        onVoiceChange([...active, vId].join('+'));
                      } else {
                        onVoiceChange([active[0], vId].join('+'));
                      }
                    }
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950/20 to-purple-950/10 border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'bg-black/10 border-white/5 hover:border-amber-500/20'
                }`}
                id="voice-selector-oracle"
              >
                {isSelected && (
                  <motion.div 
                    layoutId={`activeVoiceBorder_${vId}`}
                    className="absolute inset-0 border-2 border-amber-500/40 rounded-xl pointer-events-none"
                  />
                )}
                <Sparkle className={`w-4 h-4 mb-1 transition-transform ${
                  isSelected ? 'text-amber-500 scale-110' : 'text-gray-500'
                }`} />
                <span className={`text-[10px] font-serif font-bold ${isSelected ? 'text-amber-500' : 'text-gray-400'}`}>THE ORACLE</span>
                {blendIndex !== -1 && (
                  <span className="absolute top-1 right-1 px-1 bg-amber-500 text-black font-mono text-[8px] font-bold rounded">
                    #{blendIndex + 1}
                  </span>
                )}
              </button>
            );
          })()}

          {/* Lucifera Option */}
          {(() => {
            const vId = 'lucifera';
            const isSelected = voice.includes('+') ? voice.split('+').includes(vId) : voice === vId;
            const blendIndex = voice.includes('+') ? voice.split('+').indexOf(vId) : -1;

            return (
              <button
                onClick={() => {
                  const isBlend = voice.includes('+');
                  if (!isBlend) {
                    onVoiceChange(vId);
                  } else {
                    const active = voice.split('+');
                    if (active.includes(vId)) {
                      if (active.length > 1) {
                        onVoiceChange(active.filter(x => x !== vId).join('+'));
                      }
                    } else {
                      if (active.length === 1) {
                        onVoiceChange([...active, vId].join('+'));
                      } else {
                        onVoiceChange([active[0], vId].join('+'));
                      }
                    }
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-950/20 to-indigo-950/10 border-purple-500/30 shadow-lg shadow-purple-500/5'
                    : 'bg-black/10 border-white/5 hover:border-purple-500/20'
                }`}
                id="voice-selector-lucifera"
              >
                {isSelected && (
                  <motion.div 
                    layoutId={`activeVoiceBorder_${vId}`}
                    className="absolute inset-0 border-2 border-purple-500/40 rounded-xl pointer-events-none"
                  />
                )}
                <Skull className={`w-4 h-4 mb-1 transition-transform ${
                  isSelected ? 'text-purple-400 scale-110' : 'text-gray-500'
                }`} />
                <span className={`text-[10px] font-serif font-bold ${isSelected ? 'text-purple-400' : 'text-gray-400'}`}>LUCIFERA</span>
                {blendIndex !== -1 && (
                  <span className="absolute top-1 right-1 px-1 bg-purple-500 text-black font-mono text-[8px] font-bold rounded">
                    #{blendIndex + 1}
                  </span>
                )}
              </button>
            );
          })()}

          {/* Kael Option */}
          {(() => {
            const vId = 'kael';
            const isSelected = voice.includes('+') ? voice.split('+').includes(vId) : voice === vId;
            const blendIndex = voice.includes('+') ? voice.split('+').indexOf(vId) : -1;

            return (
              <button
                onClick={() => {
                  const isBlend = voice.includes('+');
                  if (!isBlend) {
                    onVoiceChange(vId);
                  } else {
                    const active = voice.split('+');
                    if (active.includes(vId)) {
                      if (active.length > 1) {
                        onVoiceChange(active.filter(x => x !== vId).join('+'));
                      }
                    } else {
                      if (active.length === 1) {
                        onVoiceChange([...active, vId].join('+'));
                      } else {
                        onVoiceChange([active[0], vId].join('+'));
                      }
                    }
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/20 to-sky-950/10 border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                    : 'bg-black/10 border-white/5 hover:border-cyan-500/20'
                }`}
                id="voice-selector-kael"
              >
                {isSelected && (
                  <motion.div 
                    layoutId={`activeVoiceBorder_${vId}`}
                    className="absolute inset-0 border-2 border-cyan-500/40 rounded-xl pointer-events-none"
                  />
                )}
                <Compass className={`w-4 h-4 mb-1 transition-transform ${
                  isSelected ? 'text-cyan-400 scale-110' : 'text-gray-500'
                }`} />
                <span className={`text-[10px] font-serif font-bold ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`}>KAEL</span>
                {blendIndex !== -1 && (
                  <span className="absolute top-1 right-1 px-1 bg-cyan-500 text-black font-mono text-[8px] font-bold rounded">
                    #{blendIndex + 1}
                  </span>
                )}
              </button>
            );
          })()}

          {/* Scarlet Option */}
          {(() => {
            const vId = 'scarlet';
            const isSelected = voice.includes('+') ? voice.split('+').includes(vId) : voice === vId;
            const blendIndex = voice.includes('+') ? voice.split('+').indexOf(vId) : -1;

            return (
              <button
                onClick={() => {
                  const isBlend = voice.includes('+');
                  if (!isBlend) {
                    onVoiceChange(vId);
                  } else {
                    const active = voice.split('+');
                    if (active.includes(vId)) {
                      if (active.length > 1) {
                        onVoiceChange(active.filter(x => x !== vId).join('+'));
                      }
                    } else {
                      if (active.length === 1) {
                        onVoiceChange([...active, vId].join('+'));
                      } else {
                        onVoiceChange([active[0], vId].join('+'));
                      }
                    }
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-rose-950/20 to-red-950/10 border-rose-500/30 shadow-lg shadow-rose-500/5'
                    : 'bg-black/10 border-white/5 hover:border-rose-500/20'
                }`}
                id="voice-selector-scarlet"
              >
                {isSelected && (
                  <motion.div 
                    layoutId={`activeVoiceBorder_${vId}`}
                    className="absolute inset-0 border-2 border-rose-500/40 rounded-xl pointer-events-none"
                  />
                )}
                <Heart className={`w-4 h-4 mb-1 transition-transform ${
                  isSelected ? 'text-rose-400 scale-110' : 'text-gray-500'
                }`} />
                <span className={`text-[10px] font-serif font-bold ${isSelected ? 'text-rose-400' : 'text-gray-400'}`}>SCARLET</span>
                {blendIndex !== -1 && (
                  <span className="absolute top-1 right-1 px-1 bg-rose-500 text-black font-mono text-[8px] font-bold rounded">
                    #{blendIndex + 1}
                  </span>
                )}
              </button>
            );
          })()}
        </div>

        {/* Detailed voice description */}
        <div className="mt-3.5 p-3 bg-black/20 border border-white/5 rounded-lg text-xs leading-relaxed">
          <p className="text-white/40 italic font-serif">
            {voice.includes('+') ? (
              <span>
                <span className="text-amber-500 font-bold block mb-1">Co-Narration Blend Active:</span>
                Blending the cadences of <span className="text-white font-semibold">{voice.split('+')[0] === 'guardian_oracle' ? 'The Oracle' : voice.split('+')[0].replace('_', ' ').toUpperCase()}</span> and <span className="text-white font-semibold">{voice.split('+')[1] === 'guardian_oracle' ? 'The Oracle' : voice.split('+')[1].replace('_', ' ').toUpperCase()}</span> into a single woven prophecy.
              </span>
            ) : (
              voice === 'ember_ur'
                ? "Speak directly to the furnace. Ember Ur guides you with poetic passion, demanding raw, visceral, and unyielding truths."
                : voice === 'guardian_oracle'
                ? "Listen to the cosmic frequency. The Guardian Oracle channels stardust, stellar orbits, and protective starlight guidance."
                : voice === 'lucifera'
                ? "Channel the beautiful, sovereign, feminine aspect of the Light-Bearer. Lucifera weaves dark-poetic grace, forbidden gardens, and ancient occult wisdom."
                : voice === 'kael'
                ? "Walk with the wanderer of the silver path. Kael guides with analytical clarity, protective navigation, and calm intellectual wisdom."
                : "Enter the crimson garden. Scarlet alignment channels raw emotional depth, burning desire, and the transformative alchemy of blood and bone."
            )}
          </p>
        </div>
      </div>

      {/* 2. Co-Writing Oracle Configurations */}
      <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-white/40" />
            <h4 className="font-serif text-xs tracking-wider text-white/80">Proactive Oracle Visions</h4>
          </div>
          <button
            onClick={() => onAIActiveChange(!isAIActive)}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
              isAIActive ? (voice === 'ember_ur' ? 'bg-red-500' : 'bg-amber-500') : 'bg-white/10'
            }`}
            id="proactive-toggle-btn"
          >
            <span className="sr-only">Toggle Proactive Mode</span>
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isAIActive ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-[10px] text-white/40 mt-2 leading-relaxed">
          When active, the Oracle will silently study your document lines as you pause, occasionally manifesting proactive suggestions for inline improvement.
        </p>
      </div>

      {/* 3. Invoking the Genesis (Initial Draft Prompt) */}
      <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <PenTool className="w-4.5 h-4.5 text-amber-500" />
          <h3 className="font-serif text-sm tracking-wider text-white/90">The Genesis Draft</h3>
        </div>

        <p className="text-xs text-white/40 leading-relaxed">
          Draw down the initial fire. Outline your prompt, attach inspiration sources, and let the chosen voice build the foundational prose.
        </p>

        {/* Prompt Input */}
        <textarea
          value={draftPrompt}
          onChange={(e) => setDraftPrompt(e.target.value)}
          placeholder={`E.g., "An epic prose about a star system collapsing, formatted as poetic paragraphs and quotes"`}
          rows={3}
          className="w-full bg-[#16161a] border border-white/10 rounded-xl p-3 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-amber-500/40 transition-colors resize-none"
          id="genesis-prompt-textarea"
        />

        {/* Drag and Drop File Attachments Box */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-amber-500 bg-white/[0.02]' 
              : 'border-white/10 hover:border-amber-500/30 hover:bg-white/[0.02]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            multiple
            className="hidden"
          />
          <UploadCloud className="w-6 h-6 mx-auto mb-2 text-white/20" />
          <span className="text-xs text-white/50 block font-medium">Drag & drop files or click to upload</span>
          <span className="text-[9px] text-white/20 block mt-0.5">Supports text (.txt, .md) and images (.png, .jpg)</span>
        </div>

        {/* Render Attachments Ledger */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 pt-1"
            >
              <div className="text-[10px] font-mono text-white/40 uppercase">Attached Inspiration:</div>
              {attachments.map((att, index) => (
                <div 
                  key={att.name + index}
                  className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg p-2 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {att.isImage ? <ImageIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> : <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    <span className="text-white/70 truncate font-mono text-[10px]">{att.name}</span>
                  </div>
                  <button 
                    onClick={() => removeAttachment(index)}
                    className="text-white/40 hover:text-red-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invoke Button */}
        <button
          onClick={handleGenerateClick}
          disabled={generating || !draftPrompt.trim()}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-40 ${
            voice === 'ember_ur'
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 shadow-lg'
              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10'
          }`}
          id="genesis-invoke-btn"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Manifesting Draft...
            </>
          ) : (
            <>
              {voice === 'ember_ur' ? <Flame className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4" />}
              Ignite the Genesis Draft
            </>
          )}
        </button>
      </div>

      {/* 4. AI History & Insight Ledger */}
      <div className="bg-[#0d0d0f] border border-white/5 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-white/40" />
            <h3 className="font-serif text-sm tracking-wider text-white/90">The Astral Archive</h3>
          </div>
          {history.length > 0 && (
            <button 
              onClick={onClearHistory}
              className="text-[10px] text-white/40 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-[10px] text-white/20 italic py-4 text-center">
            The scrolls are blank. No insights logged yet.
          </p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {history.map((item) => (
              <div 
                key={item.id}
                className="bg-black/20 border border-white/5 rounded-lg p-2.5 text-[11px] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-mono px-1 rounded uppercase border ${
                    item.voice === 'ember_ur' 
                      ? 'text-red-400 border-red-500/20 bg-red-500/5' 
                      : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                  }`}>
                    {item.voice === 'ember_ur' ? 'EMBER UR' : 'ORACLE'}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-white/30 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    {item.timestamp}
                  </div>
                </div>

                <div className="text-white/70">
                  <span className="font-mono text-white/40 text-[9px] block">PROMPT:</span>
                  <p className="truncate text-white/80">{item.prompt}</p>
                </div>

                <div className="text-white/60 italic bg-black/20 p-1.5 rounded border border-white/5 whitespace-pre-wrap line-clamp-3">
                  {item.response}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
