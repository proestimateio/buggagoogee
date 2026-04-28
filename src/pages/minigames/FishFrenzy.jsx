import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FISH_TYPES = ["🐠","🐡","🐟","🦈","🐙"];
const TIME_LIMIT = 30;
const TARGET = 10;

export default function FishFrenzy({ onComplete, onExit }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const stateRef = useRef({
    pos: { x: 350, y: 225 },
    fish: [],
    score: 0,
    hook: null,
  });
  const animRef = useRef(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setDone(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (done && score >= TARGET) setWon(true);
  }, [done, score]);

  useEffect(() => {
    // Spawn fish
    const spawn = setInterval(() => {
      const side = Math.random() > 0.5 ? -30 : 730;
      stateRef.current.fish.push({
        id: Math.random(),
        x: side,
        y: 80 + Math.random() * 340,
        vx: side < 0 ? 2 + Math.random() * 2 : -(2 + Math.random() * 2),
        type: FISH_TYPES[Math.floor(Math.random() * 3)],
      });
    }, 600);
    return () => clearInterval(spawn);
  }, []);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const s = stateRef.current;
      const keys = keysRef.current;

      const SPEED = 4;
      if (keys["ArrowLeft"] || keys["a"]) s.pos.x -= SPEED;
      if (keys["ArrowRight"] || keys["d"]) s.pos.x += SPEED;
      if (keys["ArrowUp"] || keys["w"]) s.pos.y -= SPEED;
      if (keys["ArrowDown"] || keys["s"]) s.pos.y += SPEED;
      s.pos.x = Math.max(20, Math.min(W - 20, s.pos.x));
      s.pos.y = Math.max(60, Math.min(H - 20, s.pos.y));

      // Move fish
      s.fish = s.fish.filter(f => f.x > -50 && f.x < W + 50);
      s.fish.forEach(f => f.x += f.vx);

      // Catch fish
      const before = s.fish.length;
      s.fish = s.fish.filter(f => {
        if (Math.hypot(s.pos.x - f.x, s.pos.y - f.y) < 35) {
          s.score++;
          setScore(s.score);
          if (s.score >= TARGET) { setDone(true); }
          return false;
        }
        return true;
      });

      // Draw ocean
      ctx.fillStyle = "#052840";
      ctx.fillRect(0, 0, W, H);

      // Waves
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(34,211,238,${0.05 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < W; x += 5) {
          const y2 = 30 + i * 80 + 15 * Math.sin((x + Date.now() / (200 + i * 50)) / 40);
          x === 0 ? ctx.moveTo(x, y2) : ctx.lineTo(x, y2);
        }
        ctx.stroke();
      }

      // Decorations
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      [[80,400],[200,60],[500,430],[650,80],[350,440]].forEach(([dx,dy],i) => {
        ctx.fillText(["🪸","💧","🌊","🐚","🪸"][i], dx, dy);
      });

      // Fish
      s.fish.forEach(f => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#22d3ee";
        ctx.font = "26px serif";
        ctx.textAlign = "center";
        if (f.vx > 0) {
          ctx.scale(-1, 1);
          ctx.fillText(f.type, -f.x, f.y);
        } else {
          ctx.fillText(f.type, f.x, f.y);
        }
        ctx.restore();
      });

      // Player net
      ctx.strokeStyle = "rgba(251,191,36,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.pos.x, s.pos.y, 35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#22d3ee";
      ctx.font = "32px serif";
      ctx.textAlign = "center";
      ctx.fillText("🤿", s.pos.x, s.pos.y + 8);
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
          <div className="font-orbitron font-black text-xl text-cyan-400">🐠 Fish Frenzy</div>
          <div className="font-black text-lg text-yellow-400">🎣 {score}/{TARGET}</div>
          <div className="font-orbitron font-black text-xl" style={{ color: timeLeft <= 10 ? "#ef4444" : "#22d3ee" }}>⏱ {timeLeft}s</div>
          <button onClick={onExit} className="text-white/50 hover:text-white font-bold text-sm">Exit</button>
        </div>
        <canvas ref={canvasRef} width={700} height={450} className="w-full rounded-2xl border border-cyan-500/30" />
        <p className="text-white/40 text-center text-xs mt-2">Move into fish to catch them! Catch {TARGET} to win!</p>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="glass-card rounded-3xl p-8 text-center border-2 max-w-sm mx-4"
              style={{ borderColor: won ? "#4ade80" : "#22d3ee" }}>
              <div className="text-6xl mb-4">{won ? "🏆" : "🐠"}</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-2">
                {won ? "FISHING LEGEND!" : "TIME'S UP!"}
              </h2>
              <p className="text-white/60 mb-2">Fish caught: {score}/{TARGET}</p>
              {won && <p className="text-yellow-400 font-black text-xl mb-4">+70 Coins! 🪙</p>}
              <button onClick={() => onComplete(won, score)}
                className="w-full py-4 rounded-2xl font-black text-xl text-white"
                style={{ background: won ? "linear-gradient(135deg,#4ade80,#22c55e)" : "linear-gradient(135deg,#22d3ee,#0ea5e9)" }}>
                {won ? "Claim Reward! 🎉" : "Try Again!"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}