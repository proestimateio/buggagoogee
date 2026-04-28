import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const COLS = 8;
const ROWS = 6;
const STABLE_MS = 5000;

const TOKENS = [
  { id: "coral", icon: "🪸", label: "Coral", desc: "+6 producers" },
  { id: "seagrass", icon: "🌿", label: "Seagrass", desc: "+6 producers" },
  { id: "fish", icon: "🐠", label: "Fish", desc: "+6 herb · -2 prod" },
  { id: "predator", icon: "🦈", label: "Predator", desc: "+8 pred · -4 herb" },
  { id: "cleaner", icon: "🦐", label: "Cleaner", desc: "+3 producers" },
  { id: "empty", icon: "⬛", label: "Eraser", desc: "Clear cell" },
];

// Effect deltas for placement
const EFFECTS = {
  coral: { producers: 6, herbivores: 0, predators: 0 },
  seagrass: { producers: 6, herbivores: 0, predators: 0 },
  fish: { producers: -2, herbivores: 6, predators: 0 },
  predator: { producers: 0, herbivores: -4, predators: 8 },
  cleaner: { producers: 3, herbivores: 0, predators: 0 },
};

const clamp = (v) => Math.max(0, Math.min(100, v));

function inBand(v) {
  return v >= 40 && v <= 70;
}

export default function ReefRebuild({ onComplete, onExit }) {
  const [grid, setGrid] = useState(() =>
    Array.from({ length: ROWS * COLS }, () => null)
  );
  const [selected, setSelected] = useState("coral");
  const [bars, setBars] = useState({
    producers: 30,
    herbivores: 25,
    predators: 20,
  });
  const [shakeBar, setShakeBar] = useState(null);
  const [stableSince, setStableSince] = useState(null);
  const [stableLeft, setStableLeft] = useState(STABLE_MS);
  const [won, setWon] = useState(false);
  const collapseTimerRef = useRef(null);

  const reefHealth = clamp(
    Math.round((bars.producers + bars.herbivores + bars.predators) / 3)
  );

  const allInBand =
    inBand(bars.producers) && inBand(bars.herbivores) && inBand(bars.predators);

  // Track stability
  useEffect(() => {
    if (allInBand) {
      if (stableSince === null) setStableSince(Date.now());
    } else {
      if (stableSince !== null) setStableSince(null);
      setStableLeft(STABLE_MS);
    }
  }, [allInBand, stableSince]);

  // Stability tick
  useEffect(() => {
    if (stableSince === null || won) return;
    const t = setInterval(() => {
      const elapsed = Date.now() - stableSince;
      const remaining = Math.max(0, STABLE_MS - elapsed);
      setStableLeft(remaining);
      if (elapsed >= STABLE_MS) {
        setWon(true);
        clearInterval(t);
      }
    }, 100);
    return () => clearInterval(t);
  }, [stableSince, won]);

  // Apply collapse rules after every change
  useEffect(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    if (won) return;
    // Predators starve
    if (bars.predators > 60 && bars.herbivores < 30) {
      setShakeBar("predators");
      collapseTimerRef.current = setTimeout(() => {
        setBars(b => ({ ...b, predators: clamp(b.predators - 30) }));
        setShakeBar(null);
      }, 2000);
    } else if (bars.herbivores > 70) {
      setShakeBar("producers");
      collapseTimerRef.current = setTimeout(() => {
        setBars(b => ({ ...b, producers: clamp(b.producers - 20) }));
        setShakeBar(null);
      }, 2000);
    }
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, [bars, won]);

  const placeAt = (idx) => {
    if (won) return;
    const current = grid[idx];
    setGrid(g => {
      const next = [...g];
      // Reverse old effect
      if (current && EFFECTS[current]) {
        setBars(b => {
          const e = EFFECTS[current];
          return {
            producers: clamp(b.producers - e.producers),
            herbivores: clamp(b.herbivores - e.herbivores),
            predators: clamp(b.predators - e.predators),
          };
        });
      }
      if (selected === "empty") {
        next[idx] = null;
      } else {
        next[idx] = selected;
        setBars(b => {
          const e = EFFECTS[selected];
          return {
            producers: clamp(b.producers + e.producers),
            herbivores: clamp(b.herbivores + e.herbivores),
            predators: clamp(b.predators + e.predators),
          };
        });
      }
      return next;
    });
  };

  const Bar = ({ label, value, color, barKey }) => {
    const ok = inBand(value);
    return (
      <motion.div
        animate={shakeBar === barKey ? { x: [-6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border p-2"
        style={{
          borderColor: ok
            ? "rgba(74,222,128,0.5)"
            : "rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-white/80">{label}</span>
          <span
            className="text-xs font-orbitron font-black"
            style={{ color: ok ? "#4ade80" : "#fbbf24" }}
          >
            {Math.round(value)}
          </span>
        </div>
        <div className="h-3 rounded-full bg-black/60 overflow-hidden relative">
          {/* green band markers */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: "40%",
              right: "30%",
              background: "rgba(74,222,128,0.12)",
              borderLeft: "1px dashed rgba(74,222,128,0.5)",
              borderRight: "1px dashed rgba(74,222,128,0.5)",
            }}
          />
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            animate={{ width: `${value}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(8,47,73,0.95), rgba(0,0,0,0.95))",
      }}
    >
      <div className="w-full max-w-5xl">
        {/* HUD */}
        <div className="flex items-center justify-between mb-3 glass-card rounded-2xl px-4 py-2 border border-teal-400/30 bg-black/40">
          <div className="font-orbitron font-black text-xl text-teal-300">
            🪸 Reef Rebuild
          </div>
          <div className="font-orbitron font-black text-sm text-white/70">
            Reef Health:{" "}
            <span style={{ color: reefHealth >= 50 ? "#4ade80" : "#f87171" }}>
              {reefHealth}%
            </span>
          </div>
          <button
            onClick={onExit}
            className="text-white/50 hover:text-white"
            aria-label="Exit"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4">
          {/* Reef grid */}
          <div className="rounded-2xl border border-teal-400/30 bg-gradient-to-b from-cyan-950/60 to-blue-950/60 p-3">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => placeAt(i)}
                  className="aspect-square rounded-lg border border-teal-300/15 bg-black/30 hover:bg-black/10 flex items-center justify-center text-2xl sm:text-3xl"
                >
                  {cell &&
                    TOKENS.find(t => t.id === cell)?.icon}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
              {TOKENS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className="rounded-lg border px-2 py-2 text-left text-white text-xs"
                  style={{
                    background:
                      selected === t.id
                        ? "rgba(45,212,191,0.25)"
                        : "rgba(255,255,255,0.04)",
                    borderColor:
                      selected === t.id
                        ? "#2dd4bf"
                        : "rgba(255,255,255,0.12)",
                  }}
                >
                  <div className="text-2xl">{t.icon}</div>
                  <div className="font-bold">{t.label}</div>
                  <div className="text-[10px] text-white/50">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-teal-400/30 bg-black/40 p-3 space-y-2">
              <div className="text-xs uppercase tracking-widest text-teal-200/70 mb-1">
                Ecosystem
              </div>
              <Bar
                label="Producers"
                value={bars.producers}
                color="linear-gradient(90deg,#34d399,#10b981)"
                barKey="producers"
              />
              <Bar
                label="Herbivores"
                value={bars.herbivores}
                color="linear-gradient(90deg,#22d3ee,#0ea5e9)"
                barKey="herbivores"
              />
              <Bar
                label="Predators"
                value={bars.predators}
                color="linear-gradient(90deg,#f59e0b,#ef4444)"
                barKey="predators"
              />
            </div>

            <div className="rounded-2xl border border-teal-400/30 bg-black/40 p-3">
              <div className="text-xs uppercase tracking-widest text-teal-200/70 mb-2">
                Stability
              </div>
              <div className="text-sm text-white/80 mb-1">
                {allInBand
                  ? `Holding… ${(stableLeft / 1000).toFixed(1)}s`
                  : "All bars must stay in the green band"}
              </div>
              <div className="h-2 rounded-full bg-black/60 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{
                    background:
                      "linear-gradient(90deg,#4ade80,#22d3ee)",
                  }}
                  animate={{
                    width: `${
                      allInBand
                        ? ((STABLE_MS - stableLeft) / STABLE_MS) * 100
                        : 0
                    }%`,
                  }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-white/60 leading-relaxed">
              Tip: balance is fragile. Too many predators with no fish? They
              starve. Too many fish? Plants crash.
            </div>
          </div>
        </div>

        <p className="text-white/40 text-center text-xs mt-3">
          Place tokens to balance the reef — keep all bars green for 5 seconds
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
            <div className="glass-card rounded-3xl p-8 text-center border-2 max-w-sm mx-4 bg-black/70 border-teal-400">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-2">
                You Won!
              </h2>
              <p className="text-white/60 mb-4">
                The reef thrives in balance.
              </p>
              <button
                onClick={() => onComplete(true)}
                className="w-full py-4 rounded-2xl font-black text-xl text-white"
                style={{ background: "linear-gradient(135deg,#2dd4bf,#0ea5e9)" }}
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
