import React, { useRef, useEffect, useCallback } from "react";

// ── Resolution: render at lower res, upscale for retro pixel look ─────────────
const RENDER_W = 320;
const RENDER_H = 200;
const FOV = Math.PI / 2.5;
const NUM_RAYS = RENDER_W;
const MAX_DEPTH = 16;

// ── World configs ──────────────────────────────────────────────────────────────
const WORLD_CONFIG = {
  home: {
    wallPalette: [
      [[120,85,55],[145,105,70],[100,70,45],[135,100,65]],   // type 0: warm beige walls
      [[85,65,45],[105,80,55],[70,52,35],[95,75,50]],         // type 1: wood panelling
    ],
    floorColor:  [90,65,35],
    ceilColor:   [200,185,160],
    fog:         [180,155,120],
    fogDist:     10,
    skyColors:   ["#c8b89a","#d4c5a5","#c0aa88","#cbbca0"],
    particles:   "dust",
    accentColor: "#f59e0b",
    wallTex:     "brick",
    floorTex:    "wood",
    handEmoji:   "🍪",
  },
  camp: {
    wallPalette: [
      [[90,55,25],[110,68,30],[75,45,18],[100,62,28]],   // type 0: log walls
      [[65,40,15],[80,50,20],[55,32,10],[72,45,18]],     // type 1: dark timber
    ],
    floorColor:  [55,35,15],
    ceilColor:   [35,22,8],
    fog:         [25,15,8],
    fogDist:     9,
    skyColors:   ["#0e0803","#160d05","#0a0602","#120a04"],
    particles:   "embers",
    accentColor: "#b45309",
    wallTex:     "brick",
    floorTex:    "dirt",
    handEmoji:   "🪓",
  },
  overworld: {
    wallPalette: [
      [[45,90,30],[60,120,40],[35,70,22],[55,110,36]],   // type 0: mossy stone
      [[90,70,40],[110,85,50],[75,60,32],[100,80,45]],   // type 1: wood/earth
    ],
    floorColor:  [22,48,16],
    ceilColor:   [12,25,45],
    fog:         [8,16,8],
    fogDist:     12,
    skyColors:   ["#0c1e3c","#163060","#0a1828","#0d2040"],
    particles:   "leaves",
    accentColor: "#4ade80",
    wallTex:     "brick",
    floorTex:    "grass",
    handEmoji:   "🗡️",
  },
  space: {
    wallPalette: [
      [[15,15,70],[22,22,100],[10,10,55],[18,18,88]],
      [[40,10,80],[55,15,100],[30,8,65],[48,12,90]],
    ],
    floorColor:  [4,4,22],
    ceilColor:   [2,2,12],
    fog:         [2,2,18],
    fogDist:     14,
    skyColors:   ["#000008","#00000f","#020018","#000005"],
    particles:   "stars",
    accentColor: "#22d3ee",
    wallTex:     "metal",
    floorTex:    "tile",
    handEmoji:   "🔫",
  },
  jungle: {
    wallPalette: [
      [[15,55,12],[22,72,18],[10,42,8],[20,65,15]],
      [[50,35,10],[65,45,15],[40,28,8],[58,40,12]],
    ],
    floorColor:  [8,30,8],
    ceilColor:   [4,18,4],
    fog:         [4,16,4],
    fogDist:     8,
    skyColors:   ["#030c03","#061006","#020902","#050e05"],
    particles:   "fireflies",
    accentColor: "#86efac",
    wallTex:     "vine",
    floorTex:    "dirt",
    handEmoji:   "🌿",
  },
  ocean: {
    wallPalette: [
      [[8,35,95],[12,48,120],[6,28,80],[10,42,110]],
      [[5,55,80],[8,70,100],[4,45,65],[7,62,92]],
    ],
    floorColor:  [4,18,55],
    ceilColor:   [2,10,35],
    fog:         [4,12,48],
    fogDist:     9,
    skyColors:   ["#010818","#010c22","#020a1c","#010615"],
    particles:   "bubbles",
    accentColor: "#38bdf8",
    wallTex:     "coral",
    floorTex:    "sand",
    handEmoji:   "🔱",
  },
};

// ── Maze maps ──────────────────────────────────────────────────────────────────
// Wall types: 0=no wall, 1=wall type A, 2=wall type B
const MAPS = {
  home: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1],
    [1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,0,0,0,2,0,0,1,1,0,0,2,0,0,0,1],
    [1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1],
    [1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  camp: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1],
    [1,0,0,0,2,0,0,0,0,0,0,2,0,0,0,1],
    [1,0,2,0,0,0,1,0,0,1,0,0,0,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1],
    [1,0,0,2,0,0,0,1,1,0,0,0,2,0,0,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,0,0,1,0,0,2,0,0,2,0,0,1,0,0,1],
    [1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  overworld: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,2,0,0,0,0,0,0,2,0,0,0,1],
    [1,0,2,0,0,0,1,1,0,2,0,0,0,1,0,1],
    [1,0,1,0,2,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,1,0,0,1,1,0,1],
    [1,1,2,0,1,0,0,0,2,0,0,0,0,0,0,1],
    [1,0,0,0,2,0,1,0,0,0,1,0,2,0,1,1],
    [1,0,1,2,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,2,0,0,0,0,1,2,0,1,0,1],
    [1,0,2,0,1,0,0,2,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,2,1,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  space: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,2,0,1,0,2,1,1,0,1,2,1,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1],
    [1,0,0,0,1,2,0,1,0,2,1,0,0,0,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,1,2,0,1],
    [1,0,0,0,2,0,1,2,1,0,2,0,0,0,0,1],
    [1,2,0,1,0,0,0,0,0,0,0,0,2,0,1,1],
    [1,0,0,0,0,2,0,1,0,2,0,0,0,0,0,1],
    [1,0,1,2,0,0,0,0,0,0,0,2,1,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  jungle: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1],
    [1,0,1,2,0,2,0,0,0,1,0,0,0,1,0,1],
    [1,0,0,0,0,1,2,0,1,0,0,0,2,0,0,1],
    [1,2,0,1,0,0,0,0,0,0,2,0,0,0,1,1],
    [1,0,0,0,2,0,1,0,2,0,0,0,1,0,0,1],
    [1,0,2,0,0,0,1,0,0,0,2,0,0,1,0,1],
    [1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,1],
    [1,2,0,1,0,0,1,0,0,0,1,0,0,0,2,1],
    [1,0,0,0,0,2,0,0,1,0,0,0,2,0,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  ocean: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,0,1,2,0,1,0,2,1,0,1,0,2,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,2,0,1,0,2,0,1,2,0,1,0,1,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,2,0,1,0,2,0,1,0,2,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,2,0,1,2,0,1,0,1,2,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,0,1,2,0,1,0,2,1,0,1,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
};

// ── Texture generators (called once and cached) ──────────────────────────────
function makeBrickTexture(r, g, b) {
  const sz = 32;
  const data = new Uint8ClampedArray(sz * sz * 4);
  for (let y = 0; y < sz; y++) {
    const row = Math.floor(y / 8);
    const mortar = (y % 8 === 0) || (y % 8 === 7);
    for (let x = 0; x < sz; x++) {
      const offset = (row % 2 === 0) ? 0 : 16;
      const brickX = ((x + offset) % 16);
      const isMortar = mortar || brickX === 0 || brickX === 15;
      const i = (y * sz + x) * 4;
      const noise = (((x * 3 + y * 7) * 53) % 30) - 15;
      if (isMortar) {
        data[i]   = Math.max(0, r * 0.35 + noise * 0.3);
        data[i+1] = Math.max(0, g * 0.35 + noise * 0.3);
        data[i+2] = Math.max(0, b * 0.35 + noise * 0.3);
      } else {
        data[i]   = Math.min(255, r + noise);
        data[i+1] = Math.min(255, g + noise);
        data[i+2] = Math.min(255, b + noise);
      }
      data[i+3] = 255;
    }
  }
  return data;
}

function makeMetalTexture(r, g, b) {
  const sz = 32;
  const data = new Uint8ClampedArray(sz * sz * 4);
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const i = (y * sz + x) * 4;
      const stripe = Math.sin(x * 0.8 + y * 0.2) * 20;
      const rivet = (x % 10 < 2 && y % 10 < 2) ? 40 : 0;
      data[i]   = Math.min(255, r + stripe + rivet);
      data[i+1] = Math.min(255, g + stripe + rivet);
      data[i+2] = Math.min(255, b + stripe * 1.5 + rivet);
      data[i+3] = 255;
    }
  }
  return data;
}

function makeVineTexture(r, g, b) {
  const sz = 32;
  const data = new Uint8ClampedArray(sz * sz * 4);
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const i = (y * sz + x) * 4;
      const vine = Math.sin(x * 0.5) * 12 + Math.cos(y * 0.4 + x * 0.3) * 10;
      const leaf = ((x + y * 3) % 9 < 2) ? 20 : 0;
      data[i]   = Math.min(255, Math.max(0, r + vine * 0.3 + leaf));
      data[i+1] = Math.min(255, Math.max(0, g + vine + leaf * 1.5));
      data[i+2] = Math.min(255, Math.max(0, b + vine * 0.2));
      data[i+3] = 255;
    }
  }
  return data;
}

function makeCoralTexture(r, g, b) {
  const sz = 32;
  const data = new Uint8ClampedArray(sz * sz * 4);
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const i = (y * sz + x) * 4;
      const wave = Math.sin(x * 0.6 + y * 0.4) * 15 + Math.cos(x * 0.3 - y * 0.7) * 12;
      const bump = ((x * x + y * y) % 13 < 3) ? 25 : 0;
      data[i]   = Math.min(255, Math.max(0, r + wave * 0.8 + bump));
      data[i+1] = Math.min(255, Math.max(0, g + wave * 0.4 + bump * 0.5));
      data[i+2] = Math.min(255, Math.max(0, b + wave + bump * 1.2));
      data[i+3] = 255;
    }
  }
  return data;
}

const TEXTURE_MAKERS = {
  brick: makeBrickTexture,
  metal: makeMetalTexture,
  vine:  makeVineTexture,
  coral: makeCoralTexture,
};

// Cache textures per world
const texCache = {};
function getTexture(world, paletteIdx) {
  const key = `${world}_${paletteIdx}`;
  if (texCache[key]) return texCache[key];
  const cfg = WORLD_CONFIG[world] || WORLD_CONFIG.overworld;
  const palette = cfg.wallPalette[paletteIdx] || cfg.wallPalette[0];
  const maker = TEXTURE_MAKERS[cfg.wallTex] || makeBrickTexture;
  const textures = palette.map(([r, g, b]) => maker(r, g, b));
  texCache[key] = textures;
  return textures;
}

// ── DDA Raycaster ─────────────────────────────────────────────────────────────
function castRay(map, px, py, rayAngle) {
  const MAP_H = map.length;
  const MAP_W = map[0].length;

  const rayDirX = Math.cos(rayAngle);
  const rayDirY = Math.sin(rayAngle);

  let mapX = Math.floor(px);
  let mapY = Math.floor(py);

  const deltaX = Math.abs(1 / (rayDirX || 1e-10));
  const deltaY = Math.abs(1 / (rayDirY || 1e-10));

  let stepX, sideDistX;
  if (rayDirX < 0) { stepX = -1; sideDistX = (px - mapX) * deltaX; }
  else              { stepX =  1; sideDistX = (mapX + 1 - px) * deltaX; }

  let stepY, sideDistY;
  if (rayDirY < 0) { stepY = -1; sideDistY = (py - mapY) * deltaY; }
  else              { stepY =  1; sideDistY = (mapY + 1 - py) * deltaY; }

  let side = 0;
  let wallType = 0;
  let hit = false;

  for (let i = 0; i < MAX_DEPTH * 20; i++) {
    if (sideDistX < sideDistY) { sideDistX += deltaX; mapX += stepX; side = 0; }
    else                       { sideDistY += deltaY; mapY += stepY; side = 1; }
    if (mapX < 0 || mapX >= MAP_W || mapY < 0 || mapY >= MAP_H) { hit = false; break; }
    const cell = map[mapY][mapX];
    if (cell > 0) { wallType = cell; hit = true; break; }
  }

  let perpDist;
  let wallHitX;
  if (side === 0) {
    perpDist = (mapX - px + (1 - stepX) / 2) / rayDirX;
    wallHitX = py + perpDist * rayDirY;
  } else {
    perpDist = (mapY - py + (1 - stepY) / 2) / rayDirY;
    wallHitX = px + perpDist * rayDirX;
  }
  wallHitX -= Math.floor(wallHitX);

  return { hit, dist: perpDist, side, wallType, wallHitX };
}

// ── Offscreen pixel buffer renderer ───────────────────────────────────────────
export default function FirstPersonRenderer({ world, angle, playerPos, bobOffset, otherPlayers, settings = {} }) {
  const retroSettings = {
    scanlines: true,
    pixelGrid: true,
    vignette: true,
    neonBorder: true,
    ...settings,
  };
  const canvasRef  = useRef(null);
  const bufferRef  = useRef(null); // offscreen canvas
  const imgDataRef = useRef(null);

  const cfg = WORLD_CONFIG[world] || WORLD_CONFIG.overworld;
  const map = MAPS[world] || MAPS.overworld;

  // Init offscreen buffer
  useEffect(() => {
    const buf = document.createElement("canvas");
    buf.width  = RENDER_W;
    buf.height = RENDER_H;
    bufferRef.current = buf;
    const ctx = buf.getContext("2d");
    imgDataRef.current = ctx.createImageData(RENDER_W, RENDER_H);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const buf    = bufferRef.current;
    if (!canvas || !buf) return;

    const bufCtx = buf.getContext("2d");
    const imgData = imgDataRef.current;
    if (!imgData) return;
    const pixels = imgData.data;
    const W = RENDER_W, H = RENDER_H;
    const t = Date.now();

    // ── Per-pixel sky/floor ───────────────────────────────────────────────────
    const [fc_r, fc_g, fc_b] = cfg.floorColor;
    const [cc_r, cc_g, cc_b] = cfg.ceilColor;

    // Animated sky: sample a color band based on row
    const skyC = cfg.skyColors;
    for (let y = 0; y < H / 2; y++) {
      const t2 = y / (H / 2);
      const ci = t2 * (skyC.length - 1);
      const ci0 = Math.floor(ci), ci1 = Math.min(skyC.length - 1, ci0 + 1);
      const blend = ci - ci0;
      // Parse hex
      const c0 = parseInt(skyC[ci0].slice(1), 16);
      const c1 = parseInt(skyC[ci1].slice(1), 16);
      const r0 = (c0 >> 16) & 0xff, g0 = (c0 >> 8) & 0xff, b0 = c0 & 0xff;
      const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
      const sr = Math.round(r0 + (r1 - r0) * blend);
      const sg = Math.round(g0 + (g1 - g0) * blend);
      const sb = Math.round(b0 + (b1 - b0) * blend);

      const by = Math.round(y + bobOffset * 0.5);
      if (by < 0 || by >= H) continue;
      for (let x = 0; x < W; x++) {
        const idx = (by * W + x) * 4;
        pixels[idx]   = sr;
        pixels[idx+1] = sg;
        pixels[idx+2] = sb;
        pixels[idx+3] = 255;
      }
    }

    // Floor with distance shading
    for (let y = Math.floor(H / 2); y < H; y++) {
      const rowDist = (H / 2) / Math.max(1, y - H / 2 + 0.001);
      const shade = Math.min(1, rowDist / 5);
      const by = Math.round(y + bobOffset * 0.5);
      if (by < 0 || by >= H) continue;
      for (let x = 0; x < W; x++) {
        // Checkerboard floor texture
        const fx = Math.floor((playerPos.x + Math.cos(angle) * rowDist + Math.cos(angle - FOV/2 + FOV * x/W) * rowDist) * 4);
        const fy = Math.floor((playerPos.y + Math.sin(angle) * rowDist + Math.sin(angle - FOV/2 + FOV * x/W) * rowDist) * 4);
        const checker = ((fx ^ fy) & 1) ? 1.0 : 0.75;
        const idx = (by * W + x) * 4;
        pixels[idx]   = Math.round(fc_r * shade * checker);
        pixels[idx+1] = Math.round(fc_g * shade * checker);
        pixels[idx+2] = Math.round(fc_b * shade * checker);
        pixels[idx+3] = 255;
      }
    }

    // ── Raycasting ────────────────────────────────────────────────────────────
    const zBuffer = new Float32Array(W);

    for (let col = 0; col < W; col++) {
      const rayAngle = angle - FOV / 2 + (col / W) * FOV;
      const { hit, dist, side, wallType, wallHitX } = castRay(map, playerPos.x, playerPos.y, rayAngle);

      if (!hit || dist <= 0) { zBuffer[col] = Infinity; continue; }
      zBuffer[col] = dist;

      const wallH = Math.min(H * 3, Math.round(H / dist));
      const wallTop = Math.round((H / 2) - wallH / 2 + bobOffset);
      const wallBot = wallTop + wallH;

      // Fog
      const fogT = Math.min(1, dist / cfg.fogDist);
      const [fog_r, fog_g, fog_b] = cfg.fog;

      // Pick texture palette
      const paletteIdx = (wallType - 1) % 2;
      const textures = getTexture(world, paletteIdx);
      // Choose texture variant by side
      const texIdx = side * 2 + (col % 2 === 0 ? 0 : 1);
      const texData = textures[texIdx % textures.length];

      // Side darkening
      const sideDark = side === 1 ? 0.7 : 1.0;

      const texX = Math.floor(wallHitX * 32) & 31;

      for (let y = Math.max(0, wallTop); y < Math.min(H, wallBot); y++) {
        const texY = Math.floor(((y - wallTop) / wallH) * 32) & 31;
        const texOff = (texY * 32 + texX) * 4;
        const tr = texData[texOff];
        const tg = texData[texOff + 1];
        const tb = texData[texOff + 2];

        const by = Math.round(y + bobOffset * 0.3);
        if (by < 0 || by >= H) continue;
        const idx = (by * W + col) * 4;
        pixels[idx]   = Math.round(tr * (1 - fogT) * sideDark + fog_r * fogT);
        pixels[idx+1] = Math.round(tg * (1 - fogT) * sideDark + fog_g * fogT);
        pixels[idx+2] = Math.round(tb * (1 - fogT) * sideDark + fog_b * fogT);
        pixels[idx+3] = 255;
      }
    }

    // ── Put pixels to offscreen, then draw up-scaled to main canvas ──────────
    bufCtx.putImageData(imgData, 0, 0);

    const ctx = canvas.getContext("2d");
    const CW = canvas.width, CH = canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, W, H, 0, 0, CW, CH);

    // ── Post: stars/particles on top ──────────────────────────────────────────
    if (world === "space") {
      for (let s = 0; s < 80; s++) {
        const sx = ((s * 197 + Math.floor(angle * 120)) % CW + CW) % CW;
        const sy = (s * 67 + 3) % (CH * 0.45);
        const ss = 0.8 + (s % 3) * 0.7;
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(t / 1400 + s * 0.7));
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${alpha})`;
        ctx.fill();
      }
      // Nebula streaks
      for (let n = 0; n < 3; n++) {
        const nx = (n * 200 + 80) % CW;
        const ny = CH * (0.1 + n * 0.12);
        const alpha = 0.04 + 0.02 * Math.sin(t / 1000 + n);
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 120);
        grad.addColorStop(0, `rgba(80,40,180,${alpha})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CW, CH * 0.5);
      }
    }

    if (world === "jungle") {
      for (let f = 0; f < 8; f++) {
        const fx2 = (Math.sin(t / 1600 + f * 2.3) * CW * 0.42 + CW / 2 + f * 40) % CW;
        const fy2 = CH * 0.35 + Math.cos(t / 1300 + f * 1.8) * CH * 0.08;
        if (fy2 > CH * 0.52) continue;
        const fa = 0.5 + 0.5 * Math.abs(Math.sin(t / 600 + f * 0.9));
        ctx.beginPath();
        ctx.arc(fx2, fy2, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,255,80,${fa * 0.9})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(120,255,60,0.9)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    if (world === "ocean") {
      for (let b2 = 0; b2 < 14; b2++) {
        const bx = ((b2 * 89 + Math.floor(angle * 60)) % CW + CW) % CW;
        const by2 = CH - ((t / 6 + b2 * 70) % (CH * 0.52));
        if (by2 < CH * 0.5) continue;
        const ba = 0.15 + 0.1 * Math.sin(t / 500 + b2);
        ctx.beginPath();
        ctx.arc(bx, by2, 2 + b2 % 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100,210,255,${ba})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      // Underwater caustics
      for (let c = 0; c < 4; c++) {
        const cx2 = (c * 180 + 50) % CW;
        const cy2 = CH * (0.5 + c * 0.12);
        const cr = 40 + Math.sin(t / 700 + c) * 20;
        const ca = 0.03 + 0.02 * Math.sin(t / 800 + c * 1.2);
        const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, cr);
        grad2.addColorStop(0, `rgba(80,200,255,${ca})`);
        grad2.addColorStop(1, "transparent");
        ctx.fillStyle = grad2;
        ctx.fillRect(0, CH * 0.5, CW, CH * 0.5);
      }
    }

    if (world === "home") {
      // Warm dust motes in sunlight
      for (let d = 0; d < 10; d++) {
        const dx2 = (Math.sin(t / 2500 + d * 1.3) * CW * 0.45 + CW / 2 + d * 50) % CW;
        const dy2 = CH * 0.25 + Math.cos(t / 2000 + d * 1.9) * CH * 0.12;
        if (dy2 > CH * 0.55) continue;
        const da = 0.12 + 0.08 * Math.sin(t / 1100 + d);
        ctx.beginPath();
        ctx.arc(dx2, dy2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,150,${da})`;
        ctx.fill();
      }
    }

    if (world === "camp") {
      // Floating ember sparks
      for (let e = 0; e < 12; e++) {
        const ex = ((e * 73 + Math.floor(t / 80)) % CW + CW) % CW;
        const ey = CH - ((t / 4 + e * 55) % (CH * 0.6));
        if (ey < CH * 0.42) continue;
        const ea = 0.5 + 0.5 * Math.abs(Math.sin(t / 300 + e));
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5 + (e % 2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${120 + e * 10},20,${ea})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255,120,20,0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    if (world === "overworld") {
      // Floating dust motes
      for (let d = 0; d < 6; d++) {
        const dx2 = (Math.sin(t / 2000 + d * 1.7) * CW * 0.4 + CW / 2 + d * 60) % CW;
        const dy2 = CH * 0.3 + Math.cos(t / 1800 + d * 2.1) * CH * 0.1;
        if (dy2 > CH * 0.5) continue;
        const da = 0.15 + 0.1 * Math.sin(t / 900 + d);
        ctx.beginPath();
        ctx.arc(dx2, dy2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,255,150,${da})`;
        ctx.fill();
      }
    }

    // ── Other players as billboard sprites ────────────────────────────────────
    const CHAR_EMOJIS = { eli:"🧑", lyla:"👧", buggagoogee:"🐕", shadow:"🦊", blaze:"🔥" };
    const sortedOthers = [...otherPlayers].sort((a, b) => {
      const da = (a.x-playerPos.x)**2 + (a.y-playerPos.y)**2;
      const db = (b.x-playerPos.x)**2 + (b.y-playerPos.y)**2;
      return db - da;
    });
    for (const op of sortedOthers) {
      const dx = op.x - playerPos.x;
      const dy = op.y - playerPos.y;
      const spriteAngle = Math.atan2(dy, dx);
      let relAngle = spriteAngle - angle;
      while (relAngle < -Math.PI) relAngle += Math.PI * 2;
      while (relAngle > Math.PI) relAngle -= Math.PI * 2;
      if (Math.abs(relAngle) > FOV * 0.7) continue;
      const dist2 = Math.sqrt(dx * dx + dy * dy);
      if (dist2 < 0.3 || dist2 > cfg.fogDist) continue;
      const screenX = CW / 2 + (relAngle / (FOV / 2)) * (CW / 2);
      const spriteH = Math.min(CH * 0.9, (1 / dist2) * CW * 0.55);
      const sy = CH / 2 - spriteH / 2 + bobOffset;
      const alpha = Math.max(0, Math.min(1, 1 - dist2 / cfg.fogDist));
      ctx.globalAlpha = alpha;
      ctx.font = `${Math.floor(spriteH * 0.7)}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(CHAR_EMOJIS[op.charId] || "🎮", screenX, sy + spriteH * 0.75);
      ctx.globalAlpha = 1;
      ctx.fillStyle = op.color || "#22d3ee";
      ctx.font = `bold ${Math.max(8, Math.floor(12 / dist2))}px monospace`;
      ctx.fillText(op.username, screenX, sy - 2);
    }

    // ── Weapon hand ───────────────────────────────────────────────────────────
    const handBob = Math.sin(t / 200) * Math.abs(bobOffset) * 0.5;
    const handX = CW * 0.72;
    const handY = CH * 0.68 + handBob + Math.abs(bobOffset) * 2;
    ctx.font = `${Math.floor(CW * 0.09)}px serif`;
    ctx.textAlign = "center";
    ctx.globalAlpha = 0.95;
    ctx.fillText(cfg.handEmoji, handX, handY);
    ctx.globalAlpha = 1;

    // ── Crosshair ─────────────────────────────────────────────────────────────
    const cx = CW / 2, cy = CH / 2 + bobOffset * 0.5;
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx-9, cy); ctx.lineTo(cx+9, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy-9); ctx.lineTo(cx, cy+9); ctx.stroke();
    // Dot
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(cx-1, cy-1, 2, 2);

    // ── CRT scanlines ─────────────────────────────────────────────────────────
    if (retroSettings.scanlines) {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let sl = 0; sl < CH; sl += 2) ctx.fillRect(0, sl, CW, 1);
    }

    // ── Pixel grid (every 4px) ────────────────────────────────────────────────
    if (retroSettings.pixelGrid) {
      ctx.fillStyle = "rgba(0,0,0,0.035)";
      for (let gx = 0; gx < CW; gx += 4) ctx.fillRect(gx, 0, 1, CH);
    }

    // ── Vignette ──────────────────────────────────────────────────────────────
    if (retroSettings.vignette) {
      const vg = ctx.createRadialGradient(CW/2, CH/2, CH*0.12, CW/2, CH/2, CH*0.88);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CW, CH);
    }

    // ── Neon accent border glow ───────────────────────────────────────────────
    if (retroSettings.neonBorder) {
      ctx.strokeStyle = cfg.accentColor;
      ctx.globalAlpha = 0.12 + 0.05 * Math.sin(t / 800);
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, CW - 6, CH - 6);
      ctx.globalAlpha = 1;
    }

  }, [world, angle, playerPos, bobOffset, otherPlayers, cfg, map]);

  useEffect(() => {
    let raf;
    const loop = () => { render(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={400}
      className="w-full block"
      style={{
        imageRendering: "pixelated",
        maxHeight: "65vh",
        objectFit: "contain",
        cursor: "crosshair",
        background: "#000",
      }}
    />
  );
}