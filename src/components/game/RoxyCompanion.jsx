import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const FALLBACK_MESSAGES = {
  idle:    ["Woof! Let's go! 🐾", "I believe in you! 💪", "You've got this! ⭐", "Adventure awaits! 🌟"],
  correct: ["AMAZING! 🎉", "YES YES YES! 🏆", "You're a GENIUS! 🧠", "Tail wagging intensifies! 🐕"],
  wrong:   ["Aww, try again! 🐾", "We'll get it! 💪", "Almost! Keep going! ✨"],
  hint:    ["Hmm, this way! 🤔", "I sniffed something! 🐾", "Ooh look over there! 🎯"],
  levelup: ["LEVEL UP!! 🎊", "We're unstoppable! 🚀", "WOOF WOOF WOOF! 🐕", "Party time! 🎉"],
  fetch:   ["Hold on, I'll get it! 🦴", "Be right back! 💨", "On it, friend! 🐾"],
};

const OUTFIT_EMOJIS = {
  default:   "🐕",
  astronaut: "🐕‍🦺",
  explorer:  "🦮",
  wizard:    "🐩",
  cyber:     "🤖",
};

export default function RoxyCompanion({
  outfit = "default",
  mood = "idle",
  message,           // optional override (active helper)
  onRoxyClick,
  onPing,            // optional: when provided, shows a Ping button
  tricks = [],
}) {
  const [showBubble, setShowBubble] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(null);
  const [pulse, setPulse] = useState(false);

  // Show bubble when an explicit message arrives or mood changes meaningfully
  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      setShowBubble(true);
      const t = setTimeout(() => setShowBubble(false), 6000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (mood === "levelup" || mood === "correct" || mood === "fetch") {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2500);
      return () => clearTimeout(t);
    }
  }, [mood]);

  const handleClick = () => {
    const msgs = FALLBACK_MESSAGES[mood] || FALLBACK_MESSAGES.idle;
    setDisplayMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 4000);
    onRoxyClick?.();
  };

  const accentColor =
    mood === "levelup" ? "#fbbf24" :
    mood === "hint"    ? "#22d3ee" :
    mood === "correct" ? "#4ade80" :
    mood === "fetch"   ? "#f97316" :
                          "#a855f7";

  return (
    <div className="flex flex-col items-center select-none pointer-events-auto">
      <AnimatePresence>
        {showBubble && displayMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.85 }}
            className="mb-2 max-w-[180px] text-center"
          >
            <div
              className="glass-card rounded-2xl px-3 py-2 border relative"
              style={{ borderColor: `${accentColor}55`, boxShadow: `0 0 12px ${accentColor}33` }}
            >
              <p className="text-xs font-bold" style={{ color: `${accentColor}` }}>{displayMessage}</p>
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 glass-card rotate-45"
                style={{ borderLeft: `1px solid ${accentColor}55`, borderBottom: `1px solid ${accentColor}55` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={pulse ? { rotate: [0, -10, 10, -8, 8, 0] } : {}}
        transition={pulse ? { duration: 0.8 } : {}}
        className="roxy-bounce cursor-pointer relative"
      >
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
            style={{
              background: `${accentColor}33`,
              border: `2px solid ${accentColor}88`,
              boxShadow: `0 0 18px ${accentColor}55`,
              transition: "all 0.4s ease",
            }}
          >
            {OUTFIT_EMOJIS[outfit] || "🐕"}
          </div>

          {tricks.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-black text-yellow-900">
              {tricks.length}
            </div>
          )}

          {pulse && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.2, repeat: 2 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: `2px solid ${accentColor}` }}
            />
          )}
        </div>
        <p className="text-[10px] text-white/60 mt-1 font-bold font-orbitron tracking-widest">ROXY</p>
      </motion.button>

      {onPing && (
        <motion.button
          onClick={(e) => { e.stopPropagation(); onPing(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-1 px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black"
          style={{
            background: `${accentColor}22`,
            border: `1px solid ${accentColor}55`,
            color: accentColor,
          }}
        >
          <Sparkles className="w-3 h-3" /> Ping
        </motion.button>
      )}
    </div>
  );
}
