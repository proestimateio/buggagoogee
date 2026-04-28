// World-keyed adventures. Each adventure is tied to a real world the player
// can walk into, with hands-on quest steps (collect / travel / minigame / talk).
// No quizzes — players learn by doing.

export const ADVENTURES = [
  {
    id: "home_quest",
    world: "home",
    name: "Home Sweet Home",
    subtitle: "A cozy mystery hunt",
    emoji: "🏠",
    color: "from-amber-500 to-orange-700",
    borderColor: "#f59e0b",
    category: "Discovery",
    unlockXP: 0,
    description: "Roxy lost her favourite toy somewhere in the house. Search high and low to find it!",
    bgGradient: "from-amber-900 via-orange-900 to-stone-900",
    teaches: "Spatial reasoning · Observation",
  },
  {
    id: "camp_quest",
    world: "camp",
    name: "Cabin Campout",
    subtitle: "Survival skills under the stars",
    emoji: "🏕️",
    color: "from-orange-700 to-amber-900",
    borderColor: "#b45309",
    category: "Outdoors",
    unlockXP: 50,
    description: "Gather firewood, light the campfire and connect the constellations above the cabin.",
    bgGradient: "from-stone-900 via-amber-950 to-black",
    teaches: "Astronomy · Pattern recognition",
  },
  {
    id: "village_quest",
    world: "overworld",
    name: "Village Helper",
    subtitle: "Be the hero of Buggagoogee",
    emoji: "🏘️",
    color: "from-purple-600 to-fuchsia-800",
    borderColor: "#a855f7",
    category: "Community",
    unlockXP: 150,
    description: "Help the villagers fix things and program a delivery drone with block-code.",
    bgGradient: "from-purple-900 via-fuchsia-900 to-slate-900",
    teaches: "Coding logic · Sequencing",
  },
  {
    id: "space_quest",
    world: "space",
    name: "Space Voyage",
    subtitle: "Map the cosmos",
    emoji: "🚀",
    color: "from-cyan-600 to-indigo-800",
    borderColor: "#22d3ee",
    category: "Astronomy",
    unlockXP: 300,
    description: "Collect star fragments and connect ancient constellations. The sky is full of secrets.",
    bgGradient: "from-indigo-950 via-purple-950 to-black",
    teaches: "Astronomy · Navigation",
  },
  {
    id: "jungle_quest",
    world: "jungle",
    name: "Jungle Expedition",
    subtitle: "Decode the lost ruins",
    emoji: "🌴",
    color: "from-green-600 to-emerald-800",
    borderColor: "#4ade80",
    category: "Archaeology",
    unlockXP: 500,
    description: "Tap glyph stones in the right order to unlock the temple of Buggagoogee.",
    bgGradient: "from-green-950 via-emerald-900 to-stone-900",
    teaches: "Pattern matching · Symbols",
  },
  {
    id: "ocean_quest",
    world: "ocean",
    name: "Ocean Depths",
    subtitle: "Rebuild the reef",
    emoji: "🌊",
    color: "from-sky-600 to-blue-900",
    borderColor: "#38bdf8",
    category: "Ecology",
    unlockXP: 700,
    description: "Place coral, fish and predators to balance a healthy reef ecosystem.",
    bgGradient: "from-sky-950 via-blue-950 to-black",
    teaches: "Ecosystems · Cause & effect",
  },
];

// 3 steps per adventure; each step references real interactables/minigames.
export const ADVENTURE_QUESTS = {
  home_quest: {
    steps: [
      { goal: "talk",     target: "family_photo",   hint: "Look at the family portrait in the living room." },
      { goal: "collect",  target: "book_coin",      hint: "Search the bookshelf for a hidden coin." },
      { goal: "collect",  target: "puzzle_box",     hint: "Open the mystery gift box near the rug." },
    ],
  },
  camp_quest: {
    steps: [
      { goal: "travel",   target: "camp",           hint: "Head to the Log Cabin Camp." },
      { goal: "collect",  target: "pine_treasure",  hint: "Dig under the big pine for buried treasure." },
      { goal: "minigame", target: "constellation_connect", hint: "Connect the stars above the cabin." },
    ],
  },
  village_quest: {
    steps: [
      { goal: "talk",     target: "npc_dog",        hint: "Rex has a job for you in the village." },
      { goal: "collect",  target: "golden_bone",    hint: "Find the golden bone near the old oak." },
      { goal: "minigame", target: "block_coder",    hint: "Program Roxy to fetch the bone." },
    ],
  },
  space_quest: {
    steps: [
      { goal: "travel",   target: "space",          hint: "Travel to the Cosmic Nebula." },
      { goal: "collect",  target: "crystal1",       hint: "Collect at least one Space Crystal." },
      { goal: "minigame", target: "constellation_connect", hint: "Trace the constellations above the nebula." },
    ],
  },
  jungle_quest: {
    steps: [
      { goal: "travel",   target: "jungle",         hint: "Hack into the Mystic Jungle." },
      { goal: "examine",  target: "ruin1",          hint: "Inspect the ancient ruins." },
      { goal: "minigame", target: "glyph_decoder",  hint: "Decode the glyphs to unlock the temple." },
    ],
  },
  ocean_quest: {
    steps: [
      { goal: "travel",   target: "ocean",          hint: "Dive into the Deep Ocean." },
      { goal: "examine",  target: "coral",          hint: "Study the rainbow coral." },
      { goal: "minigame", target: "reef_rebuild",   hint: "Rebuild the reef ecosystem." },
    ],
  },
};

// Level-based unlock track. As player gains XP, fun new things appear.
export const LEVEL_UNLOCKS = [
  { level: 2, type: "ability", id: "sprint",        emoji: "⚡", label: "Sprint (hold Shift)" },
  { level: 3, type: "skin",    id: "buggagoogee",   emoji: "🐕", label: "Buggagoogee skin" },
  { level: 4, type: "trick",   id: "highfive",      emoji: "🐾", label: "Roxy: High Five" },
  { level: 5, type: "ability", id: "double_jump",   emoji: "🪂", label: "Double Jump" },
  { level: 5, type: "skin",    id: "shadow",        emoji: "🦊", label: "Shadow skin" },
  { level: 6, type: "trick",   id: "spin",          emoji: "🌀", label: "Roxy: Spin" },
  { level: 7, type: "skin",    id: "blaze",         emoji: "🔥", label: "Blaze skin" },
  { level: 7, type: "ability", id: "photo_mode",    emoji: "📸", label: "Photo Mode" },
  { level: 8, type: "trick",   id: "dance",         emoji: "💃", label: "Roxy: Dance" },
  { level: 9, type: "ability", id: "build_blocks",  emoji: "🧱", label: "Build Blocks" },
  { level: 10, type: "badge",  id: "legend_crown",  emoji: "👑", label: "Legend Crown" },
];

export function getUnlocksAt(level) {
  return LEVEL_UNLOCKS.filter(u => u.level === level);
}
export function getAllUnlocksUpTo(level) {
  return LEVEL_UNLOCKS.filter(u => u.level <= level);
}

// Pop-up achievements ("wow" badges)
export const ACHIEVEMENTS = [
  { id: "first_coin",      name: "First Coin",          emoji: "🪙", desc: "Collect your first coin",      xp: 20 },
  { id: "explorer",        name: "Explorer",            emoji: "🧭", desc: "Visit 3 different worlds",     xp: 50 },
  { id: "globetrotter",    name: "Globetrotter",        emoji: "🌍", desc: "Visit every world",            xp: 100 },
  { id: "minigame_rookie", name: "Mini-Game Rookie",    emoji: "🎮", desc: "Win your first mini-game",     xp: 40 },
  { id: "minigame_master", name: "Mini-Game Master",    emoji: "🏆", desc: "Win every mini-game",          xp: 200 },
  { id: "stargazer",       name: "Stargazer",           emoji: "⭐", desc: "Connect a constellation",      xp: 80 },
  { id: "ecologist",       name: "Eco Hero",            emoji: "🪸", desc: "Balance a reef ecosystem",     xp: 80 },
  { id: "linguist",        name: "Glyph Reader",        emoji: "📜", desc: "Decode an ancient glyph",      xp: 80 },
  { id: "coder",           name: "Junior Coder",        emoji: "💻", desc: "Program Roxy successfully",    xp: 80 },
  { id: "social",          name: "Social Butterfly",    emoji: "💬", desc: "Send your first chat message", xp: 20 },
  { id: "stylist",         name: "Style Icon",          emoji: "👗", desc: "Customise your avatar",        xp: 20 },
  { id: "rich",            name: "Coin Hoarder",        emoji: "💰", desc: "Save up 500 coins",            xp: 60 },
  { id: "level10",         name: "Legend",              emoji: "👑", desc: "Reach level 10",               xp: 0 },
];

export const ROXY_OUTFITS = [
  { id: "default",   name: "Classic Roxy", emoji: "🐕",       cost: 0,   unlocked: true },
  { id: "astronaut", name: "Space Pup",    emoji: "🐕‍🦺",     cost: 100, unlocked: false },
  { id: "explorer",  name: "Explorer",     emoji: "🦮",       cost: 200, unlocked: false },
  { id: "wizard",    name: "Wizard Pup",   emoji: "🐩",       cost: 400, unlocked: false },
  { id: "cyber",     name: "Cyber Roxy",   emoji: "🤖",       cost: 600, unlocked: false },
];

export const ROXY_TRICKS = [
  { id: "sit",          name: "Sit",          emoji: "🐕",  xpRequired: 0,    description: "Roxy can sit!" },
  { id: "highfive",     name: "High Five",    emoji: "🐾",  xpRequired: 150,  description: "Roxy gives high fives!" },
  { id: "spin",         name: "Spin",         emoji: "🌀",  xpRequired: 600,  description: "Roxy spins in circles!" },
  { id: "dance",        name: "Dance",        emoji: "💃",  xpRequired: 1500, description: "Roxy dances to music!" },
  { id: "flyingsaucer", name: "Catch Frisbee", emoji: "🥏", xpRequired: 3000, description: "Roxy catches frisbees!" },
];

// Avatar customisation palette — used by AvatarCreator + ThirdPersonRenderer
export const AVATAR_OPTIONS = {
  skinTones:  ["#f4d2b0", "#e8b48a", "#c98c5a", "#9a6133", "#5d3a1f", "#f7dac0"],
  hairStyles: ["short", "medium", "long", "ponytail", "buzz", "curly", "pigtails"],
  hairColors: ["#1a0e08", "#3a2418", "#6b4226", "#a05a2c", "#d97e3a", "#e8b14a", "#bdbdbd", "#ec4899", "#22d3ee", "#a855f7"],
  tops:       ["tee", "hoodie", "jacket", "dress", "tank"],
  topColors:  ["#a855f7", "#22d3ee", "#fbbf24", "#ec4899", "#4ade80", "#ef4444", "#f97316", "#3b82f6", "#ffffff", "#1f2937", "#84cc16", "#14b8a6"],
  bottoms:    ["jeans", "shorts", "skirt", "joggers"],
  bottomColors: ["#1e3a8a", "#3b82f6", "#0f172a", "#374151", "#9a3412", "#7c2d12", "#831843", "#0c4a6e", "#365314", "#a16207"],
  shoes:      ["sneakers", "boots", "sandals", "fancy"],
  shoesColors: ["#ffffff", "#000000", "#ef4444", "#3b82f6", "#facc15", "#a855f7"],
  accessories: ["none", "cap", "beanie", "glasses", "headphones", "crown"],
};

export const DEFAULT_APPEARANCE = {
  skinTone:    "#f4d2b0",
  hair:        "short",
  hairColor:   "#3a2418",
  top:         "hoodie",
  topColor:    "#a855f7",
  bottom:      "jeans",
  bottomColor: "#1e3a8a",
  shoes:       "sneakers",
  shoesColor:  "#ffffff",
  accessory:   "none",
};

export const PRESET_LOOKS = {
  eli: {
    skinTone: "#f4d2b0", hair: "short",  hairColor: "#3a2418",
    top: "jacket", topColor: "#3b82f6", bottom: "jeans", bottomColor: "#1e3a8a",
    shoes: "sneakers", shoesColor: "#ffffff", accessory: "none",
  },
  lyla: {
    skinTone: "#f7dac0", hair: "long", hairColor: "#6b4226",
    top: "dress", topColor: "#ec4899", bottom: "skirt", bottomColor: "#831843",
    shoes: "fancy", shoesColor: "#facc15", accessory: "none",
  },
  buggagoogee: {
    skinTone: "#e8b14a", hair: "curly", hairColor: "#a05a2c",
    top: "hoodie", topColor: "#a855f7", bottom: "joggers", bottomColor: "#374151",
    shoes: "sneakers", shoesColor: "#000000", accessory: "headphones",
  },
  shadow: {
    skinTone: "#9a6133", hair: "buzz", hairColor: "#1a0e08",
    top: "jacket", topColor: "#1f2937", bottom: "jeans", bottomColor: "#0f172a",
    shoes: "boots", shoesColor: "#000000", accessory: "glasses",
  },
  blaze: {
    skinTone: "#c98c5a", hair: "medium", hairColor: "#d97e3a",
    top: "tee", topColor: "#ef4444", bottom: "shorts", bottomColor: "#7c2d12",
    shoes: "sneakers", shoesColor: "#facc15", accessory: "cap",
  },
};

export const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1100, 1500, 2000, 2700, 3500];

export function getLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(xp) {
  const level = getLevel(xp);
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  return { current: xp - currentThreshold, needed: nextThreshold - currentThreshold };
}
