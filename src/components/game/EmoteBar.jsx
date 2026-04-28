import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOTES = [
  { id: "wave",  emoji: "👋", label: "Wave"  },
  { id: "dance", emoji: "💃", label: "Dance" },
  { id: "cheer", emoji: "🎉", label: "Cheer" },
  { id: "heart", emoji: "❤️", label: "Heart" },
];

export default function EmoteBar({ onEmote, orientation = "horizontal" }) {
  const [flashId, setFlashId] = useState(null);

  const handleClick = useCallback(
    (id) => {
      setFlashId(`${id}_${Date.now()}`);
      try { onEmote && onEmote(id); } catch (e) {}
      window.setTimeout(() => setFlashId(null), 450);
    },
    [onEmote]
  );

  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${isVertical ? "flex-col" : "flex-row"} gap-2 p-2 rounded-2xl backdrop-blur-md`}
      style={{
        background: "rgba(20, 22, 35, 0.45)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 6px 22px rgba(0,0,0,0.35)",
      }}
    >
      {EMOTES.map((e) => {
        const flashing = flashId && flashId.startsWith(e.id + "_");
        return (
          <motion.button
            key={e.id}
            type="button"
            aria-label={e.label}
            onClick={() => handleClick(e.id)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-xl select-none"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <span aria-hidden>{e.emoji}</span>
            <AnimatePresence>
              {flashing && (
                <motion.span
                  key={flashId}
                  initial={{ opacity: 0.9, scale: 0.6 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,230,140,0.7) 0%, rgba(255,230,140,0) 70%)",
                  }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {flashing && (
                <motion.span
                  key={flashId + "_e"}
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ y: -28, opacity: 0, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute text-2xl pointer-events-none"
                >
                  {e.emoji}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
