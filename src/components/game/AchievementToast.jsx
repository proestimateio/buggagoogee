import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_NAME = "buggagoogee:achievement";

export function dispatchAchievement({ id, name, emoji, desc, xp }) {
  try {
    const ev = new CustomEvent(EVENT_NAME, {
      detail: {
        id: id || `ach_${Date.now()}`,
        name: name || "Achievement!",
        emoji: emoji || "🏆",
        desc: desc || "",
        xp: typeof xp === "number" ? xp : 50,
      },
    });
    window.dispatchEvent(ev);
  } catch (e) {}
}

function Sparkles() {
  // 6 sparkle particles inside the toast card
  const items = Array.from({ length: 6 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {items.map((_, i) => {
        const left = 5 + Math.random() * 90;
        const top = 5 + Math.random() * 80;
        const delay = Math.random() * 1.2;
        const dur = 1.2 + Math.random() * 1.6;
        return (
          <motion.span
            key={i}
            className="absolute text-yellow-200"
            style={{ left: `${left}%`, top: `${top}%`, fontSize: 12 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity }}
          >
            ✦
          </motion.span>
        );
      })}
    </div>
  );
}

function ToastCard({ data }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="relative pointer-events-auto"
    >
      <div
        className="relative flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md"
        style={{
          background: "rgba(20, 18, 30, 0.55)",
          border: "2px solid rgba(255, 200, 80, 0.85)",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.45), 0 0 24px rgba(255,200,80,0.35)",
          minWidth: 280,
          maxWidth: 380,
        }}
      >
        <Sparkles />
        <div className="text-3xl drop-shadow">{data.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-yellow-300 font-semibold">
            Achievement Unlocked
          </div>
          <div className="text-white font-bold leading-tight truncate">
            {data.name}
          </div>
          {data.desc ? (
            <div className="text-xs text-white/70 truncate">{data.desc}</div>
          ) : null}
        </div>
        <div className="flex flex-col items-end">
          <div className="text-yellow-300 font-extrabold text-sm">
            +{data.xp} XP
          </div>
          <div className="text-[10px] text-yellow-200/70">!</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AchievementToast() {
  const [queue, setQueue] = useState([]);
  const timersRef = useRef(new Map());

  useEffect(() => {
    function onAch(e) {
      const detail = e?.detail;
      if (!detail) return;
      setQueue((q) => [...q, { ...detail, _key: `${detail.id}_${Date.now()}_${Math.random()}` }]);
    }
    window.addEventListener(EVENT_NAME, onAch);
    return () => window.removeEventListener(EVENT_NAME, onAch);
  }, []);

  useEffect(() => {
    queue.forEach((item) => {
      if (timersRef.current.has(item._key)) return;
      const t = setTimeout(() => {
        setQueue((q) => q.filter((it) => it._key !== item._key));
        timersRef.current.delete(item._key);
      }, 4000);
      timersRef.current.set(item._key, t);
    });
    return () => {};
  }, [queue]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none"
      style={{ width: "min(92vw, 420px)" }}
    >
      <AnimatePresence initial={false}>
        {queue.map((item) => (
          <ToastCard key={item._key} data={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}
