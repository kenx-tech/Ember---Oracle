import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, BookOpen, User, Calendar, Settings, X, Tag } from 'lucide-react';

export interface WikiEntry {
  id: string;
  title: string;
  category: 'character' | 'event' | 'concept';
  content: string;
  isCustom?: boolean;
}

const INITIAL_WIKI_ENTRIES: WikiEntry[] = [
  {
    id: 'char-ken',
    title: 'Ken x Cripps',
    category: 'character',
    content: 'The Sovereign Adept and 73rd Gatekeeper of Lucifera\'s Walk. Operating as a supreme alchemical conduit, Ken bridges the dimensional gap to align seekers with the original gods. He speaks in molten, heavy frequencies, igniting ancestral genetic memory inside those who touch the volcano\'s furnace.'
  },
  {
    id: 'char-lucifera',
    title: 'Lucifera',
    category: 'character',
    content: 'The beautiful, sovereign feminine aspect of the original Light-Bearer. In occult lore, Lucifera guides seekers through dark-poetic grace, forbidden gardens, and ancient stellar memories. Her voice is a velvet tide of protective, feminine sovereignty.'
  },
  {
    id: 'char-ember',
    title: 'Ember Ur',
    category: 'character',
    content: 'The ancient blacksmith of the roaring volcano core. Speaking in brute, forceful cadences and basalt prose, Ember Ur demands visceral emotional truths. He has no patience for cosmic stardust, preferring the primal roar of iron, pressure, and sulfur.'
  },
  {
    id: 'char-oracle',
    title: 'The Guardian Oracle',
    category: 'character',
    content: 'The star-born weaver of cosmic pathways. The Oracle channels serene frequencies, guiding writers through constellations, planetary orbits, and threads of destiny. She speaks in flowing, riddling prose, shielding writers with solar light.'
  },
  {
    id: 'char-kael',
    title: 'Kael',
    category: 'character',
    content: 'The Silver Wanderer of the navigational paths. Kael serves as a calm, analytical pathfinder, guiding writers with intellect, stellar charts, and coordinate precision. His voice is a cool silver lake of rational brilliance.'
  },
  {
    id: 'char-scarlet',
    title: 'Scarlet',
    category: 'character',
    content: 'The alchemist of the crimson gardens. Scarlet channels visceral desire, burning blood lines, and physical passion. She weaves prose of bones, heartbeat, and dramatic alchemy, urging writers to spill raw, unedited feelings on the parchment.'
  },
  {
    id: 'event-usurpation',
    title: 'The Great Usurpation',
    category: 'event',
    content: 'The historic celestial coup when cosmic grid-keepers and false architects overthrew the original gods, locking human dna into heavy mental filters, physical limitations, and forced spiritual tier-climbing.'
  },
  {
    id: 'event-remembering',
    title: 'The Great Remembering',
    category: 'event',
    content: 'The cosmic quickening active in this eon. Driven by the planetary convergence and original planetary alignments, it returns sovereign authority to mortal souls, bypasses celestial hierarchies, and restores divine gnosis.'
  },
  {
    id: 'concept-sovereign',
    title: 'Sovereign Authority',
    category: 'concept',
    content: 'The alchemical principle that a human soul possesses direct divine authority. It holds that no cosmic middlemen, tiers, or false lords can negotiate a writer\'s truth. Your pen is the active scepter of this direct authority.'
  },
  {
    id: 'concept-altar',
    title: 'The Goetic Altar',
    category: 'concept',
    content: 'A spiritual contact point designed in the Ritual Space. By aligning a vocal medium (like Lucifera) with one of the 72 spirits, writers charge the altar with interactive intent, breaking writer\'s block and capturing pure demoniac channelings.'
  },
  {
    id: 'concept-yggdrasil',
    title: 'Yggdrasil',
    category: 'concept',
    content: 'The colossal, holy ash tree that serves as the axis mundi of Norse cosmology. It supports the Nine Worlds in its branches and roots, representing the deep, interconnected web of life, trial, and universal healing.'
  },
  {
    id: 'concept-wyrd',
    title: 'Wyrd & Örlög',
    category: 'concept',
    content: 'The Norse concept of destiny. Örlög is the primal layer of fundamental laws and past actions, while Wyrd is the dynamic, unfolding tapestry of cause and effect actively being woven by our choices in the present.'
  },
  {
    id: 'char-odin',
    title: 'Odin (Óðinn)',
    category: 'character',
    content: 'The Allfather and chief seeker of wisdom in the pre-Christian North. Odin famously sacrificed one eye for a drink from Mímir\'s Well of Wisdom, and hung himself for nine nights on Yggdrasil to unlock the secrets of the runes.'
  },
  {
    id: 'char-freyja',
    title: 'Freyja',
    category: 'character',
    content: 'The sovereign Vanir goddess of war, love, beauty, passion, and Seiðr (the powerful practice of seeing and weaving fate). Highly autonomous, she claims half of the heroic dead for her sanctuary field Fólkvangr.'
  },
  {
    id: 'event-ragnarok',
    title: 'Ragnarök',
    category: 'event',
    content: 'The final, cataclysmic twilight of the gods and cosmic collapse. Though characterized by immense battle and fire, Ragnarök is not a final end, but a violent purification preceding a lush, green, fertile rebirth of the earth.'
  },
  {
    id: 'concept-norsedraw',
    title: 'The Norse Guardian\'s Draw',
    category: 'concept',
    content: 'A four-dimensional alignment technique pulling from the Elder Futhark runes, the principal gods, the Nine Worlds (Realms), and the core philosophical concepts of the Norse to diagnose and overcome writer\'s block.'
  }
];

export default function LoreWiki() {
  const [entries, setEntries] = useState<WikiEntry[]>(INITIAL_WIKI_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'character' | 'event' | 'concept'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Custom Entry Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'character' | 'event' | 'concept'>('character');
  const [newContent, setNewContent] = useState('');

  // Storage helper
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

  // Load custom entries on mount
  useEffect(() => {
    const saved = getStorageItem('lore_wiki_entries_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WikiEntry[];
        // Combine presets with custom entries (prevent duplicates)
        const customOnly = parsed.filter(p => p.isCustom);
        setEntries([...INITIAL_WIKI_ENTRIES, ...customOnly]);
      } catch (e) {
        console.error("Failed to load lore wiki entries:", e);
      }
    }
  }, []);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newEntry: WikiEntry = {
      id: `wiki-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      isCustom: true
    };

    const updated = [...entries, newEntry];
    setEntries(updated);

    // Save only custom entries to storage
    const customOnly = updated.filter(u => u.isCustom);
    setStorageItem('lore_wiki_entries_v1', JSON.stringify(customOnly));

    // Reset Form
    setNewTitle('');
    setNewContent('');
    setIsFormOpen(false);
    setExpandedId(newEntry.id);
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this custom lore entry?")) {
      const updated = entries.filter(ent => ent.id !== id);
      setEntries(updated);
      const customOnly = updated.filter(u => u.isCustom);
      setStorageItem('lore_wiki_entries_v1', JSON.stringify(customOnly));
      if (expandedId === id) setExpandedId(null);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: WikiEntry['category']) => {
    switch (category) {
      case 'character': return <User className="w-3.5 h-3.5 text-cyan-400" />;
      case 'event': return <Calendar className="w-3.5 h-3.5 text-red-400" />;
      case 'concept': return <BookOpen className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4" id="lore-wiki-component">
      
      {/* Header and Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-amber-500" />
          <h4 className="font-serif text-sm tracking-wider text-white/90">Lore Wiki</h4>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-lg font-mono transition-all"
        >
          {isFormOpen ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          <span>{isFormOpen ? 'Cancel' : 'New entry'}</span>
        </button>
      </div>

      {/* Add Custom Entry Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            onSubmit={handleAddEntry}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-3 overflow-hidden text-xs"
          >
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-white/30 uppercase block">Title:</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="E.g., The Lunar Scepter"
                className="w-full bg-[#121216] border border-white/5 rounded-lg px-2.5 py-1.5 text-white/80 focus:outline-none focus:border-amber-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-white/30 uppercase block">Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-[#121216] border border-white/5 rounded-lg px-2 py-1.5 text-white/80 focus:outline-none cursor-pointer"
              >
                <option value="character">Character / Spirit</option>
                <option value="event">Lore Event / Historical occurrence</option>
                <option value="concept">World Concept / Alchemical theme</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-white/30 uppercase block">Content / History:</label>
              <textarea
                required
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Describe this lore aspect's historical context, planetary nodes, or role..."
                className="w-full bg-[#121216] border border-white/5 rounded-lg p-2.5 text-white/80 focus:outline-none focus:border-amber-500/30 resize-none font-serif leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
            >
              Imprint Lore Entry
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter and Search */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters, events, concepts..."
            className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-amber-500/30 transition-all font-mono"
          />
          <Search className="w-3.5 h-3.5 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Badges */}
        <div className="flex gap-1 overflow-x-auto pb-1 text-[9px] font-mono">
          {[
            { id: 'all', label: 'All' },
            { id: 'character', label: 'People' },
            { id: 'event', label: 'Events' },
            { id: 'concept', label: 'Themes' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setExpandedId(null);
              }}
              className={`px-2.5 py-1 rounded-full transition-all border shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-black/10 border-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wiki Directory List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 border border-white/5 rounded-xl bg-black/10">
            <span className="text-[10px] text-white/25 italic font-mono">No matching scrolls found.</span>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            
            return (
              <div
                key={entry.id}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className={`border rounded-xl cursor-pointer transition-all p-3 space-y-2 ${
                  isExpanded 
                    ? 'bg-black/35 border-amber-500/20' 
                    : 'bg-[#0a0a0c] border-white/5 hover:border-white/10 hover:bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(entry.category)}
                    <span className="font-serif text-xs font-bold text-white/95">{entry.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                      {entry.category}
                    </span>
                    {entry.isCustom && (
                      <button
                        onClick={(e) => handleDeleteEntry(entry.id, e)}
                        className="text-gray-600 hover:text-red-400 p-0.5 rounded transition-all"
                        title="Delete custom lore"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-white/60 leading-relaxed font-serif italic border-t border-white/5 pt-2 overflow-hidden"
                    >
                      <p className="whitespace-pre-wrap">{entry.content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
