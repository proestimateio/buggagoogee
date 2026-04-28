import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  buildAvatar,
  animateAvatar,
  disposeAvatar,
  buildRoxy,
  animateRoxy,
} from "./Avatar3D";

// ── Map data (1 = wall, 0 = floor, 2 = decoration spot) ──
const MAPS = {
  home: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],[1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1],[1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1],[1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],[1,0,0,0,2,0,0,1,1,0,0,2,0,0,0,1],[1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1],[1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1],[1,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  camp: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1],[1,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1],[1,0,0,0,2,0,0,0,0,0,0,2,0,0,0,1],[1,0,2,0,0,0,1,0,0,1,0,0,0,2,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1],[1,0,0,2,0,0,0,1,1,0,0,0,2,0,0,1],[1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],[1,0,0,1,0,0,2,0,0,2,0,0,1,0,0,1],[1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  overworld: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],[1,0,1,0,0,0,1,1,0,1,0,0,0,1,0,1],[1,0,1,0,1,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,0,0,1,0,0,1,0,0,1,1,0,1],[1,1,1,0,1,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,1],[1,0,1,1,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,1,0,0,0,0,1,1,0,1,0,1],[1,0,1,0,1,0,0,1,0,1,0,0,0,0,0,1],[1,0,0,0,0,0,1,0,0,0,0,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  space: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,0,0,1,1,0,1,0,1,1,0,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,1,0,1,1,1,0,1,0,0,0,0,1],[1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1],[1,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  jungle: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,1,1,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,0,0,0,1,1,0,1,0,0,0,1,0,0,1],[1,1,0,1,0,0,0,0,0,0,1,0,0,0,1,1],[1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],[1,1,0,1,0,0,1,0,0,0,1,0,0,0,1,1],[1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1],[1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  ocean: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
};

const WORLD_THEMES = {
  home:      { sky: '#f4c4a0', skyTop: '#5a8db8', wall: '#a86b3d', wall2: '#d4a574', floor: '#5a3a1a', accent: '#f59e0b', fog: 30, ambient: 0xfff5e6, ambientI: 0.7 },
  camp:      { sky: '#1a2540', skyTop: '#0a0f20', wall: '#5a3820', wall2: '#3d2410', floor: '#2a1a0a', accent: '#b45309', fog: 25, ambient: 0xfff1cc, ambientI: 0.45 },
  overworld: { sky: '#a3d9ff', skyTop: '#4a90d9', wall: '#7a5840', wall2: '#a87850', floor: '#4a8a3a', accent: '#a855f7', fog: 35, ambient: 0xffffff, ambientI: 0.9 },
  space:     { sky: '#0a0530', skyTop: '#000010', wall: '#3a3060', wall2: '#5a4090', floor: '#1a1040', accent: '#22d3ee', fog: 40, ambient: 0xaaccff, ambientI: 0.4 },
  jungle:    { sky: '#3a6d3a', skyTop: '#1a3d1a', wall: '#3d5a2d', wall2: '#5a7a3d', floor: '#2a5a1a', accent: '#4ade80', fog: 22, ambient: 0xddffcc, ambientI: 0.6 },
  ocean:     { sky: '#1a4a70', skyTop: '#0a2540', wall: '#2a5070', wall2: '#3a7090', floor: '#0a3050', accent: '#38bdf8', fog: 28, ambient: 0xaaddff, ambientI: 0.5 },
};

const MAP_W = 16;
const MAP_H = 12;

// ── Helpers for canvas-based textures ──
function makeFloorTexture(theme) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  ctx.fillStyle = theme.floor;
  ctx.fillRect(0, 0, 64, 64);
  // Slightly darker grid lines
  const darker = shade(theme.floor, -22);
  ctx.strokeStyle = darker;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 64, 64);
  ctx.beginPath();
  ctx.moveTo(0, 32); ctx.lineTo(64, 32);
  ctx.moveTo(32, 0); ctx.lineTo(32, 64);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function makeSkyTexture(theme, world) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 256, 0, 0);
  grad.addColorStop(0, theme.sky);
  grad.addColorStop(1, theme.skyTop);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  if (world === "space") {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

function makeNameTagTexture(text) {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 64;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(10, 10, 18, 0.72)";
  roundRect(ctx, 8, 8, 240, 48, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  roundRect(ctx, 8, 8, 240, 48, 12);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text || "?", 128, 34);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

function makeInteractableTexture(emoji, accent) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  // Glow ring
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, hexToRgba(accent, 0.55));
  grad.addColorStop(0.6, hexToRgba(accent, 0.25));
  grad.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  ctx.font = "96px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji || "?", 64, 70);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex, amt) {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(h.slice(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(h.slice(2, 4), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(h.slice(4, 6), 16) + amt));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

export default function ThirdPersonRenderer({
  world = "overworld",
  playerPos = { x: 1.5, y: 1.5 },
  angle = 0,
  appearance,
  characterId = "eli",
  otherPlayers = [],
  interactables = [],
  isMoving = false,
  timeOfDay = 0.4,
  settings = { scanlines: true, vignette: true, neonBorder: true },
  cameraOffset = { yaw: 0, pitch: 0.3, distance: 5 },
  onCameraChange,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Three core
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  // Dynamic groups / state
  const playerGroupRef = useRef(null);
  const roxyGroupRef = useRef(null);
  const otherPlayerGroupsRef = useRef(new Map());
  const interactableSpritesRef = useRef(new Map());
  const terrainGroupRef = useRef(null);
  const skyMeshRef = useRef(null);
  const ambientRef = useRef(null);
  const dirLightRef = useRef(null);

  // Refs that track latest props (read inside RAF without re-creating loop)
  const playerPosRef = useRef(playerPos);
  const angleRef = useRef(angle);
  const isMovingRef = useRef(isMoving);
  const timeOfDayRef = useRef(timeOfDay);
  const otherPlayersRef = useRef(otherPlayers);
  const interactablesRef = useRef(interactables);
  const cameraOffsetRef = useRef({ ...cameraOffset });
  const themeRef = useRef(WORLD_THEMES[world] || WORLD_THEMES.overworld);
  const camPosLerpRef = useRef(new THREE.Vector3());
  const roxyTargetRef = useRef(new THREE.Vector3());

  const onCameraChangeRef = useRef(onCameraChange);

  // Sync refs when props change
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { angleRef.current = angle; }, [angle]);
  useEffect(() => { isMovingRef.current = isMoving; }, [isMoving]);
  useEffect(() => { timeOfDayRef.current = timeOfDay; }, [timeOfDay]);
  useEffect(() => { otherPlayersRef.current = otherPlayers; }, [otherPlayers]);
  useEffect(() => { interactablesRef.current = interactables; }, [interactables]);
  useEffect(() => { onCameraChangeRef.current = onCameraChange; }, [onCameraChange]);
  useEffect(() => {
    cameraOffsetRef.current = { ...cameraOffsetRef.current, ...cameraOffset };
  }, [cameraOffset.yaw, cameraOffset.pitch, cameraOffset.distance]);

  // ── Mount: renderer / scene / camera / loop ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 500);
    cameraRef.current = camera;
    camera.position.set(playerPosRef.current.x - 4, 4, playerPosRef.current.y - 4);
    camPosLerpRef.current.copy(camera.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    rendererRef.current = renderer;

    const canvas = renderer.domElement;
    canvasRef.current = canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);

    const setSize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(container);

    // ── Mouse / touch camera controls ──
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const beginDrag = (x, y) => { dragging = true; lastX = x; lastY = y; };
    const moveDrag = (x, y) => {
      if (!dragging) return;
      const dx = x - lastX;
      const dy = y - lastY;
      lastX = x; lastY = y;
      const off = cameraOffsetRef.current;
      const next = {
        yaw: off.yaw + dx * 0.005,
        pitch: clamp(off.pitch + dy * 0.005, 0.05, 1.2),
        distance: off.distance,
      };
      cameraOffsetRef.current = next;
      onCameraChangeRef.current?.(next);
    };
    const endDrag = () => { dragging = false; };

    const onMouseDown = (e) => beginDrag(e.clientX, e.clientY);
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onWheel = (e) => {
      e.preventDefault();
      const off = cameraOffsetRef.current;
      const next = {
        ...off,
        distance: clamp(off.distance + e.deltaY * 0.005, 3, 10),
      };
      cameraOffsetRef.current = next;
      onCameraChangeRef.current?.(next);
    };
    const onTouchStart = (e) => {
      if (e.touches.length > 0) beginDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e) => {
      if (e.touches.length > 0) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => endDrag();

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    // ── Animation loop ──
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const time = (performance.now() - start) / 1000;

      const pos = playerPosRef.current || { x: 1.5, y: 1.5 };
      const ang = angleRef.current || 0;
      const moving = !!isMovingRef.current;
      const off = cameraOffsetRef.current;

      // Local player
      if (playerGroupRef.current) {
        playerGroupRef.current.position.set(pos.x, 0, pos.y);
        playerGroupRef.current.rotation.y = -ang;
        animateAvatar(playerGroupRef.current, time, moving);
      }

      // Roxy follows behind player
      if (roxyGroupRef.current) {
        const tx = pos.x - Math.cos(ang) * 1.2;
        const tz = pos.y - Math.sin(ang) * 1.2;
        roxyTargetRef.current.set(tx, 0, tz);
        const rg = roxyGroupRef.current;
        rg.position.x = lerp(rg.position.x, tx, 0.08);
        rg.position.z = lerp(rg.position.z, tz, 0.08);
        // Face away from player
        rg.rotation.y = -ang + Math.PI / 2;
        animateRoxy(rg, time, moving);
      }

      // Other players
      const seen = new Set();
      for (const p of otherPlayersRef.current || []) {
        seen.add(p.id);
        let entry = otherPlayerGroupsRef.current.get(p.id);
        if (!entry) {
          const g = buildAvatar(p.appearance || {});
          // Username sprite
          const tex = makeNameTagTexture(p.username || "Player");
          const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(2, 0.5, 1);
          sprite.position.set(0, 2.6, 0);
          g.add(sprite);
          sceneRef.current.add(g);
          entry = { group: g, sprite, tex, username: p.username };
          otherPlayerGroupsRef.current.set(p.id, entry);
        }
        // If username changed, rebuild texture
        if (entry.username !== p.username) {
          entry.tex.dispose();
          const ntex = makeNameTagTexture(p.username || "Player");
          entry.sprite.material.map = ntex;
          entry.sprite.material.needsUpdate = true;
          entry.tex = ntex;
          entry.username = p.username;
        }
        entry.group.position.set(p.x, 0, p.y);
        // Other players don't have angle in props — face local player slightly
        entry.group.rotation.y = Math.atan2(pos.x - p.x, pos.y - p.y);
        animateAvatar(entry.group, time, false);
      }
      // Remove stale others
      for (const [id, entry] of otherPlayerGroupsRef.current.entries()) {
        if (!seen.has(id)) {
          sceneRef.current.remove(entry.group);
          disposeAvatar(entry.group);
          if (entry.tex) entry.tex.dispose();
          if (entry.sprite?.material) entry.sprite.material.dispose();
          otherPlayerGroupsRef.current.delete(id);
        }
      }

      // Interactables
      const seenI = new Set();
      const theme = themeRef.current;
      for (const it of interactablesRef.current || []) {
        seenI.add(it.id);
        let entry = interactableSpritesRef.current.get(it.id);
        if (!entry) {
          const tex = makeInteractableTexture(it.emoji, theme.accent);
          const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
          const sprite = new THREE.Sprite(mat);
          sprite.scale.set(1.2, 1.2, 1);
          sceneRef.current.add(sprite);
          // Stable bob offset from id hash
          let h = 0;
          const s = String(it.id);
          for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
          entry = { sprite, tex, emoji: it.emoji, bobOffset: (h % 1000) / 159 };
          interactableSpritesRef.current.set(it.id, entry);
        }
        if (entry.emoji !== it.emoji) {
          entry.tex.dispose();
          const ntex = makeInteractableTexture(it.emoji, theme.accent);
          entry.sprite.material.map = ntex;
          entry.sprite.material.needsUpdate = true;
          entry.tex = ntex;
          entry.emoji = it.emoji;
        }
        entry.sprite.position.x = it.x;
        entry.sprite.position.z = it.y;
        entry.sprite.position.y = 1.0 + Math.sin(time * 2 + entry.bobOffset) * 0.15;
      }
      for (const [id, entry] of interactableSpritesRef.current.entries()) {
        if (!seenI.has(id)) {
          sceneRef.current.remove(entry.sprite);
          if (entry.tex) entry.tex.dispose();
          if (entry.sprite?.material) entry.sprite.material.dispose();
          interactableSpritesRef.current.delete(id);
        }
      }

      // ── Chase camera ──
      const targetX = pos.x;
      const targetY = 1.4;
      const targetZ = pos.y;
      const camX = targetX + -Math.sin(ang + off.yaw) * off.distance;
      const camY = targetY + off.pitch * off.distance + 1;
      const camZ = targetZ + -Math.cos(ang + off.yaw) * off.distance;
      camPosLerpRef.current.x = lerp(camPosLerpRef.current.x, camX, 0.15);
      camPosLerpRef.current.y = lerp(camPosLerpRef.current.y, camY, 0.15);
      camPosLerpRef.current.z = lerp(camPosLerpRef.current.z, camZ, 0.15);
      camera.position.copy(camPosLerpRef.current);
      camera.lookAt(targetX, targetY, targetZ);

      // ── Time-of-day light intensity ──
      const tod = timeOfDayRef.current ?? 0.4;
      const todF = 0.3 + Math.sin(tod * Math.PI) * 0.7;
      if (ambientRef.current) {
        ambientRef.current.intensity = themeRef.current.ambientI * todF;
      }
      if (dirLightRef.current) {
        dirLightRef.current.intensity = 0.6 * todF;
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);

      // Dispose other players + interactables
      for (const entry of otherPlayerGroupsRef.current.values()) {
        scene.remove(entry.group);
        disposeAvatar(entry.group);
        entry.tex?.dispose();
        entry.sprite?.material?.dispose();
      }
      otherPlayerGroupsRef.current.clear();
      for (const entry of interactableSpritesRef.current.values()) {
        scene.remove(entry.sprite);
        entry.tex?.dispose();
        entry.sprite?.material?.dispose();
      }
      interactableSpritesRef.current.clear();

      if (playerGroupRef.current) {
        scene.remove(playerGroupRef.current);
        disposeAvatar(playerGroupRef.current);
        playerGroupRef.current = null;
      }
      if (roxyGroupRef.current) {
        scene.remove(roxyGroupRef.current);
        disposeAvatar(roxyGroupRef.current);
        roxyGroupRef.current = null;
      }

      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Build / rebuild Roxy once at mount (companion stays across worlds) ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const r = buildRoxy();
    r.position.set(playerPosRef.current.x - 1.2, 0, playerPosRef.current.y - 1.2);
    r.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(r);
    roxyGroupRef.current = r;
    return () => {
      if (roxyGroupRef.current) {
        scene.remove(roxyGroupRef.current);
        disposeAvatar(roxyGroupRef.current);
        roxyGroupRef.current = null;
      }
    };
  }, []);

  // ── Build / rebuild local player avatar when appearance changes ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const g = buildAvatar(appearance || {});
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.position.set(playerPosRef.current.x, 0, playerPosRef.current.y);
    g.rotation.y = -(angleRef.current || 0);
    scene.add(g);
    playerGroupRef.current = g;
    return () => {
      if (playerGroupRef.current) {
        scene.remove(playerGroupRef.current);
        disposeAvatar(playerGroupRef.current);
        playerGroupRef.current = null;
      }
    };
  }, [JSON.stringify(appearance || {})]);

  // ── Build / rebuild terrain, sky, fog, lights when world changes ──
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer) return;

    const theme = WORLD_THEMES[world] || WORLD_THEMES.overworld;
    themeRef.current = theme;
    const map = MAPS[world] || MAPS.overworld;

    scene.background = new THREE.Color(theme.sky);
    scene.fog = new THREE.Fog(theme.sky, theme.fog * 0.4, theme.fog);

    // Lights
    const ambient = new THREE.AmbientLight(theme.ambient, theme.ambientI);
    scene.add(ambient);
    ambientRef.current = ambient;

    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(10, 20, 10);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 60;
    dir.shadow.camera.left = -20;
    dir.shadow.camera.right = 20;
    dir.shadow.camera.top = 20;
    dir.shadow.camera.bottom = -20;
    scene.add(dir);
    dirLightRef.current = dir;

    // Sky box (inverted)
    const skyTex = makeSkyTexture(theme, world);
    const skyGeom = new THREE.BoxGeometry(200, 200, 200);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      color: 0xffffff,
      fog: false,
    });
    const skyMesh = new THREE.Mesh(skyGeom, skyMat);
    scene.add(skyMesh);
    skyMeshRef.current = skyMesh;

    // Terrain group
    const terrain = new THREE.Group();

    // Floor
    const floorTex = makeFloorTexture(theme);
    const floorGeom = new THREE.BoxGeometry(MAP_W, 0.2, MAP_H);
    const floorMat = new THREE.MeshLambertMaterial({ color: theme.floor, map: floorTex });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.position.set(MAP_W / 2, -0.1, MAP_H / 2);
    floor.receiveShadow = true;
    terrain.add(floor);

    // Walls
    const wallGeom = new THREE.BoxGeometry(1, 2.5, 1);
    const wallMatA = new THREE.MeshLambertMaterial({ color: theme.wall });
    const wallMatB = new THREE.MeshLambertMaterial({ color: theme.wall2 });
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
          const useA = (row + col) % 2 === 0;
          const m = new THREE.Mesh(wallGeom, useA ? wallMatA : wallMatB);
          m.position.set(col + 0.5, 1.25, row + 0.5);
          m.castShadow = true;
          m.receiveShadow = true;
          terrain.add(m);
        }
      }
    }

    scene.add(terrain);
    terrainGroupRef.current = terrain;

    return () => {
      // Clean up everything we added in this effect
      if (terrainGroupRef.current) {
        scene.remove(terrainGroupRef.current);
        terrainGroupRef.current.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            for (const m of mats) {
              if (m.map) m.map.dispose();
              m.dispose();
            }
          }
        });
        terrainGroupRef.current = null;
      }
      if (skyMeshRef.current) {
        scene.remove(skyMeshRef.current);
        if (skyMeshRef.current.material) {
          if (skyMeshRef.current.material.map) skyMeshRef.current.material.map.dispose();
          skyMeshRef.current.material.dispose();
        }
        if (skyMeshRef.current.geometry) skyMeshRef.current.geometry.dispose();
        skyMeshRef.current = null;
      }
      if (ambientRef.current) {
        scene.remove(ambientRef.current);
        ambientRef.current = null;
      }
      if (dirLightRef.current) {
        scene.remove(dirLightRef.current);
        dirLightRef.current = null;
      }
      scene.fog = null;
    };
  }, [world]);

  // ── CSS overlays ──
  const theme = WORLD_THEMES[world] || WORLD_THEMES.overworld;
  const accent = theme.accent;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: theme.sky,
      }}
    >
      {/* canvas appended via ref */}
      {settings?.scanlines && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
            mixBlendMode: "multiply",
            zIndex: 5,
          }}
        />
      )}
      {settings?.vignette && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)",
            zIndex: 6,
          }}
        />
      )}
      {settings?.neonBorder && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow: `inset 0 0 40px 6px ${hexToRgba(accent, 0.55)}, inset 0 0 8px 1px ${hexToRgba(accent, 0.85)}`,
            zIndex: 7,
          }}
        />
      )}
    </div>
  );
}
