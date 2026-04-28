export const CHARACTERS = [
  { id: "eli",         name: "Eli",         emoji: "🧑", color: "#6366f1", description: "Explorer & Inventor", unlockLevel: 0 },
  { id: "lyla",        name: "Lyla",        emoji: "👧", color: "#ec4899", description: "Bold Adventurer",     unlockLevel: 0 },
  { id: "buggagoogee", name: "Buggagoogee", emoji: "🐕", color: "#a855f7", description: "The Legend Himself",  unlockLevel: 3 },
  { id: "shadow",      name: "Shadow",      emoji: "🦊", color: "#f59e0b", description: "Stealth Master",      unlockLevel: 5 },
  { id: "blaze",       name: "Blaze",       emoji: "🔥", color: "#ef4444", description: "Fire Spirit",         unlockLevel: 7 },
];

export const WORLDS = {
  home: {
    id: "home",
    name: "Cozy Home",
    emoji: "🏠",
    bg: "#2a1a0e",
    borderColor: "#f59e0b",
    description: "A warm family living room",
    tiles: generateHome(),
  },
  camp: {
    id: "camp",
    name: "Log Cabin Camp",
    emoji: "🪵",
    bg: "#1a0f06",
    borderColor: "#b45309",
    description: "A rustic wilderness camp",
    tiles: generateCamp(),
  },
  overworld: {
    id: "overworld",
    name: "Buggagoogee Village",
    emoji: "🏘️",
    bg: "#1a3a1a",
    borderColor: "#a855f7",
    description: "The starting hub world",
    tiles: generateOverworld(),
  },
  space: {
    id: "space",
    name: "Cosmic Nebula",
    emoji: "🚀",
    bg: "#050520",
    borderColor: "#22d3ee",
    description: "Explore the galaxy",
    tiles: generateSpace(),
  },
  jungle: {
    id: "jungle",
    name: "Mystic Jungle",
    emoji: "🌿",
    bg: "#0d2d0d",
    borderColor: "#4ade80",
    description: "Ancient ruins & secrets",
    tiles: generateJungle(),
  },
  ocean: {
    id: "ocean",
    name: "Deep Ocean",
    emoji: "🌊",
    bg: "#031525",
    borderColor: "#38bdf8",
    description: "Underwater adventure",
    tiles: generateOcean(),
  },
};

export const MINIGAMES = [
  { id: "treasure_hunt",          name: "Treasure Hunt",        emoji: "🗺️", world: "overworld", description: "Find 5 hidden gems!",                     reward: 50 },
  { id: "meteor_dodge",           name: "Meteor Dodge",         emoji: "☄️", world: "space",     description: "Dodge the meteors!",                      reward: 80 },
  { id: "vine_swing",             name: "Vine Swing",           emoji: "🌿", world: "jungle",    description: "Swing through the treetops!",             reward: 60 },
  { id: "fish_frenzy",            name: "Fish Frenzy",          emoji: "🐠", world: "ocean",     description: "Catch as many fish as possible!",         reward: 70 },
  { id: "constellation_connect",  name: "Constellation Connect", emoji: "⭐", world: "space",     description: "Trace real star patterns in the sky.",    reward: 90 },
  { id: "glyph_decoder",          name: "Glyph Decoder",        emoji: "📜", world: "jungle",    description: "Decode hieroglyphs to unlock the temple.", reward: 100 },
  { id: "block_coder",            name: "Roxy Block Coder",     emoji: "💻", world: "overworld", description: "Program Roxy with drag-and-drop blocks.",  reward: 120 },
  { id: "reef_rebuild",           name: "Reef Rebuild",         emoji: "🪸", world: "ocean",     description: "Balance a healthy reef ecosystem.",        reward: 110 },
];

// Portals placed at the 4 edges of each world (top, right, bottom, left)
// Each edge leads to a different world
const EDGE_PORTALS = {
  home: [
    { id: "portal_north", x: 380, y: 28,  emoji: "🚪", label: "→ Log Cabin Camp", action: "travel", destination: "camp",      edgePortal: true },
    { id: "portal_east",  x: 736, y: 250, emoji: "🚪", label: "→ Village",         action: "travel", destination: "overworld", edgePortal: true },
    { id: "portal_south", x: 380, y: 472, emoji: "🚪", label: "→ Deep Ocean",      action: "travel", destination: "ocean",     edgePortal: true },
    { id: "portal_west",  x: 24,  y: 250, emoji: "🚪", label: "← Cosmic Nebula",   action: "travel", destination: "space",     edgePortal: true },
  ],
  camp: [
    { id: "portal_north", x: 380, y: 28,  emoji: "🌲", label: "→ Village",         action: "travel", destination: "overworld", edgePortal: true },
    { id: "portal_east",  x: 736, y: 250, emoji: "🌲", label: "→ Cosmic Nebula",  action: "travel", destination: "space",     edgePortal: true },
    { id: "portal_south", x: 380, y: 472, emoji: "🌲", label: "→ Cozy Home",       action: "travel", destination: "home",      edgePortal: true },
    { id: "portal_west",  x: 24,  y: 250, emoji: "🌲", label: "← Mystic Jungle",   action: "travel", destination: "jungle",    edgePortal: true },
  ],
  overworld: [
    { id: "portal_north", x: 380, y: 28,  emoji: "🌀", label: "→ Cosmic Nebula",  action: "travel", destination: "space",    edgePortal: true },
    { id: "portal_east",  x: 736, y: 250, emoji: "🌀", label: "→ Mystic Jungle",   action: "travel", destination: "jungle",   edgePortal: true },
    { id: "portal_south", x: 380, y: 472, emoji: "🌀", label: "→ Deep Ocean",       action: "travel", destination: "ocean",    edgePortal: true },
    { id: "portal_west",  x: 24,  y: 250, emoji: "🌀", label: "← Cosmic Nebula",   action: "travel", destination: "space",    edgePortal: true },
  ],
  space: [
    { id: "portal_north", x: 380, y: 28,  emoji: "🌀", label: "→ Mystic Jungle",  action: "travel", destination: "jungle",   edgePortal: true },
    { id: "portal_east",  x: 736, y: 250, emoji: "🌀", label: "→ Deep Ocean",      action: "travel", destination: "ocean",    edgePortal: true },
    { id: "portal_south", x: 380, y: 472, emoji: "🌀", label: "→ Village",         action: "travel", destination: "overworld",edgePortal: true },
    { id: "portal_west",  x: 24,  y: 250, emoji: "🌀", label: "← Village",         action: "travel", destination: "overworld",edgePortal: true },
  ],
  jungle: [
    { id: "portal_north", x: 380, y: 28,  emoji: "🌀", label: "→ Deep Ocean",     action: "travel", destination: "ocean",    edgePortal: true },
    { id: "portal_east",  x: 736, y: 250, emoji: "🌀", label: "→ Village",         action: "travel", destination: "overworld",edgePortal: true },
    { id: "portal_south", x: 380, y: 472, emoji: "🌀", label: "→ Cosmic Nebula",  action: "travel", destination: "space",    edgePortal: true },
    { id: "portal_west",  x: 24,  y: 250, emoji: "🌀", label: "← Cosmic Nebula",  action: "travel", destination: "space",    edgePortal: true },
  ],
  ocean: [
    { id: "portal_north", x: 380, y: 28,  emoji: "🌀", label: "→ Village",         action: "travel", destination: "overworld",edgePortal: true },
    { id: "portal_east",  x: 736, y: 250, emoji: "🌀", label: "→ Cosmic Nebula",  action: "travel", destination: "space",    edgePortal: true },
    { id: "portal_south", x: 380, y: 472, emoji: "🌀", label: "→ Mystic Jungle",  action: "travel", destination: "jungle",   edgePortal: true },
    { id: "portal_west",  x: 24,  y: 250, emoji: "🌀", label: "← Mystic Jungle",  action: "travel", destination: "jungle",   edgePortal: true },
  ],
};

export const INTERACTABLES = {
  home: [
    ...EDGE_PORTALS.home,
    { id: "sofa", x: 300, y: 200, emoji: "🛋️", label: "Cozy Sofa", action: "rest", dialog: "You sink into the soft cushions. Ahh... home sweet home! Feeling refreshed! ✨" },
    { id: "tv", x: 500, y: 150, emoji: "📺", label: "Family TV", action: "examine", dialog: "The TV shows old family videos. You spot a secret code hidden in the corner: 🐕7-4-2!" },
    { id: "bookshelf", x: 150, y: 180, emoji: "📚", label: "Bookshelf", action: "examine", dialog: "A shelf full of adventure books! One titled 'Secrets of Buggagoogee' falls out and a golden coin drops!" },
    { id: "book_coin", x: 170, y: 200, emoji: "🪙", label: "Lost Coin", action: "collect", reward: 40 },
    { id: "fireplace", x: 400, y: 100, emoji: "🔥", label: "Cozy Fireplace", action: "rest", dialog: "The crackling fire warms your soul. You feel completely at home. 🏠" },
    { id: "dog_bowl", x: 250, y: 350, emoji: "🐾", label: "Buggagoogee's Bowl", action: "examine", dialog: "Buggagoogee's favourite bowl! There's still some kibble in it. You hear a distant bark... 🐕" },
    { id: "hidden_cookie", x: 550, y: 300, emoji: "🍪", label: "Cookie Jar", action: "collect", reward: 25 },
    { id: "family_photo", x: 600, y: 200, emoji: "🖼️", label: "Family Portrait", action: "examine", dialog: "A warm photo of the whole family together. Buggagoogee is front and centre, of course! 🐕❤️" },
    { id: "puzzle_box", x: 380, y: 280, emoji: "🎁", label: "Mystery Gift Box", action: "open", reward: 80 },
  ],
  camp: [
    ...EDGE_PORTALS.camp,
    { id: "campfire_big", x: 380, y: 250, emoji: "🔥", label: "Roaring Campfire", action: "rest", dialog: "The big campfire crackles warmly. You toast marshmallows and feel adventurous! 🏕️" },
    { id: "log_seat", x: 260, y: 280, emoji: "🪵", label: "Wooden Log Seat", action: "rest", dialog: "You sit on the rough log. The forest sounds are peaceful... you hear an owl hoot nearby! 🦉" },
    { id: "fishing_rod", x: 150, y: 150, emoji: "🎣", label: "Fishing Rod", action: "examine", dialog: "A trusty old fishing rod leaning against a pine tree. There must be fish in the nearby stream!" },
    { id: "tent", x: 550, y: 180, emoji: "⛺", label: "Scout Tent", action: "examine", dialog: "A cozy tent with sleeping bags inside. Someone left a note: 'Dig under the big pine for treasure!' 🌲" },
    { id: "pine_treasure", x: 600, y: 320, emoji: "💎", label: "Buried Treasure", action: "collect", reward: 90 },
    { id: "raccoon_npc", x: 450, y: 350, emoji: "🦝", label: "Rocky the Raccoon", action: "talk", dialog: "Chitter chitter! I found shiny things in the stream! If you bring me 🍪 cookies, I'll share them!" },
    { id: "mushrooms", x: 200, y: 380, emoji: "🍄", label: "Glowing Mushrooms", action: "examine", dialog: "These mushrooms glow faintly blue in the dark. Ancient forest magic! You pocket one for luck. 🍄✨" },
    { id: "axe_stump", x: 650, y: 150, emoji: "🪓", label: "Chopping Stump", action: "examine", dialog: "A hefty axe stuck in a chopping stump. On the stump someone carved: 'Buggagoogee was here!' 🐕" },
    { id: "s'mores", x: 330, y: 380, emoji: "🍫", label: "S'mores Kit", action: "collect", reward: 30 },
  ],
  overworld: [
    ...EDGE_PORTALS.overworld,
    { id: "chest1", x: 200, y: 150, emoji: "📦", label: "Treasure Chest", action: "open", reward: 20 },
    { id: "npc_dog", x: 350, y: 200, emoji: "🐶", label: "Woof! (Rex)", action: "talk", dialog: "Woof woof! Welcome to Buggagoogee Village! Find the golden bone hidden near the big tree! 🦴" },
    { id: "shop", x: 400, y: 80, emoji: "🏪", label: "Item Shop", action: "shop" },
    { id: "minigame_treasure", x: 300, y: 300, emoji: "🗺️", label: "Treasure Hunt", action: "minigame", minigameId: "treasure_hunt" },
    { id: "tree1", x: 150, y: 250, emoji: "🌳", label: "Old Oak Tree", action: "examine", dialog: "A massive ancient tree. You spot some carved letters: B-U-G-G-A-G-O-O-G-E-E!" },
    { id: "golden_bone", x: 170, y: 270, emoji: "🦴", label: "Golden Bone!", action: "collect", reward: 100 },
    { id: "campfire", x: 500, y: 250, emoji: "🔥", label: "Campfire", action: "rest", dialog: "You rest by the fire. +10 energy! The warmth feels magical..." },
    { id: "quest_board", x: 250, y: 100, emoji: "📋", label: "Adventure Board", action: "adventures", dialog: "Pick your next adventure!" },
    { id: "block_coder", x: 600, y: 350, emoji: "💻", label: "Code Terminal", action: "minigame", minigameId: "block_coder" },
  ],
  space: [
    ...EDGE_PORTALS.space,
    { id: "asteroid1", x: 200, y: 150, emoji: "🪨", label: "Asteroid", action: "mine", reward: 30 },
    { id: "alien_npc", x: 450, y: 200, emoji: "👽", label: "Zorbax the Alien", action: "talk", dialog: "Greetings earthling! I crashed here. Help me find 3 space crystals and I'll reward you greatly! 💎" },
    { id: "crystal1", x: 150, y: 300, emoji: "💎", label: "Space Crystal", action: "collect", reward: 40 },
    { id: "crystal2", x: 550, y: 150, emoji: "💎", label: "Space Crystal", action: "collect", reward: 40 },
    { id: "crystal3", x: 350, y: 380, emoji: "💎", label: "Space Crystal", action: "collect", reward: 40 },
    { id: "rocket", x: 600, y: 320, emoji: "🚀", label: "Broken Rocket", action: "examine", dialog: "This rocket needs fuel crystals to fly! Maybe the alien knows more..." },
    { id: "minigame_meteor", x: 300, y: 120, emoji: "☄️", label: "Meteor Zone!", action: "minigame", minigameId: "meteor_dodge" },
    { id: "planet_view", x: 100, y: 100, emoji: "🪐", label: "Saturn View", action: "examine", dialog: "Wow! Saturn's rings shimmer with a million colours. You could stare at this forever..." },
    { id: "constellation_connect", x: 400, y: 350, emoji: "⭐", label: "Constellation Connect", action: "minigame", minigameId: "constellation_connect" },
  ],
  jungle: [
    ...EDGE_PORTALS.jungle,
    { id: "ruin1", x: 300, y: 150, emoji: "🏛️", label: "Ancient Ruin", action: "examine", dialog: "The stones are covered in strange symbols. They seem to spell out... a riddle!" },
    { id: "monkey_npc", x: 500, y: 200, emoji: "🐒", label: "Miko the Monkey", action: "talk", dialog: "OOH OOH! I hid my bananas everywhere! Help me find them and I'll show you a secret passage! 🍌" },
    { id: "banana1", x: 150, y: 250, emoji: "🍌", label: "Bananas!", action: "collect", reward: 15 },
    { id: "banana2", x: 600, y: 150, emoji: "🍌", label: "Bananas!", action: "collect", reward: 15 },
    { id: "banana3", x: 350, y: 380, emoji: "🍌", label: "Bananas!", action: "collect", reward: 15 },
    { id: "secret_door", x: 680, y: 350, emoji: "🚪", label: "Secret Door", action: "examine", dialog: "This door is sealed tight... You need the monkey's permission to open it!" },
    { id: "minigame_vine", x: 250, y: 100, emoji: "🌿", label: "Vine Course", action: "minigame", minigameId: "vine_swing" },
    { id: "waterfall", x: 100, y: 200, emoji: "💧", label: "Hidden Waterfall", action: "examine", dialog: "A beautiful waterfall! The mist feels refreshing. You find a small gem inside the cave behind it!" },
    { id: "gem_waterfall", x: 120, y: 220, emoji: "💎", label: "Hidden Gem", action: "collect", reward: 60 },
    { id: "glyph_decoder", x: 450, y: 350, emoji: "📜", label: "Glyph Stones", action: "minigame", minigameId: "glyph_decoder" },
  ],
  ocean: [
    ...EDGE_PORTALS.ocean,
    { id: "fish_npc", x: 350, y: 200, emoji: "🐡", label: "Bubbles the Fish", action: "talk", dialog: "Blub blub! A sunken ship is nearby! Rumour says it holds the legendary Pearl of Buggagoogee! 🦪" },
    { id: "sunken_ship", x: 600, y: 280, emoji: "⚓", label: "Sunken Ship", action: "examine", dialog: "An old pirate ship! You find a soggy map... it leads to an underwater cave!" },
    { id: "coral", x: 200, y: 150, emoji: "🪸", label: "Rainbow Coral", action: "examine", dialog: "The coral glows with incredible colours! Touching it gives you a warm feeling of adventure." },
    { id: "treasure_chest", x: 450, y: 380, emoji: "💰", label: "Pirate Treasure", action: "open", reward: 120 },
    { id: "pearl", x: 520, y: 150, emoji: "🦪", label: "Pearl of Buggagoogee", action: "collect", reward: 200 },
    { id: "minigame_fish", x: 200, y: 350, emoji: "🐠", label: "Fish Frenzy!", action: "minigame", minigameId: "fish_frenzy" },
    { id: "whale", x: 100, y: 250, emoji: "🐋", label: "Friendly Whale", action: "talk", dialog: "HOOOOO! I am Wavegulp, ancient whale! Ride on my back to the secret ocean cave? HOOOO!" },
    { id: "reef_rebuild", x: 300, y: 220, emoji: "🪸", label: "Reef Rebuild", action: "minigame", minigameId: "reef_rebuild" },
  ],
};

function generateHome()     { return { width: 760, height: 500, color: "#3d2a1a" }; }
function generateCamp()     { return { width: 760, height: 500, color: "#1a0f06" }; }
function generateOverworld() { return { width: 760, height: 500, color: "#2d5a2d" }; }
function generateSpace() { return { width: 760, height: 500, color: "#050520" }; }
function generateJungle() { return { width: 760, height: 500, color: "#1a3d1a" }; }
function generateOcean() { return { width: 760, height: 500, color: "#0a2a4a" }; }