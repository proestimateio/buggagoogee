import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Check, Compass } from "lucide-react";
import { ADVENTURES, ADVENTURE_QUESTS } from "@/lib/gameData";

export default function AdventureBoard({ open, onClose, saveData, onChoose }) {
  if (!open) return null;
  const xp = saveData?.xp || 0;
  const progress = saveData?.adventure_progress || {};
  const active = saveData?.active_adventure;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card rounded-3xl p-6 border border-purple-500/40 w-full max-w-3xl max-h-[88vh] overflow-y-auto"
          style={{ boxShadow: "0 0 60px rgba(168,85,247,0.3)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-orbitron font-black text-3xl text-white flex items-center gap-2">
                <Compass className="w-7 h-7 text-purple-400" /> Adventure Board
              </h2>
              <p className="text-white/50 text-sm mt-1">Pick a quest. Roxy will help you along the way.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {ADVENTURES.map((adv) => {
              const locked = xp < adv.unlockXP;
              const advProgress = progress[adv.id] || { completed_steps: 0, finished: false };
              const totalSteps = ADVENTURE_QUESTS[adv.id]?.steps?.length || 3;
              const isActive = active === adv.id;
              const pct = Math.min(100, Math.round((advProgress.completed_steps / totalSteps) * 100));

              return (
                <motion.button
                  key={adv.id}
                  whileHover={!locked ? { y: -3, scale: 1.01 } : undefined}
                  whileTap={!locked ? { scale: 0.99 } : undefined}
                  disabled={locked}
                  onClick={() => !locked && onChoose(adv.id)}
                  className={`relative text-left rounded-2xl p-5 border-2 transition-all overflow-hidden ${
                    locked
                      ? "border-white/5 opacity-60 cursor-not-allowed"
                      : isActive
                      ? "border-purple-400"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  style={{
                    background: locked
                      ? "rgba(0,0,0,0.5)"
                      : `linear-gradient(135deg, ${adv.borderColor}22, transparent 70%)`,
                    boxShadow: isActive ? `0 0 24px ${adv.borderColor}80` : undefined,
                  }}
                >
                  {/* Glowing accent corner */}
                  {!locked && (
                    <div
                      className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-xl"
                      style={{ background: adv.borderColor, opacity: 0.25 }}
                    />
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2 relative">
                    <div className="text-5xl">{adv.emoji}</div>
                    {locked ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 text-white/60 text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" /> {adv.unlockXP} XP
                      </div>
                    ) : advProgress.finished ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 border border-green-400/40 text-green-300 text-xs font-black">
                        <Check className="w-3.5 h-3.5" /> Done
                      </div>
                    ) : isActive ? (
                      <div className="px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-black">
                        ACTIVE
                      </div>
                    ) : null}
                  </div>

                  <h3 className="font-orbitron font-black text-white text-xl">{adv.name}</h3>
                  <p className="text-white/60 text-xs mt-0.5">{adv.subtitle}</p>
                  <p className="text-white/40 text-xs mt-2 line-clamp-2">{adv.description}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${adv.borderColor}, ${adv.borderColor}aa)`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/50 font-orbitron">
                      {advProgress.completed_steps}/{totalSteps}
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] uppercase tracking-wider font-orbitron"
                       style={{ color: adv.borderColor }}>
                    Teaches: {adv.teaches}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-center text-white/50 text-xs">
            ⭐ Earn XP by exploring, collecting, and beating mini-games to unlock more adventures.
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
