import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORMS = [
  { x: 320, y: 400, w: 80, h: 14 },
  { x: 100, y: 310, w: 80, h: 14 },
  { x: 500, y: 270, w: 80, h: 14 },
  { x: 200, y: 210, w: 80, h: 14 },
  { x: 420, y: 150, w: 80, h: 14 },
  { x: 150, y: 100, w: 80, h: 14 },
  { x: 580, y: 60, w: 80, h: 14 },
];
const VINES = [
  { x: 155, topY: 0, len: 120 },
  { x: 315, topY: 0, len: 100 },
  { x: 460, topY: 0, len: 140 },
  { x: 580, topY: 0, len: 90 },
];

export default function VineSwing({ onComplete, onExit }) {
  const [playerPos, setPlayerPos] = useState({ x: 355, y: 370 });
  const [vy, setVy] = useState(0);
  const [onGround, setOnGround] = useState(true);
  const [reached, setReached] = useState(false);
  const [fell, setFell] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const posRef = useRef({ x: 355, y: 370, vy: 0, onGround: true });
  const keysRef = useRef({});
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const s = posRef.current;
      const keys = keysRef.current;

      // Gravity
      s.vy += 0.35;

      // Horizontal
      if (keys["ArrowLeft"] || keys["a"]) s.x -= 3;
      if (keys["ArrowRight"] || keys["d"]) s.x += 3;
      s.x = Math.max(10, Math.min(W - 10, s.x));

      // Vine grab (space/up near a vine)
      let onVine = false;
      VINES.forEach(v => {
        if (Math.abs(s.x - v.x) < 20 && s.y > v.topY && s.y < v.topY + v.len + 20) {
          if ((keys[" "] || keys["ArrowUp"] || keys["w"]) && s.vy > 0) {
            s.vy = -6;
            onVine = true;
          }
        }
      });

      s.y += s.vy;

      // Platform collision
      s.onGround = false;
      PLATFORMS.forEach(p => {
        if (s.x > p.x && s.x < p.x + p.w && s.y + 16 >= p.y && s.y + 16 <= p.y + 20 && s.vy >= 0) {
          s.y = p.y - 16;
          s.vy = 0;
          s.onGround = true;
        }
      });

      // Jump from ground
      if ((keys[" "] || keys["ArrowUp"] || keys["w"]) && s.onGround) {
        s.vy = -9;
        s.onGround = false;
      }

      setPlayerPos({ x: s.x, y: s.y });

      if (s.y > H + 50) { setFell(true); posRef.current = { x: 355, y: 370, vy: 0, onGround: true }; }
      if (s.y < 80 && !hasWon) { setReached(true); setHasWon(true); }

      // Draw jungle bg
      ctx.fillStyle = "#0d2d0d";
      ctx.fillRect(0, 0, W, H);

      // Trees/deco
      ctx.font = "28px serif";
      ctx.textAlign = "center";
      [50, 130, 250, 380, 530, 660].forEach((dx, i) => {
        ctx.fillText(["🌴","🌿","🎋","🌺","🌴","🌿"][i], dx, 30);
      });

      // Vines
      VINES.forEach(v => {
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(v.x, v.topY);
        ctx.lineTo(v.x, v.topY + v.len);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "14px serif";
        ctx.fillText("🌿", v.x, v.topY + v.len);
      });

      // Platforms
      PLATFORMS.forEach((p, i) => {
        ctx.fillStyle = i === PLATFORMS.length - 1 ? "#fbbf24" : "#2d5a1b";
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 5);
        ctx.fill();
        if (i === PLATFORMS.length - 1) {
          ctx.font = "16px serif";
          ctx.textAlign = "center";
          ctx.fillText("🏆", p.x + p.w / 2, p.y - 6);
        }
      });

      // Player
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#a855f7";
      ctx.font = "28px serif";
      ctx.textAlign = "center";
      ctx.fillText("🧑", s.x, s.y + 8);
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [hasWon]);

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
        <div className="flex items-center justify-between mb-3 glass-card rounded-2xl px-4 py-2 border border-white/10">
          <div className="font-orbitron font-black text-xl text-green-400">🌿 Vine Swing</div>
          <div className="text-white/50 text-sm">Reach the golden platform!</div>
          <button onClick={onExit} className="text-white/50 hover:text-white font-bold text-sm">Exit</button>
        </div>
        <canvas ref={canvasRef} width={700} height={450} className="w-full rounded-2xl border border-green-500/30" />
        <p className="text-white/40 text-center text-xs mt-2">Arrow Keys/WASD to move · Space/Up to jump/grab vines!</p>
      </div>

      <AnimatePresence>
        {(reached || fell) && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="glass-card rounded-3xl p-8 text-center border-2 max-w-sm mx-4"
              style={{ borderColor: reached ? "#4ade80" : "#f59e0b" }}>
              <div className="text-6xl mb-4">{reached ? "🏆" : "🍃"}</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-2">
                {reached ? "TOP OF THE JUNGLE!" : "YOU FELL!"}
              </h2>
              {reached ? <p className="text-yellow-400 font-black text-xl mb-4">+60 Coins! 🪙</p> :
                <p className="text-white/60 mb-4">Don't worry! Try swinging on the vines!</p>}
              <button onClick={() => reached ? onComplete(true, 1) : (setFell(false), posRef.current = { x: 355, y: 370, vy: 0, onGround: true })}
                className="w-full py-4 rounded-2xl font-black text-xl text-white"
                style={{ background: reached ? "linear-gradient(135deg,#4ade80,#22c55e)" : "linear-gradient(135deg,#a855f7,#6366f1)" }}>
                {reached ? "Claim Reward! 🎉" : "Try Again!"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}