import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const GRID = 6;
const CELL = 56;
const STEP_MS = 350;
const MAX_PROG = 8;

const PALETTE = [
  { id: "FWD", label: "Move Forward", icon: "⬆️" },
  { id: "LEFT", label: "Turn Left", icon: "↺" },
  { id: "RIGHT", label: "Turn Right", icon: "↻" },
  { id: "REPEAT", label: "Repeat 3", icon: "🔁" },
];

// Direction vectors (east=0, south=1, west=2, north=3)
const DIRS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 },
];

const LEVELS = [
  { bone: { x: 4, y: 0 }, obstacles: [] },
  {
    bone: { x: 3, y: 3 },
    obstacles: [{ x: 2, y: 1 }],
  },
  {
    bone: { x: 5, y: 5 },
    obstacles: [
      { x: 2, y: 2 },
      { x: 4, y: 3 },
    ],
  },
];

// Flatten a program (with REPEAT consuming next 1 child) into a primitive instruction list
function flatten(program) {
  const out = [];
  for (let i = 0; i < program.length; i++) {
    const b = program[i];
    if (b.id === "REPEAT") {
      const child = program[i + 1];
      if (child) {
        for (let r = 0; r < 3; r++) {
          if (child.id !== "REPEAT") out.push(child);
        }
        i++; // consume next
      }
    } else {
      out.push(b);
    }
  }
  return out;
}

export default function RoxyBlockCoder({ onComplete, onExit }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [program, setProgram] = useState([]);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dir, setDir] = useState(0); // 0=east
  const [running, setRunning] = useState(false);
  const [shake, setShake] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [won, setWon] = useState(false);
  const [levelDone, setLevelDone] = useState(false);
  const cancelRef = useRef(false);

  const level = LEVELS[levelIdx];

  const resetLevel = () => {
    cancelRef.current = true;
    setProgram([]);
    setPos({ x: 0, y: 0 });
    setDir(0);
    setRunning(false);
    setShake(false);
    setStepIdx(-1);
    setLevelDone(false);
  };

  useEffect(() => {
    resetLevel();
  }, [levelIdx]);

  const addBlock = (block) => {
    if (running || levelDone) return;
    if (program.length >= MAX_PROG) return;
    setProgram(p => [...p, { ...block, key: Date.now() + Math.random() }]);
  };

  const removeBlock = (idx) => {
    if (running || levelDone) return;
    setProgram(p => p.filter((_, i) => i !== idx));
  };

  const isObstacle = (x, y) =>
    level.obstacles.some(o => o.x === x && o.y === y);

  const sleep = (ms) =>
    new Promise(res => setTimeout(res, ms));

  const runProgram = async () => {
    if (running) return;
    cancelRef.current = false;
    setRunning(true);
    setPos({ x: 0, y: 0 });
    setDir(0);
    let cx = 0, cy = 0, cd = 0;
    const steps = flatten(program);
    for (let i = 0; i < steps.length; i++) {
      if (cancelRef.current) break;
      setStepIdx(i);
      const ins = steps[i];
      if (ins.id === "FWD") {
        const nx = cx + DIRS[cd].dx;
        const ny = cy + DIRS[cd].dy;
        if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID || isObstacle(nx, ny)) {
          setShake(true);
          await sleep(500);
          setShake(false);
          setRunning(false);
          setStepIdx(-1);
          return;
        }
        cx = nx;
        cy = ny;
        setPos({ x: cx, y: cy });
      } else if (ins.id === "LEFT") {
        cd = (cd + 3) % 4;
        setDir(cd);
      } else if (ins.id === "RIGHT") {
        cd = (cd + 1) % 4;
        setDir(cd);
      }
      await sleep(STEP_MS);
      if (cx === level.bone.x && cy === level.bone.y) {
        setLevelDone(true);
        setRunning(false);
        setStepIdx(-1);
        await sleep(1100);
        if (levelIdx + 1 >= LEVELS.length) {
          setWon(true);
        } else {
          setLevelIdx(l => l + 1);
        }
        return;
      }
    }
    setRunning(false);
    setStepIdx(-1);
  };

  const dirRot = dir * 90;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: "rgba(0,10,20,0.92)" }}
    >
      <div className="w-full max-w-4xl">
        {/* HUD */}
        <div className="flex items-center justify-between mb-3 glass-card rounded-2xl px-4 py-2 border border-cyan-500/30 bg-black/40">
          <div className="font-orbitron font-black text-xl text-cyan-300">
            🐕 Roxy Block Coder
          </div>
          <div className="font-orbitron font-black text-sm text-white/70">
            Level {levelIdx + 1} / {LEVELS.length}
          </div>
          <button
            onClick={onExit}
            className="text-white/50 hover:text-white"
            aria-label="Exit"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
          {/* Grid */}
          <motion.div
            animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-3 bg-black/50 border border-cyan-500/30 mx-auto"
          >
            <div
              className="relative"
              style={{
                width: GRID * CELL,
                height: GRID * CELL,
                display: "grid",
                gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`,
                gridTemplateRows: `repeat(${GRID}, ${CELL}px)`,
              }}
            >
              {Array.from({ length: GRID * GRID }).map((_, i) => {
                const x = i % GRID;
                const y = Math.floor(i / GRID);
                const isBone = x === level.bone.x && y === level.bone.y;
                const isObs = isObstacle(x, y);
                const isStart = x === 0 && y === 0;
                return (
                  <div
                    key={i}
                    className="border border-cyan-500/15 flex items-center justify-center text-2xl"
                    style={{
                      background: isStart
                        ? "rgba(34,211,238,0.08)"
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    {isObs && <span>🪨</span>}
                    {isBone && !isObs && <span>🦴</span>}
                  </div>
                );
              })}
              {/* Roxy */}
              <motion.div
                animate={{
                  x: pos.x * CELL,
                  y: pos.y * CELL,
                  rotate: dirRot,
                }}
                transition={{ type: "tween", duration: STEP_MS / 1000, ease: "easeInOut" }}
                className="absolute top-0 left-0 flex items-center justify-center pointer-events-none"
                style={{
                  width: CELL,
                  height: CELL,
                  fontSize: 32,
                  filter: "drop-shadow(0 0 8px rgba(34,211,238,0.6))",
                }}
              >
                🐕
              </motion.div>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="rounded-2xl bg-black/40 border border-cyan-500/20 p-3">
              <div className="text-xs uppercase tracking-widest text-cyan-200/70 mb-2">
                Palette
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PALETTE.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addBlock(p)}
                    disabled={running || levelDone || program.length >= MAX_PROG}
                    className="text-left px-3 py-2 rounded-lg bg-cyan-900/30 hover:bg-cyan-700/40 border border-cyan-400/30 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center gap-2"
                  >
                    <span className="text-lg">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-black/40 border border-cyan-500/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-widest text-cyan-200/70">
                  Program ({program.length}/{MAX_PROG})
                </div>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {program.length === 0 && (
                  <div className="text-white/30 text-sm italic">
                    Add blocks to build your plan
                  </div>
                )}
                {program.map((b, i) => (
                  <motion.button
                    key={b.key}
                    layout
                    onClick={() => removeBlock(i)}
                    className="px-3 py-2 rounded-lg text-white text-xs font-bold border flex items-center gap-1.5"
                    style={{
                      background:
                        stepIdx === i
                          ? "rgba(250,204,21,0.3)"
                          : "rgba(34,211,238,0.18)",
                      borderColor:
                        stepIdx === i
                          ? "#facc15"
                          : "rgba(34,211,238,0.5)",
                    }}
                  >
                    <span>{b.icon}</span>
                    {b.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={runProgram}
                disabled={running || program.length === 0 || levelDone}
                className="flex-1 py-3 rounded-xl font-black text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 disabled:opacity-40"
              >
                ▶ Run
              </button>
              <button
                onClick={resetLevel}
                className="px-5 py-3 rounded-xl font-black text-white bg-white/10 hover:bg-white/20 border border-white/15"
              >
                Reset
              </button>
            </div>
            <p className="text-white/40 text-center text-xs">
              Roxy starts facing east. Repeat consumes next block × 3.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {levelDone && !won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-cyan-500/90 text-white font-black"
          >
            🦴 Bone reached! Loading next level…
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.8)" }}
          >
            <div className="glass-card rounded-3xl p-8 text-center border-2 max-w-sm mx-4 bg-black/70 border-cyan-400">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-2">
                You Won!
              </h2>
              <p className="text-white/60 mb-4">
                Roxy fetched every bone. Good coding!
              </p>
              <button
                onClick={() => onComplete(true)}
                className="w-full py-4 rounded-2xl font-black text-xl text-white"
                style={{ background: "linear-gradient(135deg,#22d3ee,#3b82f6)" }}
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
