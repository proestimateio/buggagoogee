import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { CHARACTERS } from "@/lib/worldData";
import { DEFAULT_APPEARANCE, PRESET_LOOKS } from "@/lib/gameData";
import { Zap, Users, Lock, RotateCcw } from "lucide-react";
import AvatarCreator from "@/components/game/AvatarCreator";

const LAST_SAVE_KEY = "buggagoogee_last_save_id";

export default function Landing() {
  const navigate = useNavigate();
  const [step, setStep] = useState("welcome"); // welcome, choose, username, customize
  const [selectedChar, setSelectedChar] = useState(null);
  const [username, setUsername] = useState("");
  const [appearance, setAppearance] = useState(DEFAULT_APPEARANCE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSave, setLastSave] = useState(null);

  // Try to detect a previous save for the Continue button
  useEffect(() => {
    const id = localStorage.getItem(LAST_SAVE_KEY);
    if (!id) return;
    (async () => {
      try {
        const matches = await base44.entities.GameSave.filter({ id });
        if (matches.length > 0) setLastSave(matches[0]);
      } catch {}
    })();
  }, []);

  async function handleStart(finalAppearance) {
    if (!username.trim() || username.trim().length < 2) {
      setError("Username must be at least 2 characters!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const existing = await base44.entities.GameSave.filter({
        username: username.trim(),
        character: selectedChar.id,
      });
      let save;
      if (existing.length > 0) {
        save = existing[0];
        await base44.entities.GameSave.update(save.id, {
          online: true,
          last_played: new Date().toISOString(),
          character_color: selectedChar.color,
          appearance: finalAppearance,
        });
      } else {
        save = await base44.entities.GameSave.create({
          username: username.trim(),
          character: selectedChar.id,
          character_color: selectedChar.color,
          appearance: finalAppearance,
          pos_x: 1.5,
          pos_y: 1.5,
          current_world: "overworld",
          coins: 0,
          level: 1,
          xp: 0,
          inventory: [],
          completed_minigames: [],
          explored_areas: ["overworld"],
          high_scores: {},
          adventure_progress: {},
          active_adventure: null,
          unlocked_achievements: [],
          unlocked_skins: [selectedChar.id],
          last_played: new Date().toISOString(),
          online: true,
        });
      }
      try { localStorage.setItem(LAST_SAVE_KEY, save.id); } catch {}
      navigate(`/world?saveId=${save.id}`);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Try again!");
    }
    setLoading(false);
  }

  function continueSave() {
    if (!lastSave) return;
    navigate(`/world?saveId=${lastSave.id}`);
  }

  function clearSave() {
    try { localStorage.removeItem(LAST_SAVE_KEY); } catch {}
    setLastSave(null);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#000510" }}
    >
      {/* Retro background layers */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
        zIndex: 1,
      }} />
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: "linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)",
        backgroundSize: "8px 8px",
        zIndex: 1,
      }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {[...Array(14)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: (i % 3 + 1) * 4,
              height: (i % 3 + 1) * 4,
              left: `${(i * 83) % 100}%`,
              top: `${(i * 67) % 100}%`,
              background: ["#a855f7", "#22d3ee", "#fbbf24", "#ec4899"][i % 4],
              opacity: 0.25,
              animation: `floatAnim ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.4) % 3}s`,
              boxShadow: "0 0 8px currentColor",
            }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* WELCOME */}
        {step === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="text-center max-w-lg w-full">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
              className="text-8xl mb-3 roxy-bounce inline-block"
              style={{ filter: "drop-shadow(0 0 24px rgba(168,85,247,0.8))" }}
            >🐕</motion.div>

            <div className="mb-1 font-orbitron text-xs tracking-[0.4em] text-purple-400 uppercase">
              ▶ INSERT COIN · PRESS START ◀
            </div>

            <h1 className="font-orbitron font-black text-4xl md:text-6xl mb-1 leading-tight" style={{
              background: "linear-gradient(135deg, #a855f7 0%, #22d3ee 50%, #fbbf24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(168,85,247,0.7))",
            }}>
              THE ADVENTURES<br />OF BUGGAGOOGEE
            </h1>

            <div className="flex items-center gap-2 my-3 w-full justify-center">
              <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(90deg, transparent, #a855f7)" }} />
              <span className="font-orbitron text-xs text-purple-400 tracking-widest">OPEN-WORLD MULTIPLAYER</span>
              <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(90deg, #a855f7, transparent)" }} />
            </div>

            <p className="text-white/50 mb-6 font-bold text-sm tracking-widest uppercase">
              🌍 6 Worlds · 👥 Multiplayer · 🎮 Mini-Games · 🐕 Roxy
            </p>

            <div className="grid grid-cols-3 gap-2 mb-5 w-full max-w-sm mx-auto">
              {[
                { emoji: "👤", label: "AVATAR",      sub: "Build Yours" },
                { emoji: "🌐", label: "OPEN WORLD",  sub: "Walk Anywhere" },
                { emoji: "🏆", label: "ADVENTURES",  sub: "Quest & Earn" },
              ].map(f => (
                <div key={f.label} className="rounded-xl p-3 border text-center"
                  style={{ background: "rgba(168,85,247,0.05)", borderColor: "rgba(168,85,247,0.25)" }}>
                  <div className="text-2xl mb-1">{f.emoji}</div>
                  <div className="text-purple-300 text-[10px] font-black font-orbitron leading-tight">{f.label}</div>
                  <div className="text-white/30 text-[9px]">{f.sub}</div>
                </div>
              ))}
            </div>

            {lastSave && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl border border-cyan-400/30 p-3 mb-3 flex items-center gap-3"
              >
                <div className="text-3xl">{CHARACTERS.find(c => c.id === lastSave.character)?.emoji || "🐕"}</div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] font-orbitron text-cyan-300 tracking-widest">LAST SAVE</div>
                  <div className="font-black text-white">{lastSave.username}</div>
                  <div className="text-[10px] text-white/50">
                    Lv {Math.max(1, Math.floor((lastSave.xp || 0) / 100) + 1)} · {lastSave.coins || 0} 🪙
                  </div>
                </div>
                <button onClick={continueSave}
                  className="px-3 py-2 rounded-xl font-black text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)" }}>
                  Continue →
                </button>
                <button onClick={clearSave}
                  className="p-2 rounded-xl text-white/30 hover:text-white/70" title="Forget save">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168,85,247,0.8)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep("choose")}
              className="btn-primary text-white text-xl font-black px-16 py-5 pulse-glow font-orbitron tracking-wider">
              <Zap className="inline w-6 h-6 mr-2" /> {lastSave ? "NEW GAME" : "PLAY NOW!"}
            </motion.button>

            <div className="mt-3 font-orbitron text-xs text-white/20 tracking-widest animate-pulse">
              © BUGGAGOOGEE STUDIOS · ALL RIGHTS RESERVED
            </div>
          </motion.div>
        )}

        {/* CHARACTER SELECT */}
        {step === "choose" && (
          <motion.div key="choose" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-3xl">
            <h2 className="font-orbitron font-black text-3xl text-white text-center mb-2">Choose Your Hero</h2>
            <p className="text-white/50 text-center mb-6">Eli and Lyla are ready to roll. More skins unlock as you level up!</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {CHARACTERS.map(char => {
                const locked = char.unlockLevel > 0;
                return (
                  <motion.button
                    key={char.id}
                    whileHover={!locked ? { scale: 1.04, y: -3 } : undefined}
                    whileTap={!locked ? { scale: 0.96 } : undefined}
                    disabled={locked}
                    onClick={() => !locked && setSelectedChar(char)}
                    className={`glass-card rounded-2xl p-4 border-2 transition-all text-center relative ${
                      selectedChar?.id === char.id ? "" : "border-white/10"
                    } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                    style={
                      selectedChar?.id === char.id
                        ? { borderColor: char.color, boxShadow: `0 0 20px ${char.color}50` }
                        : {}
                    }
                  >
                    <div className="text-5xl mb-2">{char.emoji}</div>
                    <div className="font-black text-white">{char.name}</div>
                    <div className="text-xs font-semibold mt-1" style={{ color: char.color }}>{char.description}</div>
                    {locked && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 text-white/70 text-[10px] font-black">
                        <Lock className="w-3 h-3" /> Lv {char.unlockLevel}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedChar && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setStep("username")}
                  className="w-full py-4 rounded-2xl font-black text-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${selectedChar.color}, ${selectedChar.color}99)` }}>
                  Play as {selectedChar.name} {selectedChar.emoji} →
                </motion.button>
              )}
            </AnimatePresence>
            <button onClick={() => setStep("welcome")}
              className="w-full mt-3 py-3 text-white/40 font-semibold hover:text-white/70 transition-colors">
              ← Back
            </button>
          </motion.div>
        )}

        {/* USERNAME */}
        {step === "username" && (
          <motion.div key="username" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-7xl mb-3">{selectedChar?.emoji}</div>
              <h2 className="font-orbitron font-black text-3xl text-white mb-1">Pick a Username</h2>
              <p className="text-white/50">This is how other players will see you in chat & multiplayer.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 mb-4">
              <label className="text-white/60 text-sm font-bold uppercase tracking-wider block mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.slice(0, 16))}
                onKeyDown={e => e.key === "Enter" && username.trim().length >= 2 && setStep("customize")}
                placeholder="Enter your username..."
                maxLength={16}
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-lg placeholder-white/30 outline-none focus:border-purple-400 transition-colors"
              />
              <div className="text-white/30 text-xs mt-1 text-right">{username.length}/16</div>
              {error && <p className="text-red-400 text-sm font-bold mt-2">{error}</p>}
            </div>

            <div className="glass-card rounded-2xl p-3 border border-white/10 mb-6 flex items-center gap-3">
              <Users className="w-5 h-5 text-cyan-400" />
              <p className="text-white/60 text-sm">Auto-saves while you play. Come back anytime with the same username + hero.</p>
            </div>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!username.trim() || username.trim().length < 2) { setError("Username must be at least 2 characters!"); return; }
                setError("");
                setAppearance(prev => ({ ...DEFAULT_APPEARANCE, ...(PRESET_LOOKS[selectedChar.id] || {}), ...prev }));
                setStep("customize");
              }}
              className="w-full py-5 rounded-2xl font-black text-xl text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${selectedChar?.color}, ${selectedChar?.color}99)` }}>
              Next: Build Your Avatar →
            </motion.button>

            <button onClick={() => setStep("choose")}
              className="w-full mt-3 py-3 text-white/40 font-semibold hover:text-white/70 transition-colors">
              ← Back
            </button>
          </motion.div>
        )}

        {/* AVATAR CREATOR */}
        {step === "customize" && (
          <AvatarCreator
            initialAppearance={{ ...DEFAULT_APPEARANCE, ...(PRESET_LOOKS[selectedChar.id] || {}) }}
            characterId={selectedChar?.id}
            onConfirm={(a) => { setAppearance(a); handleStart(a); }}
            onBack={() => setStep("username")}
          />
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="text-center">
            <div className="text-7xl mb-3 roxy-bounce">🐕</div>
            <p className="font-orbitron font-black text-2xl text-purple-300">Loading World...</p>
          </div>
        </div>
      )}
    </div>
  );
}
