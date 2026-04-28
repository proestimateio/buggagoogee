import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy } from "lucide-react";

const CHAR_EMOJIS = { eli: "🧑", lyla: "👧", buggagoogee: "🐕", shadow: "🦊", blaze: "🔥" };
const MEDAL = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ currentSaveId }) {
  const [players, setPlayers] = useState([]);

  async function load() {
    try {
      const all = await base44.entities.GameSave.list("-coins", 5);
      setPlayers(all);
    } catch (e) {
      // silently ignore timeout/network errors
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-2xl border border-yellow-400/20 p-3 min-w-[160px]"
      style={{ background: "rgba(251,191,36,0.05)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
        <span className="font-orbitron font-black text-yellow-400 text-xs tracking-wide">TOP COINS</span>
      </div>
      <div className="space-y-1.5">
        {players.map((p, i) => (
          <div key={p.id}
            className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all ${p.id === currentSaveId ? "border border-yellow-400/40 bg-yellow-400/10" : ""}`}>
            <span className="text-sm w-4 text-center">{MEDAL[i] || `${i + 1}.`}</span>
            <span className="text-sm">{CHAR_EMOJIS[p.character] || "🎮"}</span>
            <span className={`text-xs font-bold truncate flex-1 ${p.id === currentSaveId ? "text-yellow-300" : "text-white/70"}`}>
              {p.username}
            </span>
            <span className="text-xs font-black text-yellow-400 font-orbitron">{p.coins || 0}</span>
          </div>
        ))}
        {players.length === 0 && (
          <p className="text-white/30 text-xs text-center py-1">No players yet</p>
        )}
      </div>
    </div>
  );
}