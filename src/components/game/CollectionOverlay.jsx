import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { INTERACTABLES } from "@/lib/worldData";

// Build a flat lookup of every collectable item across all worlds
const ALL_COLLECTABLES = {};
Object.entries(INTERACTABLES).forEach(([world, items]) => {
  items.forEach(item => {
    if (["collect", "open", "mine"].includes(item.action)) {
      ALL_COLLECTABLES[item.id] = { ...item, world };
    }
  });
});

const WORLD_LABELS = {
  overworld: "Buggagoogee Village",
  space: "Cosmic Nebula",
  jungle: "Mystic Jungle",
  ocean: "Deep Ocean",
};

const WORLD_COLORS = {
  overworld: "#a855f7",
  space: "#22d3ee",
  jungle: "#4ade80",
  ocean: "#38bdf8",
};

const WORLD_ORDER = ["overworld", "space", "jungle", "ocean"];

export default function CollectionOverlay({ collectedItems, onClose }) {
  // Group collected items by world
  const byWorld = {};
  collectedItems.forEach(id => {
    const item = ALL_COLLECTABLES[id];
    if (!item) return;
    if (!byWorld[item.world]) byWorld[item.world] = [];
    byWorld[item.world].push(item);
  });

  const totalCollected = collectedItems.length;
  const totalAvailable = Object.keys(ALL_COLLECTABLES).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card rounded-3xl p-6 border border-yellow-500/30 w-full max-w-md max-h-[85vh] flex flex-col"
          style={{ boxShadow: "0 0 40px rgba(251,191,36,0.15)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-orbitron font-black text-2xl text-white">🎒 Collection</h3>
              <p className="text-white/40 text-xs mt-0.5">
                {totalCollected} / {totalAvailable} items found this session
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl glass-card border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-white/10 mb-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #fbbf24, #a855f7)" }}
              initial={{ width: 0 }}
              animate={{ width: totalAvailable > 0 ? `${(totalCollected / totalAvailable) * 100}%` : "0%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Items list */}
          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {totalCollected === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">🌿</div>
                <p className="text-white/40 font-bold">Nothing collected yet!</p>
                <p className="text-white/25 text-sm mt-1">Explore worlds and pick up items to fill your collection.</p>
              </div>
            ) : (
              WORLD_ORDER.map(world => {
                const items = byWorld[world];
                if (!items || items.length === 0) return null;
                const color = WORLD_COLORS[world];
                return (
                  <div key={world}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 opacity-20" style={{ background: color }} />
                      <span className="text-xs font-black uppercase tracking-wider" style={{ color }}>
                        {WORLD_LABELS[world]}
                      </span>
                      <div className="h-px flex-1 opacity-20" style={{ background: color }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-card rounded-2xl p-3 border flex items-center gap-3"
                          style={{ borderColor: `${color}30` }}
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-white font-bold text-sm truncate">{item.label}</div>
                            {item.reward > 0 && (
                              <div className="text-yellow-400 text-xs font-bold">+{item.reward} 🪙</div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}