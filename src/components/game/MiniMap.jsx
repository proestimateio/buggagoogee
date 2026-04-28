import React from "react";
import { INTERACTABLES } from "@/lib/worldData";

const MAP_W = 140;
const MAP_H = 90;
const WORLD_W = 760;
const WORLD_H = 500;

export default function MiniMap({ world, playerPos, otherPlayers, collectedItems }) {
  const scaleX = MAP_W / WORLD_W;
  const scaleY = MAP_H / WORLD_H;

  const interactables = (INTERACTABLES[world] || []).filter(obj => !collectedItems.includes(obj.id));

  const px = Math.round(playerPos.x * scaleX);
  const py = Math.round(playerPos.y * scaleY);

  const BG_COLORS = {
    overworld: "#1a3d0a",
    space: "#020215",
    jungle: "#0d2d0d",
    ocean: "#031525",
  };

  const ACCENT_COLORS = {
    overworld: "#a855f7",
    space: "#22d3ee",
    jungle: "#4ade80",
    ocean: "#38bdf8",
  };

  const accent = ACCENT_COLORS[world] || "#a855f7";
  const bg = BG_COLORS[world] || "#0a0a18";

  return (
    <div
      className="relative rounded-xl overflow-hidden border"
      style={{
        width: MAP_W,
        height: MAP_H,
        background: bg,
        borderColor: `${accent}60`,
        boxShadow: `0 0 10px ${accent}25`,
        flexShrink: 0,
      }}
    >
      {/* World-tinted background wash */}
      <div className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse at center, ${accent}, transparent)` }} />

      {/* Interactable dots */}
      {interactables.map(obj => {
        const isDot = obj.action === "travel";
        return (
          <div
            key={obj.id}
            className="absolute rounded-full"
            title={obj.label}
            style={{
              width: isDot ? 6 : 5,
              height: isDot ? 6 : 5,
              left: Math.round(obj.x * scaleX) - (isDot ? 3 : 2.5),
              top: Math.round(obj.y * scaleY) - (isDot ? 3 : 2.5),
              background: isDot ? "#22d3ee" : "rgba(255,255,255,0.4)",
              boxShadow: isDot ? `0 0 4px #22d3ee` : "none",
            }}
          />
        );
      })}

      {/* Other players */}
      {otherPlayers.map(op => (
        <div
          key={op.id}
          className="absolute rounded-full"
          title={op.username}
          style={{
            width: 6,
            height: 6,
            left: Math.round(op.x * scaleX) - 3,
            top: Math.round(op.y * scaleY) - 3,
            background: op.color || "#22d3ee",
            boxShadow: `0 0 4px ${op.color || "#22d3ee"}`,
          }}
        />
      ))}

      {/* Player dot (pulsing) */}
      <div
        className="absolute rounded-full pulse-glow"
        style={{
          width: 8,
          height: 8,
          left: px - 4,
          top: py - 4,
          background: playerPos.color || accent,
          boxShadow: `0 0 6px ${playerPos.color || accent}`,
          zIndex: 10,
        }}
      />

      {/* Label */}
      <div className="absolute bottom-1 left-1.5 text-[9px] font-bold opacity-60"
        style={{ color: accent }}>
        MAP
      </div>
    </div>
  );
}