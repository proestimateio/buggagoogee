import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "buggagoogee_tutorial_done";

const STEPS = [
  {
    title: "Move & Look",
    text: "Use WASD or arrows to walk. Drag your mouse to look around.",
    spot: { left: "50%", top: "75%" },
  },
  {
    title: "Meet Roxy",
    text: "That's Roxy! She'll guide you to nearby treasures and quest objectives.",
    spot: { left: "30%", top: "55%" },
  },
  {
    title: "Chat & Emote",
    text: "Tap the chat icon to talk with players in this world. Try an emote!",
    spot: { left: "85%", top: "85%" },
  },
  {
    title: "Adventure Board",
    text: "Visit the 📋 Adventure Board in the village to start your first quest.",
    spot: { left: "65%", top: "45%" },
  },
];

export default function CoachMarks({ onDone }) {
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = "0";
    try { done = localStorage.getItem(STORAGE_KEY) || "0"; } catch (e) {}
    if (done === "1") {
      try { onDone && onDone(); } catch (e) {}
      return;
    }
    setReady(true);
  }, [onDone]);

  if (!ready) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  function handleNext() {
    if (isLast) {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
      try { onDone && onDone(); } catch (e) {}
      return;
    }
    setStep((s) => s + 1);
  }

  function handleSkip() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    try { onDone && onDone(); } catch (e) {}
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{
          background: "rgba(8, 8, 16, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      <AnimatePresence>
        <motion.div
          key={`spot-${step}`}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="absolute pointer-events-none"
          style={{
            left: current.spot.left,
            top: current.spot.top,
            transform: "translate(-50%, -50%)",
            width: 140,
            height: 140,
            borderRadius: "50%",
            boxShadow:
              "0 0 0 4px rgba(255,220,120,0.85), 0 0 60px 30px rgba(255,220,120,0.45), 0 0 0 9999px rgba(0,0,0,0.0)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ border: "2px dashed rgba(255,220,120,0.7)" }}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`card-${step}`}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="relative z-10 mx-4 max-w-md w-[92%] rounded-2xl p-6 text-white"
          style={{
            background: "rgba(22, 22, 38, 0.85)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 18px 55px rgba(0,0,0,0.55)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-widest text-yellow-300/90">
              Step {step + 1} of {STEPS.length}
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-white/60 hover:text-white/90 underline"
            >
              Skip
            </button>
          </div>
          <h3 className="text-xl font-bold mb-2">{current.title}</h3>
          <p className="text-sm text-white/85 leading-relaxed mb-5">
            {current.text}
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === step ? 22 : 8,
                    background:
                      i <= step ? "rgba(255,220,120,0.9)" : "rgba(255,255,255,0.25)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl font-semibold text-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,220,120,0.95), rgba(255,170,80,0.95))",
                color: "#1a1208",
                boxShadow: "0 6px 18px rgba(255,180,80,0.45)",
              }}
            >
              {isLast ? "Let's Go!" : "Next"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
