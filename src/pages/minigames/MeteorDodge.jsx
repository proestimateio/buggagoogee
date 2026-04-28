import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIME_LIMIT = 30;

export default function MeteorDodge({ onComplete, onExit }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const stateRef = useRef({
    pos: { x: 350, y: 380 },
    meteors: [],
    alive: true,
    survived: 0,
  });
  const animRef = useRef(null);
  const [survived, setSurvived] = useState(0);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stateRef.current.alive = false;
          setWon(true);
          setDead(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Spawn meteors
    const spawn = setInterval(() => {
      if (!stateRef.current.alive) return;
      stateRef.current.meteors.push({
        x: Math.random() * 680 + 20,
        y: -20,
        vy: 2.5 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 2,
        size: 20 + Math.random() * 20,
      });
    }, 500);
    return () => clearInterval(spawn);
  }, []);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas || !stateRef.current.alive) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const s = stateRef.current;
      const keys = keysRef.current;

      // Move player
      const SPEED = 5;
      if (keys["ArrowLeft"] || keys["a"]) s.pos.x -= SPEED;
      if (keys["ArrowRight"] || keys["d"]) s.pos.x += SPEED;
      if (keys["ArrowUp"] || keys["w"]) s.pos.y -= SPEED;
      if (keys["ArrowDown"] || keys["s"]) s.pos.y += SPEED;
      s.pos.x = Math.max(20, Math.min(W - 20, s.pos.x));
      s.pos.y = Math.max(20, Math.min(H - 20, s.pos.y));

      // Move meteors
      s.meteors = s.meteors.filter(m => m.y < H + 50);
      s.meteors.forEach(m => { m.y += m.vy; m.x += m.vx; });

      // Check collision
      s.meteors.forEach(m => {
        if (Math.hypot(s.pos.x - m.x, s.pos.y - m.y) < m.size / 2 + 14) {
          s.alive = false;
          setDead(true);
        }
      });

      s.survived++;
      setSurvived(Math.floor(s.survived / 60));

      // Draw space bg
      ctx.fillStyle = "#020215";
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 3) * 0.2})`;
        ctx.beginPath();
        ctx.arc((i * 137) % W, (i * 97 + Math.floor(Date.now() / 50) * 0.5) % H, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Meteors
      s.meteors.forEach(m => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ef4444";
        ctx.font = `${m.size}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("☄️", m.x, m.y);
        ctx.restore();
      });

      // Player
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#22d3ee";
      ctx.font = "32px serif";
      ctx.textAlign = "center";
      ctx.fillText("🚀", s.pos.x, s.pos.y + 8);
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

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
          <div className="font-orbitron font-black text-xl text-purple-400">☄️ Meteor Dodge</div>
          <div className="font-orbitron font-black text-xl" style={{ color: timeLeft <= 10 ? "#ef4444" : "#22d3ee" }}>⏱ {timeLeft}s</div>
          <button onClick={onExit} className="text-white/50 hover:text-white font-bold text-sm">Exit</button>
        </div>
        <canvas ref={canvasRef} width={700} height={450} className="w-full rounded-2xl border border-cyan-500/30" />
        <p className="text-white/40 text-center text-xs mt-2">WASD or Arrow Keys · Survive the meteor shower!</p>
      </div>

      <AnimatePresence>
        {dead && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="glass-card rounded-3xl p-8 text-center border-2 max-w-sm mx-4"
              style={{ borderColor: won ? "#4ade80" : "#ef4444" }}>
              <div className="text-6xl mb-4">{won ? "🏆" : "💥"}</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-2">
                {won ? "YOU SURVIVED!" : "DIRECT HIT!"}
              </h2>
              <p className="text-white/60 mb-2">Time survived: {survived}s</p>
              {won && <p className="text-yellow-400 font-black text-xl mb-4">+80 Coins! 🪙</p>}
              <button onClick={() => onComplete(won, survived)}
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