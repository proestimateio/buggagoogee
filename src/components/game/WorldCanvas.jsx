import React, { useEffect, useRef, useCallback } from "react";
import { INTERACTABLES } from "@/lib/worldData";

const TILE_SIZE = 48;
const PLAYER_SIZE = 36;
const SPEED = 3;
const INTERACT_RADIUS = 60;

const WORLD_VISUALS = {
  overworld: {
    bg: "#2d5a1b",
    tiles: [
      { x: 0, y: 0, w: 760, h: 500, color: "#3a7a20" },
      { x: 50, y: 50, w: 80, h: 80, color: "#2a5a15", rx: 8 },
      { x: 400, y: 200, w: 120, h: 60, color: "#4a9a30", rx: 20 },
      { x: 600, y: 300, w: 100, h: 80, color: "#2a5a15", rx: 8 },
      { x: 580, y: 80, w: 60, h: 200, color: "#1a4a10", rx: 5 },
      { x: 50, y: 300, w: 200, h: 60, color: "#6ab04c", rx: 12 },
      { x: 300, y: 400, w: 180, h: 60, color: "#3a7a20", rx: 8 },
    ],
    decorations: ["🌲","🌳","🌲","🌿","🍄","🌸","🌼"],
    decoPositions: [[80,80],[500,130],[200,400],[650,200],[350,450],[100,180],[620,420]],
  },
  space: {
    bg: "#020215",
    tiles: [
      { x: 0, y: 0, w: 760, h: 500, color: "#050520" },
      { x: 100, y: 50, w: 60, h: 60, color: "#151560", rx: 30 },
      { x: 400, y: 150, w: 80, h: 80, color: "#0a0a3a", rx: 40 },
      { x: 600, y: 300, w: 100, h: 100, color: "#0d0d45", rx: 50 },
    ],
    decorations: ["⭐","🌟","✨","💫","⭐","🌟"],
    decoPositions: [[50,30],[200,80],[450,30],[650,80],[150,400],[550,450]],
  },
  jungle: {
    bg: "#0d2d0d",
    tiles: [
      { x: 0, y: 0, w: 760, h: 500, color: "#1a3d0a" },
      { x: 80, y: 80, w: 100, h: 80, color: "#0d2d0d", rx: 10 },
      { x: 500, y: 200, w: 120, h: 100, color: "#2a5a0a", rx: 15 },
      { x: 200, y: 350, w: 150, h: 80, color: "#0d2d0d", rx: 8 },
    ],
    decorations: ["🌴","🌿","🎋","🌱","🌺","🌸","🌴"],
    decoPositions: [[50,50],[300,80],[600,60],[150,300],[550,350],[700,150],[400,430]],
  },
  ocean: {
    bg: "#031525",
    tiles: [
      { x: 0, y: 0, w: 760, h: 500, color: "#052840" },
      { x: 100, y: 100, w: 80, h: 60, color: "#0a4060", rx: 20 },
      { x: 400, y: 200, w: 100, h: 80, color: "#073050", rx: 30 },
      { x: 580, y: 350, w: 120, h: 80, color: "#0a4060", rx: 15 },
    ],
    decorations: ["🐠","🐡","🐙","🦑","🐚","🪸","🐟"],
    decoPositions: [[80,60],[300,100],[650,120],[200,380],[550,420],[100,300],[450,450]],
  },
};

// Walk cycle: returns a bob offset and leg angle based on time + isMoving
function getWalkCycle(isMoving) {
  if (!isMoving) return { bob: 0, legSwing: 0 };
  const t = Date.now() / 160;
  return { bob: Math.sin(t * 2) * 2.5, legSwing: Math.sin(t) };
}

function drawEli(ctx, x, y, bob, legSwing, facingLeft) {
  ctx.save();
  ctx.translate(x, y + bob);
  if (facingLeft) ctx.scale(-1, 1);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (blue trousers)
  const lA = legSwing * 6;
  ctx.fillStyle = "#3b5bdb";
  // left leg
  ctx.save(); ctx.translate(-5, 6); ctx.rotate((lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 6, 11, 2); ctx.fill();
  ctx.restore();
  // right leg
  ctx.save(); ctx.translate(5, 6); ctx.rotate((-lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 6, 11, 2); ctx.fill();
  ctx.restore();

  // Shoes
  ctx.fillStyle = "#1a1a2e";
  ctx.save(); ctx.translate(-5, 16); ctx.rotate((lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-4, 0, 8, 4, 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(5, 16); ctx.rotate((-lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-4, 0, 8, 4, 2); ctx.fill(); ctx.restore();

  // Body (blue suit jacket)
  ctx.fillStyle = "#4c6ef5";
  ctx.beginPath(); ctx.roundRect(-8, -10, 16, 16, 3); ctx.fill();

  // White shirt collar
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.roundRect(-3, -10, 6, 5, 1); ctx.fill();

  // Arms swinging
  ctx.fillStyle = "#4c6ef5";
  ctx.save(); ctx.translate(-10, -7); ctx.rotate((-lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 5, 10, 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(10, -7); ctx.rotate((lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-2, 0, 5, 10, 2); ctx.fill(); ctx.restore();

  // Head (skin tone - fair)
  ctx.fillStyle = "#f4a460";
  ctx.beginPath(); ctx.arc(0, -17, 9, 0, Math.PI * 2); ctx.fill();

  // Dark brown hair (boy cut)
  ctx.fillStyle = "#3d2314";
  ctx.beginPath(); ctx.arc(0, -23, 9, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.roundRect(-9, -23, 18, 6, 2); ctx.fill();

  // Eyes
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath(); ctx.arc(-3, -17, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -17, 1.5, 0, Math.PI * 2); ctx.fill();

  // Smile
  ctx.strokeStyle = "#a0522d";
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(0, -14, 3, 0.2, Math.PI - 0.2); ctx.stroke();

  ctx.restore();
}

function drawLyla(ctx, x, y, bob, legSwing, facingLeft) {
  ctx.save();
  ctx.translate(x, y + bob);
  if (facingLeft) ctx.scale(-1, 1);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dress / skirt (floral pink)
  ctx.fillStyle = "#f9a8d4";
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-13, 16);
  ctx.lineTo(13, 16);
  ctx.lineTo(10, 0);
  ctx.closePath();
  ctx.fill();

  // Floral pattern dots on dress
  ctx.fillStyle = "#f43f5e";
  [[-5, 8], [3, 5], [-2, 12], [6, 10]].forEach(([dx, dy]) => {
    ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = "#a3e635";
  [[-7, 6], [5, 13]].forEach(([dx, dy]) => {
    ctx.beginPath(); ctx.arc(dx, dy, 1, 0, Math.PI * 2); ctx.fill();
  });

  // Legs (slight sway under dress)
  const lA = legSwing * 4;
  ctx.fillStyle = "#fce7f3";
  ctx.save(); ctx.translate(-4, 14); ctx.rotate((lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 6, 8, 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(4, 14); ctx.rotate((-lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 6, 8, 2); ctx.fill(); ctx.restore();

  // Shoes (pink)
  ctx.fillStyle = "#ec4899";
  ctx.save(); ctx.translate(-4, 21); ctx.rotate((lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-4, 0, 8, 3, 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(4, 21); ctx.rotate((-lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-4, 0, 8, 3, 2); ctx.fill(); ctx.restore();

  // Body (pink cardigan)
  ctx.fillStyle = "#f9a8d4";
  ctx.beginPath(); ctx.roundRect(-7, -10, 14, 12, 3); ctx.fill();

  // Arms
  ctx.fillStyle = "#f9a8d4";
  ctx.save(); ctx.translate(-9, -7); ctx.rotate((-lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 5, 10, 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(9, -7); ctx.rotate((lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-2, 0, 5, 10, 2); ctx.fill(); ctx.restore();

  // Head
  ctx.fillStyle = "#f4a460";
  ctx.beginPath(); ctx.arc(0, -18, 9, 0, Math.PI * 2); ctx.fill();

  // Dark brown hair with pigtails
  ctx.fillStyle = "#3d2314";
  ctx.beginPath(); ctx.arc(0, -24, 9, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.roundRect(-9, -24, 18, 7, 2); ctx.fill();
  // Side hair
  ctx.beginPath(); ctx.roundRect(-12, -24, 5, 14, 3); ctx.fill();
  ctx.beginPath(); ctx.roundRect(7, -24, 5, 14, 3); ctx.fill();

  // Flower in hair (pink)
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(8, -28, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f9a8d4";
  [0, 1, 2, 3, 4].forEach(i => {
    const a = (i * Math.PI * 2) / 5;
    ctx.beginPath(); ctx.arc(8 + Math.cos(a) * 4, -28 + Math.sin(a) * 4, 2.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(8, -28, 2, 0, Math.PI * 2); ctx.fill();

  // Eyes
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath(); ctx.arc(-3, -18, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -18, 1.5, 0, Math.PI * 2); ctx.fill();

  // Smile
  ctx.strokeStyle = "#a0522d";
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(0, -15, 3, 0.2, Math.PI - 0.2); ctx.stroke();

  ctx.restore();
}

function drawRoxy(ctx, x, y, bob, legSwing, facingLeft) {
  ctx.save();
  ctx.translate(x, y + bob);
  if (facingLeft) ctx.scale(-1, 1);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const lA = legSwing * 18;
  const goldenLab = "#d4852a";
  const goldenLabLight = "#e8a84a";

  // Back legs
  ctx.fillStyle = goldenLab;
  ctx.save(); ctx.translate(-9, 4); ctx.rotate((-lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 6, 9, 3); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(-5, 4); ctx.rotate((lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 6, 9, 3); ctx.fill(); ctx.restore();

  // Body
  ctx.fillStyle = goldenLab;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly lighter patch
  ctx.fillStyle = goldenLabLight;
  ctx.beginPath();
  ctx.ellipse(2, 2, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail (wagging!)
  const waggle = Math.sin(Date.now() / 120) * 30;
  ctx.fillStyle = goldenLab;
  ctx.save();
  ctx.translate(-14, -3);
  ctx.rotate(((-25 + waggle) * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, -12, 5, 12, 4); ctx.fill();
  ctx.restore();

  // Front legs
  ctx.fillStyle = goldenLab;
  ctx.save(); ctx.translate(9, 4); ctx.rotate((lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 6, 9, 3); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(5, 4); ctx.rotate((-lA * Math.PI) / 180);
  ctx.beginPath(); ctx.roundRect(-3, 0, 6, 9, 3); ctx.fill(); ctx.restore();

  // Paws
  ctx.fillStyle = "#c87830";
  [[-9, 12], [-5, 12], [9, 12], [5, 12]].forEach(([px, py]) => {
    ctx.beginPath(); ctx.ellipse(px, py, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  });

  // Head
  ctx.fillStyle = goldenLab;
  ctx.beginPath();
  ctx.arc(16, -5, 10, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = goldenLabLight;
  ctx.beginPath();
  ctx.ellipse(23, -2, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#2d1a0e";
  ctx.beginPath(); ctx.ellipse(26, -3, 3, 2, 0, 0, Math.PI * 2); ctx.fill();

  // Eyes
  ctx.fillStyle = "#3d2000";
  ctx.beginPath(); ctx.arc(18, -7, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath(); ctx.arc(19, -8, 0.9, 0, Math.PI * 2); ctx.fill();

  // Floppy ears
  ctx.fillStyle = "#b87320";
  ctx.beginPath();
  ctx.moveTo(12, -12);
  ctx.bezierCurveTo(6, -10, 6, 2, 10, 4);
  ctx.bezierCurveTo(12, 2, 12, -6, 12, -12);
  ctx.fill();

  // Collar (red)
  ctx.fillStyle = "#ef4444";
  ctx.beginPath(); ctx.roundRect(9, -8, 12, 3, 2); ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(15, -5, 2, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

function drawCharacter(ctx, pos, keys) {
  const isMoving = keys["ArrowLeft"] || keys["a"] || keys["A"] ||
    keys["ArrowRight"] || keys["d"] || keys["D"] ||
    keys["ArrowUp"] || keys["w"] || keys["W"] ||
    keys["ArrowDown"] || keys["s"] || keys["S"];
  const facingLeft = !!(keys["ArrowLeft"] || keys["a"] || keys["A"]);

  const { bob, legSwing } = getWalkCycle(isMoving);

  ctx.save();
  ctx.shadowBlur = 15;
  ctx.shadowColor = pos.color || "#a855f7";

  const charId = pos.charId;
  if (charId === "eli") {
    drawEli(ctx, pos.x, pos.y, bob, legSwing, facingLeft);
  } else if (charId === "lyla") {
    drawLyla(ctx, pos.x, pos.y, bob, legSwing, facingLeft);
  } else if (charId === "buggagoogee") {
    drawRoxy(ctx, pos.x, pos.y, bob, legSwing, facingLeft);
  } else {
    // Fallback: emoji for other characters with gentle bob
    ctx.save();
    ctx.font = `${PLAYER_SIZE}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(pos.emoji || "🧑", pos.x, pos.y + 8 + bob);
    ctx.restore();
  }
  ctx.restore();
}

export default function WorldCanvas({ world, playerPos, setPlayerPos, onInteract, otherPlayers, collectedItems }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const posRef = useRef(playerPos);
  const animFrameRef = useRef(null);

  posRef.current = playerPos;

  const interactables = (INTERACTABLES[world] || []).filter(obj => !collectedItems.includes(obj.id));
  const visual = WORLD_VISUALS[world] || WORLD_VISUALS.overworld;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const pos = posRef.current;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = visual.bg;
    ctx.fillRect(0, 0, W, H);

    // Tiles
    visual.tiles.forEach(tile => {
      ctx.fillStyle = tile.color;
      if (tile.rx) {
        ctx.beginPath();
        ctx.roundRect(tile.x, tile.y, tile.w, tile.h, tile.rx);
        ctx.fill();
      } else {
        ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
      }
    });

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += TILE_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += TILE_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Decorations
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    visual.decoPositions.forEach(([dx, dy], i) => {
      ctx.fillText(visual.decorations[i % visual.decorations.length], dx, dy);
    });

    // Interactables
    interactables.forEach(obj => {
      const dist = Math.hypot(pos.x - obj.x, pos.y - obj.y);
      const inRange = dist < INTERACT_RADIUS;
      const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 300);

      if (obj.edgePortal) {
        // Render edge portals as glowing archway bars
        const isNS = obj.id === "portal_north" || obj.id === "portal_south"; // horizontal bar
        const barW = isNS ? 80 : 14;
        const barH = isNS ? 14 : 80;
        ctx.save();
        ctx.shadowBlur = inRange ? 30 : 14;
        ctx.shadowColor = "#a855f7";
        ctx.globalAlpha = inRange ? pulse : 0.7;
        const grad = isNS
          ? ctx.createLinearGradient(obj.x - barW / 2, obj.y, obj.x + barW / 2, obj.y)
          : ctx.createLinearGradient(obj.x, obj.y - barH / 2, obj.x, obj.y + barH / 2);
        grad.addColorStop(0, "rgba(168,85,247,0)");
        grad.addColorStop(0.5, "rgba(168,85,247,0.9)");
        grad.addColorStop(1, "rgba(168,85,247,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(obj.x - barW / 2, obj.y - barH / 2, barW, barH, 6);
        ctx.fill();
        ctx.restore();

        // Spinning swirl emoji
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate((Date.now() / 800) % (Math.PI * 2));
        ctx.font = "22px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🌀", 0, 0);
        ctx.restore();

        // Label + prompt
        if (inRange) {
          ctx.fillStyle = "rgba(0,0,0,0.75)";
          ctx.font = "bold 11px Nunito, sans-serif";
          ctx.textAlign = "center";
          const labelY = isNS && obj.id === "portal_north" ? obj.y + 28 : obj.y - 28;
          const lw = ctx.measureText(obj.label).width + 14;
          ctx.beginPath();
          ctx.roundRect(obj.x - lw / 2, labelY - 15, lw, 20, 6);
          ctx.fill();
          ctx.fillStyle = "#e879f9";
          ctx.fillText(obj.label, obj.x, labelY - 1);
          ctx.fillStyle = "#c084fc";
          ctx.font = "bold 9px Nunito, sans-serif";
          const promptY = isNS && obj.id === "portal_north" ? labelY + 14 : labelY - 14;
          ctx.fillText("Press E to travel", obj.x, promptY);
        } else {
          ctx.fillStyle = "rgba(232,121,249,0.7)";
          ctx.font = "9px Nunito, sans-serif";
          ctx.textAlign = "center";
          const labelY = isNS && obj.id === "portal_north" ? obj.y + 22 : obj.y - 22;
          ctx.fillText(obj.label, obj.x, labelY);
        }
        return;
      }

      // Regular interactables
      if (inRange) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#a855f7";
        ctx.globalAlpha = pulse;
      }

      ctx.font = "28px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(obj.emoji, obj.x, obj.y);

      if (inRange) {
        ctx.restore();
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        const tw = ctx.measureText(obj.label).width + 12;
        ctx.beginPath();
        ctx.roundRect(obj.x - tw / 2, obj.y - 48, tw, 22, 8);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px Nunito, sans-serif";
        ctx.fillText(obj.label, obj.x, obj.y - 31);
        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 9px Nunito, sans-serif";
        ctx.fillText("Press E to interact", obj.x, obj.y - 14);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "10px Nunito, sans-serif";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(obj.label, obj.x, obj.y + 20);
      }
    });

    // Other players
    otherPlayers.forEach(op => {
      // Draw with animated character (other players always idle)
      const { bob } = getWalkCycle(false);
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = op.color || "#22d3ee";
      if (op.charId === "eli") drawEli(ctx, op.x, op.y, 0, 0, false);
      else if (op.charId === "lyla") drawLyla(ctx, op.x, op.y, 0, 0, false);
      else if (op.charId === "buggagoogee") drawRoxy(ctx, op.x, op.y, 0, 0, false);
      else {
        ctx.font = "28px serif";
        ctx.textAlign = "center";
        ctx.fillText(op.emoji, op.x, op.y);
      }
      ctx.restore();

      ctx.fillStyle = op.color || "#22d3ee";
      ctx.font = "bold 11px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(op.username, op.x, op.y - 28);
    });

    // Draw player with animated character
    drawCharacter(ctx, pos, keysRef.current);

    // Player username
    ctx.fillStyle = pos.color || "#a855f7";
    ctx.font = "bold 12px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pos.username || "You", pos.x, pos.y - 28);

    // "You" indicator arrow
    ctx.fillStyle = pos.color || "#a855f7";
    ctx.font = "10px serif";
    ctx.fillText("▼", pos.x, pos.y - 42);
  }, [world, interactables, otherPlayers, visual]);

  useEffect(() => {
    const loop = () => {
      const keys = keysRef.current;
      const pos = posRef.current;
      let { x, y } = pos;
      const canvas = canvasRef.current;
      const W = canvas?.width || 760;
      const H = canvas?.height || 500;
      const margin = 20;

      if (keys["ArrowLeft"] || keys["a"] || keys["A"]) x -= SPEED;
      if (keys["ArrowRight"] || keys["d"] || keys["D"]) x += SPEED;
      if (keys["ArrowUp"] || keys["w"] || keys["W"]) y -= SPEED;
      if (keys["ArrowDown"] || keys["s"] || keys["S"]) y += SPEED;

      x = Math.max(margin, Math.min(W - margin, x));
      y = Math.max(margin, Math.min(H - margin, y));

      if (x !== pos.x || y !== pos.y) {
        setPlayerPos(prev => ({ ...prev, x, y }));
      }

      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw, setPlayerPos]);

  // Auto-trigger edge portals when player walks into the wall
  useEffect(() => {
    const triggered = { current: false };
    const interval = setInterval(() => {
      const pos = posRef.current;
      const canvas = canvasRef.current;
      const W = canvas?.width || 760;
      const H = canvas?.height || 500;
      const EDGE = 35;
      const atEdge = pos.x <= EDGE || pos.x >= W - EDGE || pos.y <= EDGE || pos.y >= H - EDGE;
      if (atEdge && !triggered.current) {
        const portal = interactables.find(obj =>
          obj.edgePortal && Math.hypot(pos.x - obj.x, pos.y - obj.y) < INTERACT_RADIUS
        );
        if (portal) {
          triggered.current = true;
          onInteract(portal);
          setTimeout(() => { triggered.current = false; }, 2000);
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [interactables, onInteract]);

  useEffect(() => {
    const onKeyDown = (e) => {
      keysRef.current[e.key] = true;
      if (e.key === "e" || e.key === "E") {
        const pos = posRef.current;
        const nearby = interactables.find(obj =>
          Math.hypot(pos.x - obj.x, pos.y - obj.y) < INTERACT_RADIUS
        );
        if (nearby) onInteract(nearby);
      }
    };
    const onKeyUp = (e) => { keysRef.current[e.key] = false; };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [interactables, onInteract]);

  return (
    <div className="relative w-full" style={{ touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        width={760}
        height={500}
        className="w-full rounded-2xl"
        style={{ imageRendering: "pixelated", cursor: "crosshair", maxHeight: "70vh", objectFit: "contain" }}
      />
      {/* Mobile D-pad */}
      <MobileControls keysRef={keysRef} />
    </div>
  );
}

function MobileControls({ keysRef }) {
  const press = (key, down) => { keysRef.current[key] = down; };
  const btn = (label, key, pos) => (
    <button
      key={key}
      onPointerDown={() => press(key, true)}
      onPointerUp={() => press(key, false)}
      onPointerLeave={() => press(key, false)}
      className="w-12 h-12 rounded-xl glass-card border border-white/20 flex items-center justify-center text-white font-black text-xl select-none active:bg-white/20"
      style={{ position: "absolute", ...pos, touchAction: "none" }}
    >
      {label}
    </button>
  );
  return (
    <div className="md:hidden" style={{ position: "absolute", bottom: 16, left: 16 }}>
      <div style={{ position: "relative", width: 150, height: 150 }}>
        {btn("↑", "ArrowUp", { top: 0, left: 48 })}
        {btn("↓", "ArrowDown", { top: 96, left: 48 })}
        {btn("←", "ArrowLeft", { top: 48, left: 0 })}
        {btn("→", "ArrowRight", { top: 48, left: 96 })}
      </div>
    </div>
  );
}