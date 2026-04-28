import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { CHARACTERS, WORLDS, INTERACTABLES } from "@/lib/worldData";
import ChatBox from "@/components/game/ChatBox";
import InteractModal from "@/components/game/InteractModal";
import TreasureHunt from "./minigames/TreasureHunt";
import MeteorDodge from "./minigames/MeteorDodge";
import FishFrenzy from "./minigames/FishFrenzy";
import VineSwing from "./minigames/VineSwing";
import Leaderboard from "@/components/game/Leaderboard";
import FirstPersonRenderer from "@/components/game/FirstPersonRenderer";
import FPSMobileControls from "@/components/game/FPSMobileControls";
import SettingsMenu from "@/components/game/SettingsMenu";
import { Map, ShoppingBag, User, Save, Compass, Zap, Settings } from "lucide-react";
import confetti from "canvas-confetti";

const CHAR_DATA = {};
CHARACTERS.forEach(c => { CHAR_DATA[c.id] = c; });

const MINIGAME_COMPONENTS = {
  treasure_hunt: TreasureHunt,
  meteor_dodge: MeteorDodge,
  fish_frenzy: FishFrenzy,
  vine_swing: VineSwing,
};

const SHOP_ITEMS = [
  { id: "speedboost", name: "Speed Boost", emoji: "⚡", cost: 50, description: "Move faster!" },
  { id: "lucky_charm", name: "Lucky Charm", emoji: "🍀", cost: 80, description: "Double coin drops!" },
  { id: "explorer_hat", name: "Explorer Hat", emoji: "🪖", cost: 120, description: "Cool style!" },
  { id: "jetpack", name: "Jetpack", emoji: "🎒", cost: 200, description: "Extra jump in mini-games!" },
];

// World starting positions (inside open cells)
const WORLD_STARTS = {
  home:      { x: 1.5, y: 1.5, angle: 0 },
  camp:      { x: 1.5, y: 1.5, angle: 0 },
  overworld: { x: 1.5, y: 1.5, angle: 0 },
  space:     { x: 1.5, y: 1.5, angle: 0 },
  jungle:    { x: 1.5, y: 2.5, angle: 0 },
  ocean:     { x: 1.5, y: 1.5, angle: 0 },
};

// Map of nearby objects (simplified: when in a given world sector, show interact prompt)
const WORLD_SECRETS = {
  home: [
    { id: "sofa", label: "Cozy Sofa 🛋️", action: "rest", emoji: "🛋️", dialog: "You sink into the soft cushions. Ahh... home sweet home! ✨" },
    { id: "tv", label: "Family TV 📺", action: "examine", emoji: "📺", dialog: "The TV shows old family videos. Secret code: 🐕7-4-2!" },
    { id: "bookshelf", label: "Bookshelf 📚", action: "examine", emoji: "📚", dialog: "A shelf full of adventure books! A golden coin drops out!" },
    { id: "book_coin", label: "Lost Coin 🪙", action: "collect", reward: 40, emoji: "🪙", dialog: null },
    { id: "fireplace", label: "Cozy Fireplace 🔥", action: "rest", emoji: "🔥", dialog: "The crackling fire warms your soul. 🏠" },
    { id: "hidden_cookie", label: "Cookie Jar 🍪", action: "collect", reward: 25, emoji: "🍪", dialog: null },
    { id: "family_photo", label: "Family Portrait 🖼️", action: "examine", emoji: "🖼️", dialog: "A warm photo of the whole family together. Buggagoogee is front and centre! 🐕❤️" },
    { id: "puzzle_box", label: "Mystery Gift Box 🎁", action: "open", reward: 80, emoji: "🎁", dialog: null },
  ],
  camp: [
    { id: "campfire_big", label: "Roaring Campfire 🔥", action: "rest", emoji: "🔥", dialog: "The big campfire crackles warmly. You toast marshmallows! 🏕️" },
    { id: "log_seat", label: "Log Seat 🪵", action: "rest", emoji: "🪵", dialog: "You sit on the log. An owl hoots nearby! 🦉" },
    { id: "fishing_rod", label: "Fishing Rod 🎣", action: "examine", emoji: "🎣", dialog: "A trusty fishing rod. There must be fish in the nearby stream!" },
    { id: "tent", label: "Scout Tent ⛺", action: "examine", emoji: "⛺", dialog: "'Dig under the big pine for treasure!' says a note inside. 🌲" },
    { id: "pine_treasure", label: "Buried Treasure 💎", action: "collect", reward: 90, emoji: "💎", dialog: null },
    { id: "raccoon_npc", label: "Rocky the Raccoon 🦝", action: "talk", emoji: "🦝", dialog: "Chitter chitter! Bring me 🍪 cookies and I'll share my shiny things!" },
    { id: "mushrooms", label: "Glowing Mushrooms 🍄", action: "examine", emoji: "🍄", dialog: "These mushrooms glow faintly blue. Ancient forest magic! ✨" },
    { id: "s'mores", label: "S'mores Kit 🍫", action: "collect", reward: 30, emoji: "🍫", dialog: null },
  ],
  overworld: [
    { id: "chest1", label: "Treasure Chest 📦", action: "open", reward: 20, emoji: "📦", dialog: null },
    { id: "npc_dog", label: "Rex the Dog 🐶", action: "talk", emoji: "🐶", dialog: "Woof woof! Welcome to Buggagoogee Village! Find the golden bone hidden near the big tree! 🦴" },
    { id: "shop", label: "Item Shop 🏪", action: "shop", emoji: "🏪" },
    { id: "minigame_treasure", label: "Treasure Hunt 🗺️", action: "minigame", minigameId: "treasure_hunt", emoji: "🗺️" },
    { id: "golden_bone", label: "Golden Bone! 🦴", action: "collect", reward: 100, emoji: "🦴" },
    { id: "campfire", label: "Campfire 🔥", action: "rest", emoji: "🔥", dialog: "You rest by the fire. The warmth feels magical..." },
  ],
  space: [
    { id: "asteroid1", label: "Asteroid 🪨", action: "mine", reward: 30, emoji: "🪨" },
    { id: "alien_npc", label: "Zorbax the Alien 👽", action: "talk", emoji: "👽", dialog: "Greetings earthling! Help me find 3 space crystals! 💎" },
    { id: "crystal1", label: "Space Crystal 💎", action: "collect", reward: 40, emoji: "💎" },
    { id: "minigame_meteor", label: "Meteor Zone! ☄️", action: "minigame", minigameId: "meteor_dodge", emoji: "☄️" },
    { id: "planet_view", label: "Saturn View 🪐", action: "examine", emoji: "🪐", dialog: "Wow! Saturn's rings shimmer with a million colours!" },
  ],
  jungle: [
    { id: "ruin1", label: "Ancient Ruin 🏛️", action: "examine", emoji: "🏛️", dialog: "Strange symbols... they spell a riddle!" },
    { id: "monkey_npc", label: "Miko the Monkey 🐒", action: "talk", emoji: "🐒", dialog: "OOH OOH! Help me find my bananas! 🍌" },
    { id: "banana1", label: "Bananas! 🍌", action: "collect", reward: 15, emoji: "🍌" },
    { id: "minigame_vine", label: "Vine Course 🌿", action: "minigame", minigameId: "vine_swing", emoji: "🌿" },
    { id: "gem_waterfall", label: "Hidden Gem 💎", action: "collect", reward: 60, emoji: "💎" },
  ],
  ocean: [
    { id: "fish_npc", label: "Bubbles the Fish 🐡", action: "talk", emoji: "🐡", dialog: "Blub blub! A sunken ship holds the legendary Pearl of Buggagoogee! 🦪" },
    { id: "treasure_chest", label: "Pirate Treasure 💰", action: "open", reward: 120, emoji: "💰" },
    { id: "pearl", label: "Pearl of Buggagoogee 🦪", action: "collect", reward: 200, emoji: "🦪" },
    { id: "minigame_fish", label: "Fish Frenzy! 🐠", action: "minigame", minigameId: "fish_frenzy", emoji: "🐠" },
    { id: "whale", label: "Friendly Whale 🐋", action: "talk", emoji: "🐋", dialog: "HOOOOO! I am Wavegulp, ancient whale! HOOOO!" },
  ],
};

// Maps for collision (duplicated here to avoid circular deps in controls)
const MAPS = {
  home: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],[1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1],[1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1],[1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],[1,0,0,0,2,0,0,1,1,0,0,2,0,0,0,1],[1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1],[1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1],[1,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  camp: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,2,0,0,2,0,0,0,0,0,1],[1,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1],[1,0,0,0,2,0,0,0,0,0,0,2,0,0,0,1],[1,0,2,0,0,0,1,0,0,1,0,0,0,2,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1],[1,0,0,2,0,0,0,1,1,0,0,0,2,0,0,1],[1,2,0,0,0,0,0,0,0,0,0,0,0,0,2,1],[1,0,0,1,0,0,2,0,0,2,0,0,1,0,0,1],[1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  overworld: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],[1,0,1,0,0,0,1,1,0,1,0,0,0,1,0,1],[1,0,1,0,1,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,0,0,1,0,0,1,0,0,1,1,0,1],[1,1,1,0,1,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,1],[1,0,1,1,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,1,0,0,0,0,1,1,0,1,0,1],[1,0,1,0,1,0,0,1,0,1,0,0,0,0,0,1],[1,0,0,0,0,0,1,0,0,0,0,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  space: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,0,0,1,1,0,1,0,1,1,0,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,1,0,1,1,1,0,1,0,0,0,0,1],[1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1],[1,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  jungle: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,1,1,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,0,0,0,1,1,0,1,0,0,0,1,0,0,1],[1,1,0,1,0,0,0,0,0,0,1,0,0,0,1,1],[1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],[1,1,0,1,0,0,1,0,0,0,1,0,0,0,1,1],[1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1],[1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  ocean: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
};

const MOVE_SPEED = 0.07;
const ROT_SPEED  = 0.05;

export default function WorldGame() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const saveId = searchParams.get("saveId");

  const [saveData, setSaveData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [currentWorld, setCurrentWorld] = useState("overworld");
  const [pos, setPos]                   = useState({ x: 1.5, y: 1.5 });
  const [angle, setAngle]               = useState(0);
  const [bobOffset, setBobOffset]       = useState(0);
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [interactTarget, setInteractTarget] = useState(null);
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [collectedItems, setCollectedItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showMap, setShowMap]           = useState(false);
  const [showShop, setShowShop]         = useState(false);
  const [showStats, setShowStats]       = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [nearbyObj, setNearbyObj]       = useState(null);
  const [hintVisible, setHintVisible]   = useState(false);

  const DEFAULT_SETTINGS = { musicVolume: 50, scanlines: true, pixelGrid: true, vignette: true, neonBorder: true };
  const [gameSettings, setGameSettings] = useState(() => {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("buggagoogee_settings") || "{}") }; }
    catch { return DEFAULT_SETTINGS; }
  });

  function handleSettingsChange(s) {
    setGameSettings(s);
    localStorage.setItem("buggagoogee_settings", JSON.stringify(s));
  }

  // Mobile joystick state
  const mobileRef = useRef({ forward: 0, strafe: 0, turn: 0 });

  const keysRef   = useRef({});
  const posRef    = useRef(pos);
  const angleRef  = useRef(angle);
  const bobRef    = useRef(0);
  const bobDirRef = useRef(1);
  const rafRef    = useRef(null);
  const saveTimerRef = useRef(null);

  posRef.current   = pos;
  angleRef.current = angle;

  // ── Load save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!saveId) { navigate("/"); return; }
    loadSave();
  }, [saveId]);

  async function loadSave() {
    setLoading(true);
    try {
      const saves = await base44.entities.GameSave.filter({ id: saveId });
      if (saves.length > 0) {
        const s = saves[0];
        setSaveData(s);
        const w = s.current_world || "overworld";
        setCurrentWorld(w);
        const start = WORLD_STARTS[w] || WORLD_STARTS.overworld;
        setPos({ x: start.x, y: start.y });
        setAngle(start.angle);
        setCollectedItems([]);
      } else { navigate("/"); }
    } catch (e) { /* ignore */ }
    setLoading(false);
  }

  // ── Other players ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!saveData) return;
    const unsub = base44.entities.GameSave.subscribe((event) => {
      if (event.data?.id !== saveData.id) loadOtherPlayers();
    });
    loadOtherPlayers();
    const interval = setInterval(loadOtherPlayers, 5000);
    return () => { unsub(); clearInterval(interval); };
  }, [saveData, currentWorld]);

  async function loadOtherPlayers() {
    if (!saveData) return;
    try {
      const all = await base44.entities.GameSave.filter({ current_world: currentWorld, online: true });
      const others = all
        .filter(s => s.id !== saveData.id)
        .map(s => ({ id: s.id, username: s.username, x: s.pos_x || 2, y: s.pos_y || 2, charId: s.character, color: s.character_color || "#22d3ee" }));
      setOtherPlayers(others);
    } catch (e) { /* ignore */ }
  }

  // ── Auto-save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!saveData) return;
    saveTimerRef.current = setInterval(async () => {
      try {
        await base44.entities.GameSave.update(saveData.id, {
          pos_x: posRef.current.x,
          pos_y: posRef.current.y,
          current_world: currentWorld,
          last_played: new Date().toISOString(),
          online: true,
        });
      } catch (e) { /* ignore */ }
    }, 10000);
    return () => clearInterval(saveTimerRef.current);
  }, [saveData, currentWorld]);

  // Mark offline on unmount
  useEffect(() => {
    return () => {
      if (saveData) base44.entities.GameSave.update(saveData.id, { online: false }).catch(() => {});
    };
  }, [saveData]);

  // ── Game loop (movement + collision) ───────────────────────────────────────
  const isWall = useCallback((x, y, world) => {
    const map = MAPS[world] || MAPS.overworld;
    const mx = Math.floor(x), my = Math.floor(y);
    if (mx < 0 || mx >= (map[0]?.length || 16) || my < 0 || my >= map.length) return true;
    return map[my][mx] === 1;
  }, []);

  useEffect(() => {
    const loop = () => {
      const keys = keysRef.current;
      const mob = mobileRef.current;
      let moving = false;

      setAngle(prev => {
        let a = prev;
        if (keys["ArrowLeft"] || keys["a"] || keys["A"]) a -= ROT_SPEED;
        if (keys["ArrowRight"] || keys["d"] || keys["D"]) a += ROT_SPEED;
        if (mob.turn !== 0) a += mob.turn * ROT_SPEED;
        angleRef.current = a;
        return a;
      });

      setPos(prev => {
        let { x, y } = prev;
        const a = angleRef.current;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const right = Math.cos(a + Math.PI / 2);
        const rsin  = Math.sin(a + Math.PI / 2);
        let nx = x, ny = y;

        const fwd = (keys["ArrowUp"] || keys["w"] || keys["W"]) ? 1 : (keys["ArrowDown"] || keys["s"] || keys["S"]) ? -1 : mob.forward;
        const str = mob.strafe || 0;

        if (fwd !== 0) { nx += cos * MOVE_SPEED * fwd; ny += sin * MOVE_SPEED * fwd; moving = true; }
        if (str !== 0) { nx += right * MOVE_SPEED * str; ny += rsin * MOVE_SPEED * str; moving = true; }

        const pad = 0.3;
        if (isWall(nx + pad * Math.sign(cos), y, currentWorld)) nx = x;
        if (isWall(x, ny + pad * Math.sign(sin), currentWorld)) ny = y;
        if (isWall(nx, y, currentWorld)) nx = x;
        if (isWall(x, ny, currentWorld)) ny = y;

        posRef.current = { x: nx, y: ny };
        return { x: nx, y: ny };
      });

      // Walk bob
      if (moving) {
        bobRef.current += bobDirRef.current * 0.25;
        if (Math.abs(bobRef.current) > 5) bobDirRef.current *= -1;
      } else {
        bobRef.current *= 0.75;
      }
      setBobOffset(bobRef.current);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentWorld, isWall]);

  // ── Keyboard events ────────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e) => {
      keysRef.current[e.key] = true;
      if (e.key === "e" || e.key === "E") {
        if (nearbyObj) handleAction(nearbyObj);
      }
    };
    const onUp = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, [nearbyObj, saveData, currentWorld, collectedItems]);

  // ── Proximity detection (show interact prompt) ─────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const secrets = (WORLD_SECRETS[currentWorld] || []).filter(o => !collectedItems.includes(o.id));
      // In FPS mode, "proximity" is random — we cycle through objects every 8s to give hints
      const idx = Math.floor(Date.now() / 8000) % Math.max(1, secrets.length);
      const obj = secrets[idx] || null;
      setNearbyObj(obj);
      setHintVisible(!!obj);
    }, 500);
    return () => clearInterval(interval);
  }, [currentWorld, collectedItems]);

  // ── Notifications ──────────────────────────────────────────────────────────
  function showNotif(msg, color = "#a855f7") {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  }

  // ── Action handler ─────────────────────────────────────────────────────────
  async function handleAction(obj) {
    setInteractTarget(null);
    if (!obj) return;

    if (obj.action === "travel") {
      const dest = obj.destination;
      setCurrentWorld(dest);
      const start = WORLD_STARTS[dest] || WORLD_STARTS.overworld;
      setPos({ x: start.x, y: start.y });
      setAngle(start.angle);
      showNotif(`Entered ${WORLDS[dest]?.name || dest}! 🌀`, "#22d3ee");
      try { await base44.entities.GameSave.update(saveData.id, { current_world: dest }); } catch (e) {}
      setSaveData(prev => ({ ...prev, current_world: dest }));
    } else if (obj.action === "minigame") {
      setActiveMinigame(obj.minigameId);
    } else if (obj.action === "shop") {
      setShowShop(true);
    } else if (obj.action === "collect" || obj.action === "open" || obj.action === "mine") {
      setCollectedItems(prev => [...prev, obj.id]);
      const reward = obj.reward || 0;
      const newCoins = (saveData.coins || 0) + reward;
      const newXP = (saveData.xp || 0) + Math.floor(reward / 2);
      try {
        const updated = await base44.entities.GameSave.update(saveData.id, { coins: newCoins, xp: newXP });
        setSaveData(prev => ({ ...prev, ...updated }));
      } catch (e) {
        setSaveData(prev => ({ ...prev, coins: newCoins, xp: newXP }));
      }
      showNotif(`+${reward} coins! 🪙`, "#fbbf24");
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 }, colors: ["#fbbf24", "#a855f7"] });
    } else if (obj.action === "rest") {
      showNotif("Rested! Feeling refreshed! ✨", "#4ade80");
    } else if (obj.action === "talk" || obj.action === "examine") {
      setInteractTarget(obj);
    }
  }

  async function handleMinigameComplete(won) {
    const mgId = activeMinigame;
    setActiveMinigame(null);
    if (won) {
      const reward = { treasure_hunt: 50, meteor_dodge: 80, fish_frenzy: 70, vine_swing: 60 }[mgId] || 50;
      const newCoins = (saveData.coins || 0) + reward;
      const newXP = (saveData.xp || 0) + reward;
      const completed = [...(saveData.completed_minigames || [])];
      if (!completed.includes(mgId)) completed.push(mgId);
      try {
        const updated = await base44.entities.GameSave.update(saveData.id, { coins: newCoins, xp: newXP, completed_minigames: completed });
        setSaveData(prev => ({ ...prev, ...updated }));
      } catch (e) {
        setSaveData(prev => ({ ...prev, coins: newCoins, xp: newXP, completed_minigames: completed }));
      }
      showNotif(`Mini-game won! +${reward} coins! 🏆`, "#fbbf24");
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } });
    }
  }

  async function buyItem(item) {
    if ((saveData.coins || 0) < item.cost) { showNotif("Not enough coins! 🪙", "#ef4444"); return; }
    const inventory = [...(saveData.inventory || [])];
    if (inventory.includes(item.id)) { showNotif("Already owned!", "#a855f7"); return; }
    inventory.push(item.id);
    try {
      const updated = await base44.entities.GameSave.update(saveData.id, { coins: saveData.coins - item.cost, inventory });
      setSaveData(prev => ({ ...prev, ...updated }));
    } catch (e) {
      setSaveData(prev => ({ ...prev, coins: prev.coins - item.cost, inventory }));
    }
    showNotif(`Got ${item.name}! ${item.emoji}`, "#4ade80");
  }

  async function manualSave() {
    try {
      await base44.entities.GameSave.update(saveData.id, {
        pos_x: posRef.current.x,
        pos_y: posRef.current.y,
        current_world: currentWorld,
        last_played: new Date().toISOString(),
      });
      showNotif("Game saved! 💾", "#22d3ee");
    } catch (e) { showNotif("Save failed, try again!", "#ef4444"); }
  }

  async function travelToWorld(wId) {
    setCurrentWorld(wId);
    const start = WORLD_STARTS[wId] || WORLD_STARTS.overworld;
    setPos({ x: start.x, y: start.y });
    setAngle(start.angle);
    setSaveData(prev => ({ ...prev, current_world: wId }));
    setShowMap(false);
    showNotif(`Teleported to ${WORLDS[wId]?.name}! 🗺️`, "#22d3ee");
    try { await base44.entities.GameSave.update(saveData.id, { current_world: wId }); } catch (e) {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#000510" }}>
        <div className="text-center">
          <div className="text-7xl roxy-bounce mb-4">🐕</div>
          <p className="font-orbitron font-black text-2xl neon-text-purple">Loading World...</p>
          <div className="mt-4 w-32 h-1 mx-auto bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-purple-500 rounded-full" animate={{ width: ["0%","100%"] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </div>
        </div>
      </div>
    );
  }

  const charInfo  = CHAR_DATA[saveData?.character] || CHARACTERS[0];
  const worldInfo = WORLDS[currentWorld] || WORLDS.overworld;
  const MinigameComp = activeMinigame ? MINIGAME_COMPONENTS[activeMinigame] : null;
  const worldSecrets = (WORLD_SECRETS[currentWorld] || []).filter(o => !collectedItems.includes(o.id));

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: "#000510" }}>
      {/* ── Top HUD ─────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-center gap-2 px-3 py-2 flex-wrap"
        style={{ background: "rgba(0,0,0,0.7)", borderBottom: `1px solid ${worldInfo.borderColor || "#a855f7"}30` }}>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{charInfo.emoji}</span>
          <div className="min-w-0">
            <div className="font-black text-white text-sm truncate font-orbitron">{saveData?.username}</div>
            <div className="text-xs flex items-center gap-1">
              <span style={{ color: worldInfo.borderColor }}>{worldInfo.emoji}</span>
              <span className="text-white/40 truncate">{worldInfo.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <span className="text-sm">🪙</span>
          <span className="font-black text-yellow-400 font-orbitron text-sm">{saveData?.coins || 0}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
          <span className="text-sm">⭐</span>
          <span className="font-black text-purple-400 font-orbitron text-sm">{saveData?.xp || 0}</span>
        </div>
        {otherPlayers.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)" }}>
            <span className="text-sm">👥</span>
            <span className="font-black text-cyan-400 text-sm">{otherPlayers.length}</span>
          </div>
        )}
      </div>

      {/* ── FPS Viewport ────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden" style={{ border: `2px solid ${worldInfo.borderColor || "#a855f7"}40` }}>
        <FirstPersonRenderer
          world={currentWorld}
          angle={angle}
          playerPos={pos}
          bobOffset={bobOffset}
          otherPlayers={otherPlayers}
          settings={gameSettings}
        />

        {/* Interact prompt */}
        <AnimatePresence>
          {hintVisible && nearbyObj && (
            <motion.div
              key={nearbyObj.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-center"
              style={{
                background: "rgba(0,0,0,0.8)",
                border: `1px solid ${worldInfo.borderColor || "#a855f7"}60`,
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="text-lg">{nearbyObj.emoji} <span className="font-black text-white">{nearbyObj.label}</span></div>
              <div className="text-xs text-white/50 mt-0.5">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">E</kbd> or tap to interact</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compass */}
        <div className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center text-xs font-black pointer-events-none"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ transform: `rotate(${-angle * 180 / Math.PI}deg)`, fontSize: 20 }}>🧭</div>
        </div>

        {/* FPS Mobile controls */}
        <FPSMobileControls
          onMove={(v) => { mobileRef.current.forward = v.forward; mobileRef.current.strafe = v.strafe; }}
          onTurn={(v) => { mobileRef.current.turn = v; }}
        />
      </div>

      {/* ── Bottom toolbar ───────────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-center gap-2 px-3 py-2 flex-wrap"
        style={{ background: "rgba(0,0,0,0.75)", borderTop: `1px solid ${worldInfo.borderColor || "#a855f7"}20` }}>

        {/* Interact button */}
        {nearbyObj && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleAction(nearbyObj)}
            className="px-4 py-2 rounded-xl font-black text-sm text-white flex items-center gap-1"
            style={{ background: `linear-gradient(135deg, ${worldInfo.borderColor || "#a855f7"}, ${worldInfo.borderColor || "#a855f7"}99)`, boxShadow: `0 0 12px ${worldInfo.borderColor || "#a855f7"}50` }}
          >
            <Zap className="w-3.5 h-3.5" /> {nearbyObj.emoji} Interact
          </motion.button>
        )}

        <button onClick={() => setShowMap(true)}
          className="glass-card rounded-xl px-3 py-2 border border-white/10 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
          <Map className="w-3.5 h-3.5" /><span className="font-bold hidden sm:block">Map</span>
        </button>
        <button onClick={() => setShowShop(true)}
          className="glass-card rounded-xl px-3 py-2 border border-white/10 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
          <ShoppingBag className="w-3.5 h-3.5" /><span className="font-bold hidden sm:block">Shop</span>
        </button>
        <button onClick={() => setShowStats(true)}
          className="glass-card rounded-xl px-3 py-2 border border-white/10 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
          <User className="w-3.5 h-3.5" /><span className="font-bold hidden sm:block">Profile</span>
        </button>
        <button onClick={() => setShowLeaderboard(l => !l)}
          className="glass-card rounded-xl px-3 py-2 border border-yellow-400/20 flex items-center gap-1.5 text-yellow-400/70 hover:text-yellow-400 transition-colors text-sm">
          <span>🏆</span><span className="font-bold hidden sm:block">Ranks</span>
        </button>
        <button onClick={manualSave}
          className="glass-card rounded-xl px-3 py-2 border border-white/10 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
          <Save className="w-3.5 h-3.5" /><span className="font-bold hidden sm:block">Save</span>
        </button>
        <button onClick={() => setShowSettings(true)}
          className="glass-card rounded-xl px-3 py-2 border border-white/10 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
          <Settings className="w-3.5 h-3.5" /><span className="font-bold hidden sm:block">Settings</span>
        </button>

        <div className="ml-auto flex gap-2 items-center">
          {/* World objects list */}
          <div className="hidden md:flex items-center gap-1 text-xs text-white/30">
            <Compass className="w-3 h-3" />
            {worldSecrets.slice(0, 3).map(o => <span key={o.id}>{o.emoji}</span>)}
            {worldSecrets.length > 3 && <span>+{worldSecrets.length - 3}</span>}
          </div>
          <ChatBox saveData={saveData} world={currentWorld} />
        </div>
      </div>

      {/* Leaderboard panel */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ opacity: 0, x: 200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 200 }}
            className="fixed right-4 top-16 z-30 w-56">
            <Leaderboard currentSaveId={saveData?.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notification toast ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-black text-white text-lg"
            style={{ background: notification.color, boxShadow: `0 0 20px ${notification.color}60` }}>
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interact modal */}
      <InteractModal obj={interactTarget} onClose={() => setInteractTarget(null)} onAction={handleAction} />

      {/* Minigame overlay */}
      {MinigameComp && (
        <MinigameComp onComplete={handleMinigameComplete} onExit={() => setActiveMinigame(null)} />
      )}

      {/* ── World Map Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMap && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setShowMap(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-3xl p-6 border border-purple-500/30 max-w-md w-full"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-orbitron font-black text-2xl text-white mb-4">🗺️ World Map</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(WORLDS).map(w => (
                  <button key={w.id} onClick={() => travelToWorld(w.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${currentWorld === w.id ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 glass-card hover:border-white/30'}`}>
                    <div className="text-3xl mb-2">{w.emoji}</div>
                    <div className="font-black text-white text-sm">{w.name}</div>
                    <div className="text-white/40 text-xs">{w.description}</div>
                    {currentWorld === w.id && <div className="text-purple-400 text-xs font-bold mt-1">📍 You are here</div>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Shop Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setShowShop(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-3xl p-6 border border-pink-500/30 max-w-md w-full"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-black text-2xl text-white">🏪 Item Shop</h3>
                <div className="flex items-center gap-1 px-3 py-1 rounded-xl" style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)" }}>
                  <span>🪙</span><span className="font-black text-yellow-400">{saveData?.coins || 0}</span>
                </div>
              </div>
              <div className="space-y-3">
                {SHOP_ITEMS.map(item => {
                  const owned = (saveData?.inventory || []).includes(item.id);
                  return (
                    <div key={item.id} className="glass-card rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                      <span className="text-3xl">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="font-black text-white">{item.name}</div>
                        <div className="text-white/50 text-xs">{item.description}</div>
                      </div>
                      <button onClick={() => buyItem(item)}
                        disabled={owned || (saveData?.coins || 0) < item.cost}
                        className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${owned ? 'bg-green-600/30 text-green-400' : (saveData?.coins || 0) >= item.cost ? 'btn-gold text-yellow-900' : 'bg-white/10 text-white/30'}`}>
                        {owned ? "✓ Owned" : `🪙 ${item.cost}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showStats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setShowStats(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-3xl p-6 border border-cyan-500/30 max-w-sm w-full"
              onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{charInfo.emoji}</div>
                <h3 className="font-orbitron font-black text-2xl text-white">{saveData?.username}</h3>
                <p className="text-white/50 text-sm">{charInfo.name} · {charInfo.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Coins", value: saveData?.coins || 0, emoji: "🪙", color: "#fbbf24" },
                  { label: "XP", value: saveData?.xp || 0, emoji: "⭐", color: "#a855f7" },
                  { label: "Mini-games", value: (saveData?.completed_minigames || []).length, emoji: "🎮", color: "#22d3ee" },
                  { label: "Items", value: (saveData?.inventory || []).length, emoji: "🎒", color: "#4ade80" },
                ].map(s => (
                  <div key={s.label} className="glass-card rounded-2xl p-3 border border-white/10 text-center">
                    <div className="text-2xl mb-1">{s.emoji}</div>
                    <div className="font-black font-orbitron text-xl" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-white/40 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { navigate("/"); }}
                className="w-full py-3 rounded-2xl font-bold text-white/50 glass-card border border-white/10 hover:text-white transition-colors">
                🚪 Leave World
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsMenu
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={gameSettings}
        onChange={handleSettingsChange}
      />

      {/* WASD hint */}
      <div className="hidden md:block fixed bottom-16 right-4 text-white/20 text-xs font-orbitron z-10">
        WASD / ↑↓←→ to move
      </div>
    </div>
  );
}