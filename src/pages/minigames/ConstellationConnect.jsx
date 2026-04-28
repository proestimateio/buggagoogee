import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const CANVAS_W = 700;
const CANVAS_H = 450;
const HIT_RADIUS = 22;

const ROUNDS = [
  {
    name: "Big Dipper",
    caption: "Big Dipper — sailors used this to find Polaris",
    accent: "#fbbf24",
    stars: [
      [0.20, 0.45], [0.30, 0.42], [0.40, 0.45],
      [0.48, 0.50], [0.55, 0.40], [0.62, 0.35], [0.70, 0.30],
    ],
  },
  {
    name: "Orion",
    caption: "Orion — the great hunter striding across the sky",
    accent: "#60a5fa",
    stars: [
      [0.30, 0.20], [0.35, 0.30], [0.40, 0.35],
      [0.45, 0.40], [0.50, 0.45], [0.55, 0.40], [0.60, 0.50],
    ],
  },
  {
    name: "Cassiopeia",
    caption: "Cassiopeia — the queen's celestial 'W'",
    accent: "#f472b6",
    stars: [
      [0.20, 0.30], [0.30, 0.45], [0.45, 0.30],
      [0.60, 0.45], [0.70, 0.30],
    ],
  },
];

function makeFaintStars() {
  const arr = [];
  for (let i = 0; i < 50; i++) {
    arr.push({
      x: Math.random() * CANVAS_W,
      y: Math.random() * CANVAS_H,
      r: 0.6 + Math.random() * 1.3,
      a: 0.15 + Math.random() * 0.35,
    });
  }
  return arr;
}

export default function ConstellationConnect({ onComplete, onExit }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const faintRef = useRef(makeFaintStars());
  const hintEndRef = useRef(0);
  const [round, setRound] = useState(0);
  const [tapped, setTapped] = useState([]);
  const [completedAt, setCompletedAt] = useState(0);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const current = ROUNDS[round];

  // Reset starfield each round
  useEffect(() => {
    faintRef.current = makeFaintStars();
    setTapped([]);
    setCompletedAt(0);
  }, [round]);

  // Auto-advance after round complete
  useEffect(() => {
    if (!completedAt) return;
    const t = setTimeout(() => {
      if (round + 1 >= ROUNDS.length) {
        setWon(true);
      } else {
        setRound(r => r + 1);
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [completedAt, round]);

  // RAF draw loop
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width;
      const H = canvas.height;
      const now = Date.now();

      // Background
      ctx.fillStyle = "#020215";
      ctx.fillRect(0, 0, W, H);

      // Subtle nebula
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.6, 20, W * 0.5, H * 0.6, 380);
      grad.addColorStop(0, "rgba(80, 60, 180, 0.18)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Faint stars
      faintRef.current.forEach((s, i) => {
        const tw = 0.6 + 0.4 * Math.sin(now / 600 + i);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Required stars (highlighted)
      const reqPx = current.stars.map(([nx, ny]) => [nx * W, ny * H]);
      reqPx.forEach(([x, y], i) => {
        const isTapped = tapped.includes(i);
        ctx.save();
        ctx.shadowBlur = isTapped ? 22 : 12;
        ctx.shadowColor = isTapped ? current.accent : "#ffffff";
        ctx.beginPath();
        ctx.fillStyle = isTapped ? current.accent : "#ffffff";
        ctx.arc(x, y, isTapped ? 4.5 : 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Outer glow ring
        ctx.beginPath();
        ctx.strokeStyle = isTapped
          ? `${current.accent}55`
          : "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Connecting lines between consecutive taps
      if (tapped.length >= 2) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.shadowBlur = 16;
        ctx.shadowColor = current.accent;
        ctx.strokeStyle = current.accent;
        ctx.beginPath();
        for (let i = 0; i < tapped.length; i++) {
          const [x, y] = reqPx[tapped[i]];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Pulsing complete state — draw all in canonical order
      if (completedAt) {
        const elapsed = (now - completedAt) / 1000;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4);
        ctx.save();
        ctx.lineWidth = 2.5 + pulse * 1.5;
        ctx.shadowBlur = 18 + pulse * 14;
        ctx.shadowColor = current.accent;
        ctx.strokeStyle = current.accent;
        ctx.beginPath();
        reqPx.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // Hint outline
      if (now < hintEndRef.current) {
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        reqPx.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();
      } else if (showHint) {
        setShowHint(false);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [round, tapped, completedAt, current, showHint]);

  const handleClick = (e) => {
    if (completedAt || won) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    for (let i = 0; i < current.stars.length; i++) {
      const [nx, ny] = current.stars[i];
      const sx = nx * canvas.width;
      const sy = ny * canvas.height;
      if (Math.hypot(cx - sx, cy - sy) < HIT_RADIUS) {
        if (!tapped.includes(i)) {
          const next = [...tapped, i];
          setTapped(next);
          if (next.length === current.stars.length) {
            setCompletedAt(Date.now());
          }
        }
        break;
      }
    }
  };

  const triggerHint = () => {
    hintEndRef.current = Date.now() + 1000;
    setShowHint(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }}
    >
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-3 glass-card rounded-2xl px-4 py-2 border border-white/10 bg-black/40">
          <div className="font-orbitron font-black text-xl text-amber-300">
            ✨ {current.name}
          </div>
          <div className="font-orbitron font-black text-sm text-white/70">
            Round {round + 1} / {ROUNDS.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerHint}
              className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15"
            >
              Hint
            </button>
            <button
              onClick={onExit}
              className="text-white/50 hover:text-white"
              aria-label="Exit"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onClick={handleClick}
            className="w-full rounded-2xl border border-indigo-500/30 cursor-crosshair"
          />
          <AnimatePresence>
            {completedAt && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/70 border border-white/15 text-white/90 text-sm font-semibold backdrop-blur"
              >
                {current.caption}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-white/40 text-center text-xs mt-2">
          Tap each highlighted star to draw the constellation
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
            <div className="glass-card rounded-3xl p-8 text-center border-2 max-w-sm mx-4 bg-black/70 border-amber-300">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-2">
                You Won!
              </h2>
              <p className="text-white/60 mb-4">
                All three constellations connected.
              </p>
              <button
                onClick={() => onComplete(true)}
                className="w-full py-4 rounded-2xl font-black text-xl text-white"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}
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
