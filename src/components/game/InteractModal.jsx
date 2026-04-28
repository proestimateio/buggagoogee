import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function InteractModal({ obj, onClose, onAction }) {
  if (!obj) return null;

  const actionLabel = {
    talk: "Talk",
    open: "Open",
    collect: "Collect",
    examine: "Examine",
    mine: "Mine",
    rest: "Rest Here",
    travel: "Travel Through Portal",
    shop: "Open Shop",
    minigame: "Play Mini-Game!",
  }[obj.action] || "Interact";

  const actionColor = {
    travel: "#22d3ee",
    minigame: "#fbbf24",
    collect: "#4ade80",
    open: "#fbbf24",
    shop: "#ec4899",
  }[obj.action] || "#a855f7";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 60, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="glass-card rounded-3xl p-6 border border-white/20 w-full max-w-sm"
          style={{ boxShadow: `0 0 30px ${actionColor}30` }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{obj.emoji}</span>
              <div>
                <h3 className="font-black text-white text-xl">{obj.label}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${actionColor}20`, color: actionColor, border: `1px solid ${actionColor}40` }}>
                  {obj.action?.toUpperCase()}
                </span>
              </div>
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
          </div>

          {obj.dialog && (
            <div className="glass-card rounded-2xl p-4 border border-white/10 mb-4">
              <p className="text-white/80 leading-relaxed text-sm">{obj.dialog}</p>
            </div>
          )}

          {obj.reward && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
              style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
              <span className="text-xl">🪙</span>
              <span className="font-black text-yellow-400">+{obj.reward} coins</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onAction(obj)}
            className="w-full py-4 rounded-2xl font-black text-white text-lg"
            style={{ background: `linear-gradient(135deg, ${actionColor}, ${actionColor}99)`, boxShadow: `0 0 20px ${actionColor}40` }}
          >
            {actionLabel} {obj.emoji}
          </motion.button>

          <button onClick={onClose} className="w-full mt-2 py-2 text-white/40 font-semibold hover:text-white/70 transition-colors text-sm">
            Walk away
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}