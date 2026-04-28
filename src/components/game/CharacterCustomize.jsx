import React, { useState } from "react";
import { motion } from "framer-motion";

const COLORS = [
  { label: "Purple",  value: "#a855f7" },
  { label: "Cyan",    value: "#22d3ee" },
  { label: "Pink",    value: "#ec4899" },
  { label: "Gold",    value: "#fbbf24" },
  { label: "Green",   value: "#4ade80" },
  { label: "Indigo",  value: "#6366f1" },
  { label: "Orange",  value: "#f97316" },
  { label: "Red",     value: "#ef4444" },
  { label: "White",   value: "#e2e8f0" },
  { label: "Sky",     value: "#38bdf8" },
];

const OUTFITS = [
  { id: "default",    emoji: null,   label: "Default" },
  { id: "knight",     emoji: "⚔️",   label: "Knight" },
  { id: "wizard",     emoji: "🪄",   label: "Wizard" },
  { id: "astronaut",  emoji: "🚀",   label: "Astronaut" },
  { id: "pirate",     emoji: "🏴‍☠️",  label: "Pirate" },
  { id: "ninja",      emoji: "🥷",   label: "Ninja" },
  { id: "crown",      emoji: "👑",   label: "Royal" },
  { id: "cowboy",     emoji: "🤠",   label: "Cowboy" },
];

export default function CharacterCustomize({ character, initialColor, onConfirm, onBack }) {
  const [selectedColor, setSelectedColor] = useState(initialColor || "#a855f7");
  const [selectedOutfit, setSelectedOutfit] = useState("default");

  const outfit = OUTFITS.find(o => o.id === selectedOutfit);

  return (
    <motion.div
      key="customize"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-md"
    >
      {/* Preview */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-3">
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mx-auto"
            style={{
              background: `${selectedColor}22`,
              border: `3px solid ${selectedColor}`,
              boxShadow: `0 0 30px ${selectedColor}55`,
            }}
          >
            {character?.emoji}
          </div>
          {outfit.emoji && (
            <div className="absolute -top-3 -right-3 text-3xl">{outfit.emoji}</div>
          )}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-black"
            style={{ background: selectedColor, color: "#0a0a18" }}
          >
            {outfit.label}
          </div>
        </div>
        <h2 className="font-orbitron font-black text-2xl text-white mt-4">Customize {character?.name}</h2>
        <p className="text-white/40 text-sm">Pick a colour & outfit</p>
      </div>

      {/* Color picker */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 mb-4">
        <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Nametag Color</p>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => setSelectedColor(c.value)}
              title={c.label}
              className="w-full aspect-square rounded-xl transition-all"
              style={{
                background: c.value,
                boxShadow: selectedColor === c.value ? `0 0 12px ${c.value}, 0 0 24px ${c.value}55` : "none",
                transform: selectedColor === c.value ? "scale(1.15)" : "scale(1)",
                outline: selectedColor === c.value ? `2px solid white` : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Outfit picker */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 mb-6">
        <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Outfit Badge</p>
        <div className="grid grid-cols-4 gap-2">
          {OUTFITS.map(o => (
            <button
              key={o.id}
              onClick={() => setSelectedOutfit(o.id)}
              className={`rounded-xl py-2 flex flex-col items-center gap-1 border transition-all ${
                selectedOutfit === o.id
                  ? "border-white/60 bg-white/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">{o.emoji || character?.emoji}</span>
              <span className="text-white/60 text-[10px] font-bold">{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={() => onConfirm({ color: selectedColor, outfit: selectedOutfit, outfitEmoji: outfit.emoji })}
        className="w-full py-4 rounded-2xl font-black text-xl text-white mb-3"
        style={{ background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}99)`, boxShadow: `0 0 20px ${selectedColor}40` }}
      >
        Look great! Enter the World 🌍
      </motion.button>

      <button onClick={onBack} className="w-full py-2 text-white/40 font-semibold hover:text-white/70 transition-colors text-sm">
        ← Back
      </button>
    </motion.div>
  );
}