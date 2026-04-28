import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GEMS = [
  { id: 1, x: 80, y: 120 },
  { id: 2, x: 300, y: 60 },
  { id: 3, x: 550, y: 200 },
  { id: 4, x: 150, y: 350 },
  { id: 5, x: 620, y: 380 },
];
const OBSTACLES = [
  { x: 200, y: 150, w: 60, h: 60 },
  { x: 400, y: 250, w: 80, h: 50 },
  { x: 100, y: 230, w: 50, h: 70 },
  { x: 500, y: 100, w: 70, h: 60 },
  { x: 350, y: 350, w: 90, h: 50 },
];
const SPEED = 4;
const COLLECT_RADIUS = 35;
const TIME_LIMIT = 40;

export default function TreasureHunt({ onComplete, onExit }) {
  const [pos, setPos] = useState({ x: 380, y: 260 });
  const [collected, setCollected] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const keysRef = useRef({});
  const posRef = useRef({ x: 380, y: 260 });
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const collectedRef = useRef([]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setDone(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (collected.length === GEMS.length && !done) {
      setWon(true);
      setDone(true);
    }
  }, [collected, done]);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const keys = keysRef.current;
      let { x, y } = posRef.current;

      if (keys["ArrowLeft"] || keys["a"]) x -= SPEED;
      if (keys["ArrowRight"] || keys["d"]) x += SPEED;
      if (keys["ArrowUp"] || keys["w"]) y -= SPEED;
      if (keys["ArrowDown"] || keys["s"]) y += SPEED;
      x = Math.max(20, Math.min(W - 20, x));
      y = Math.max(20, Math.min(H - 20, y));
      posRef.current = { x, y };
      setPos({ x, y });

      // Check gem collection
      GEMS.forEach(gem => {
        if (!collectedRef.current.includes(gem.id)) {
          if (Math.hypot(x - gem.x, y - gem.y) < COLLECT_RADIUS) {
            collectedRef.current = [...collectedRef.current, gem.id];
            setCollected([...collectedRef.current]);
          }
        }
      });

      // Draw
      ctx.fillStyle = "#2d5a1b";
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

      // Obstacles
      OBSTACLES.forEach(o => {
        ctx.fillStyle = "#1a3d0a";
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.w, o.h, 8);
        ctx.fill();
        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.fillText("🌲", o.x + o.w / 2, o.y + o.h / 2 + 8);
      });

      // Gems
      GEMS.forEach(gem => {
        if (!collectedRef.current.includes(gem.id)) {
          ctx.save();
          ctx.shadowBlur = 15 + 8 * Math.sin(Date.now() / 400);
          ctx.shadowColor = "#fbbf24";
          ctx.font = "28px serif";
          ctx.textAlign = "center";
          ctx.fillText("💎", gem.x, gem.y);
          ctx.restore();
          // Radius hint
          ctx.strokeStyle = "rgba(251,191,36,0.15)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(gem.x, gem.y, COLLECT_RADIUS, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Player
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#a855f7";
      ctx.font = "32px serif";
      ctx.textAlign = "center";
      ctx.fillText("🧑", x, y + 8);
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };
    if (!done) {
      animRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [done]);

  useEffect(() => {
    const kd = e => { keysRef.current[e.key] = true; };
    const ku = e => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="w-full max-w-2xl">
        {/* HUD */}
        <div className="flex items-center justify-between mb-3 glass-card rounded-2xl px-4 py-2 border border-white/10">
          <div className="flex gap-1">
            {GEMS.map(g => (
              <span key={g.id} className="text-xl">{collected.includes(g.id) ? "💎" : "⬜"}</span>
            ))}
          </div>
          <div className="font-orbitron font-black text-2xl" style={{ color: timeLeft <= 10 ? "#ef4444" : "#22d3ee" }}>
            ⏱ {timeLeft}s
          </div>
          <button onClick={onExit} className="text-white/50 hover:text-white font-bold text-sm">Exit</button>
        </div>

        <canvas ref={canvasRef} width={700} height={450}
          className="w-full rounded-2xl border border-purple-500/30" />

        <p className="text-white/40 text-center text-xs mt-2">WASD or Arrow Keys to move · Collect all 5 gems!</p>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="glass-card rounded-3xl p-8 text-center border-2 max-w-sm mx-4"
              style={{ borderColor: won ? "#4ade80" : "#ef4444" }}>
              <div className="text-6xl mb-4">{won ? "🏆" : "😅"}</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-2">
                {won ? "TREASURE FOUND!" : "TIME'S UP!"}
              </h2>
              <p className="text-white/60 mb-2">Gems collected: {collected.length}/{GEMS.length}</p>
              {won && <p className="text-yellow-400 font-black text-xl mb-4">+50 Coins! 🪙</p>}
              <button onClick={() => onComplete(won, collected.length)}
                className="w-full py-4 rounded-2xl font-black text-xl text-white"
                style={{ background: won ? "linear-gradient(135deg,#4ade80,#22c55e)" : "linear-gradient(135deg,#a855f7,#6366f1)" }}>
                {won ? "Claim Reward! 🎉" : "Try Again!"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}