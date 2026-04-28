import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const GLYPH_MAP = {
  "𓀀": "A",
  "𓁹": "G",
  "𓂀": "P",
  "𓃭": "L",
  "𓄿": "O",
  "𓆣": "H",
  "𓇋": "I",
  "𓈖": "R",
  "𓊪": "Y",
  "𓋹": "M",
  "𓌳": "D",
  "𓏏": "T",
};

const GLYPHS = Object.keys(GLYPH_MAP);
const WORDS = ["GOLD", "PHARAOH", "PYRAMID"];
const MAX_MISTAKES = 5;

export default function GlyphDecoder({ onComplete, onExit }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [shakingTile, setShakingTile] = useState(null);
  const [revealKey, setRevealKey] = useState(0);
  const [won, setWon] = useState(false);
  const shakeTimer = useRef(null);

  const target = WORDS[wordIdx];

  useEffect(() => {
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  }, []);

  const restartCurrent = () => {
    setRevealed(0);
    setMistakes(0);
  };

  const handleTile = (glyph, idx) => {
    if (won) return;
    const letter = GLYPH_MAP[glyph];
    const need = target[revealed];
    if (letter === need) {
      const nextRev = revealed + 1;
      setRevealed(nextRev);
      setRevealKey(k => k + 1);
      if (nextRev === target.length) {
        // Word complete — short pause then advance
        setTimeout(() => {
          if (wordIdx + 1 >= WORDS.length) {
            setWon(true);
          } else {
            setWordIdx(w => w + 1);
            setRevealed(0);
            setMistakes(0);
          }
        }, 700);
      }
    } else {
      setShakingTile(idx);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShakingTile(null), 300);
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      if (nextMistakes >= MAX_MISTAKES) {
        // Restart current word
        setTimeout(() => restartCurrent(), 350);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(60,40,10,0.92) 0%, rgba(0,0,0,0.95) 80%)",
      }}
    >
      <div className="w-full max-w-2xl">
        {/* HUD */}
        <div className="flex items-center justify-between mb-4 glass-card rounded-2xl px-4 py-2 border border-amber-500/30 bg-black/40">
          <div className="font-orbitron font-black text-xl text-amber-300">
            𓂀 Glyph Decoder
          </div>
          <div className="font-orbitron font-black text-sm text-white/70">
            Word {wordIdx + 1} / {WORDS.length}
          </div>
          <button
            onClick={onExit}
            className="text-white/50 hover:text-white"
            aria-label="Exit"
          >
            <X size={20} />
          </button>
        </div>

        {/* Target word */}
        <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-6 mb-4">
          <div className="text-center text-xs uppercase tracking-widest text-amber-200/70 mb-3">
            Decipher the Word
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            {target.split("").map((ch, i) => {
              const isRevealed = i < revealed;
              return (
                <motion.div
                  key={`${wordIdx}-${i}`}
                  className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 flex items-center justify-center font-orbitron font-black text-2xl sm:text-3xl"
                  style={{
                    borderColor: isRevealed ? "#fbbf24" : "rgba(255,255,255,0.15)",
                    color: isRevealed ? "#fde68a" : "rgba(255,255,255,0.25)",
                    background: isRevealed
                      ? "rgba(251,191,36,0.1)"
                      : "rgba(0,0,0,0.4)",
                    boxShadow: isRevealed
                      ? "0 0 20px rgba(251,191,36,0.35)"
                      : "none",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isRevealed ? (
                      <motion.span
                        key={`r-${revealKey}-${i}`}
                        initial={{ scale: 0.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 18 }}
                      >
                        {ch}
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`u-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        _
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Glyph grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
          {GLYPHS.map((g, i) => {
            const shaking = shakingTile === i;
            return (
              <motion.button
                key={g}
                onClick={() => handleTile(g, i)}
                animate={
                  shaking
                    ? { x: [-6, 6, -5, 5, -3, 3, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.3 }}
                className="aspect-square rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-black/60 hover:from-amber-700/40 hover:to-black/40 hover:border-amber-400/60 transition-colors flex items-center justify-center text-3xl sm:text-4xl select-none"
                style={{
                  textShadow: "0 0 12px rgba(251,191,36,0.5)",
                }}
              >
                {g}
              </motion.button>
            );
          })}
        </div>

        {/* Mistakes */}
        <div className="flex items-center justify-between glass-card rounded-2xl px-4 py-2 border border-white/10 bg-black/40">
          <div className="text-sm text-white/60">
            Mistakes:{" "}
            <span
              className="font-orbitron font-black"
              style={{
                color: mistakes >= 4 ? "#ef4444" : "#fbbf24",
              }}
            >
              {mistakes} / {MAX_MISTAKES}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    i < mistakes ? "#ef4444" : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
        </div>

        <p className="text-white/40 text-center text-xs mt-3">
          Tap glyphs in order to spell the word — 5 mistakes restarts the round
        </p>
      </div>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.8)" }}
          >
            <div className="glass-card rounded-3xl p-8 text-center border-2 max-w-sm mx-4 bg-black/70 border-amber-400">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-2">
                You Won!
              </h2>
              <p className="text-white/60 mb-4">
                All three glyphs deciphered.
              </p>
              <button
                onClick={() => onComplete(true)}
                className="w-full py-4 rounded-2xl font-black text-xl text-white"
                style={{ background: "linear-gradient(135deg,#fbbf24,#d97706)" }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
