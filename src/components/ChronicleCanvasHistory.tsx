import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, RotateCcw, Trash2, ArrowLeftRight, Check, History, Sparkles } from 'lucide-react';
import { DocumentState, DocumentSection } from '../types';

export interface ChronicleVersion {
  id: string;
  timestamp: string;
  changeDescription: string;
  sections: DocumentSection[];
  title: string;
}

interface ChronicleCanvasHistoryProps {
  versions: ChronicleVersion[];
  onRestore: (version: ChronicleVersion) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function ChronicleCanvasHistory({
  versions,
  onRestore,
  onDelete,
  onClearAll
}: ChronicleCanvasHistoryProps) {

  const handleRestoreClick = (version: ChronicleVersion) => {
    if (window.confirm(`Are you sure you want to restore the version from ${version.timestamp}? Your current document state will be backed up as a new branch first.`)) {
      onRestore(version);
    }
  };

  const handleClearAllClick = () => {
    if (window.confirm('Are you sure you want to clear your entire timeline history? This action is irreversible.')) {
      onClearAll();
    }
  };

  return (
    <div className="space-y-5" id="chronicle-history-component">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500 animate-pulse" />
          <h3 className="font-serif text-sm tracking-wider text-white/90">Chronicle Branches</h3>
        </div>
        {versions.length > 0 && (
          <button
            onClick={handleClearAllClick}
            className="text-[10px] text-red-400 hover:text-red-300 font-mono transition-colors"
          >
            Clear Timeline
          </button>
        )}
      </div>

      <p className="text-xs text-white/40 leading-relaxed">
        The Astral Loom preserves every version of your scroll. Whenever you accept an Oracle rewrite or weave a tarot sigil, the loom catches the previous state so you can restore it at any moment.
      </p>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-white/5 bg-black/15 rounded-xl p-4">
          <Clock className="w-8 h-8 text-white/10 mb-2" />
          <span className="text-[10px] text-white/30 font-mono italic">Timeline is empty.</span>
          <p className="text-[9px] text-white/20 mt-1 max-w-[200px]">
            Your prior states will automatically manifest here when the AI performs iterations.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {versions.map((ver, idx) => {
            const wordCount = ver.sections.reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0);
            
            return (
              <motion.div
                key={ver.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0b0b0d] border border-white/5 rounded-xl p-3.5 space-y-2.5 hover:border-amber-500/20 transition-all relative overflow-hidden group"
              >
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-[8px] font-mono px-2 py-0.5 rounded-bl uppercase tracking-wider border-l border-b border-amber-500/20 font-bold">
                    Latest Backup
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-amber-500/80 font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {ver.changeDescription}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/30 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{ver.timestamp}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDelete(ver.id)}
                    className="text-gray-600 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-black/20 p-2 rounded border border-white/[0.03] text-[10px] space-y-1">
                  <div className="flex justify-between font-mono text-white/40 text-[8px]">
                    <span>TITLE:</span>
                    <span>{wordCount} words</span>
                  </div>
                  <p className="text-white/70 font-serif italic break-words whitespace-pre-wrap leading-relaxed">{ver.title || "Untitled"}</p>
                </div>

                <button
                  onClick={() => handleRestoreClick(ver)}
                  className="w-full py-1.5 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 text-white/70 hover:text-amber-400 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore Version
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
