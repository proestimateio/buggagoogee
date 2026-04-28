// LocalStorage-backed mock of the Base44 SDK shape used across the app.
// Activates automatically when no VITE_BASE44_APP_ID is configured so the game
// is fully playable offline / locally without a backend.

const SAVES_KEY = "buggagoogee_saves_v1";
const CHAT_KEY  = "buggagoogee_chat_v1";
const LAST_SEEN_KEY = "buggagoogee_last_seen_v1";

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function uid() {
  return "loc_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function matches(entity, query) {
  if (!query) return true;
  return Object.entries(query).every(([k, v]) => entity[k] === v);
}

const subscribers = { GameSave: new Set(), ChatMessage: new Set() };
function notify(kind, type, data) {
  for (const cb of subscribers[kind]) {
    try { cb({ type, data }); } catch {}
  }
}

function makeEntity(kind, storageKey) {
  return {
    async create(payload) {
      const all = read(storageKey, []);
      const item = { id: uid(), ...payload, _created: Date.now(), _updated: Date.now() };
      all.push(item);
      write(storageKey, all);
      notify(kind, "created", item);
      return item;
    },
    async update(id, patch) {
      const all = read(storageKey, []);
      const idx = all.findIndex(e => e.id === id);
      if (idx === -1) throw new Error("Not found: " + id);
      all[idx] = { ...all[idx], ...patch, _updated: Date.now() };
      write(storageKey, all);
      notify(kind, "updated", all[idx]);
      return all[idx];
    },
    async delete(id) {
      const all = read(storageKey, []).filter(e => e.id !== id);
      write(storageKey, all);
      notify(kind, "deleted", { id });
      return { success: true };
    },
    async filter(query, sort, limit) {
      let all = read(storageKey, []).filter(e => matches(e, query));
      if (sort) {
        const desc = sort.startsWith("-");
        const key = desc ? sort.slice(1) : sort;
        all = all.sort((a, b) => {
          const av = a[key] ?? 0, bv = b[key] ?? 0;
          if (av < bv) return desc ? 1 : -1;
          if (av > bv) return desc ? -1 : 1;
          return 0;
        });
      }
      if (limit) all = all.slice(0, limit);
      return all;
    },
    async list(sort, limit) {
      return this.filter(undefined, sort, limit);
    },
    async get(id) {
      const all = read(storageKey, []);
      return all.find(e => e.id === id) || null;
    },
    subscribe(callback) {
      subscribers[kind].add(callback);
      return () => subscribers[kind].delete(callback);
    },
  };
}

// Cross-tab broadcast so multiple browser tabs see each other's saves & chat
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === SAVES_KEY) notify("GameSave", "remote", null);
    if (e.key === CHAT_KEY) notify("ChatMessage", "remote", null);
  });
}

export const localStore = {
  entities: {
    GameSave: makeEntity("GameSave", SAVES_KEY),
    ChatMessage: makeEntity("ChatMessage", CHAT_KEY),
  },
  auth: {
    async me() { return { id: "local-user", username: "Local Player" }; },
    async logout() { /* no-op */ },
    redirectToLogin() { /* no-op */ },
  },
  // Used by the lazy real-client guard
  __isLocal: true,
};

export function pruneStaleSaves(maxAgeMs = 5 * 60 * 1000) {
  // Mark saves as offline if no heartbeat in `maxAgeMs`. Used so multi-tab "online" is honest.
  const all = read(SAVES_KEY, []);
  const now = Date.now();
  let changed = false;
  for (const s of all) {
    if (s.online && (now - (s._updated || 0) > maxAgeMs)) {
      s.online = false;
      changed = true;
    }
  }
  if (changed) write(SAVES_KEY, all);
}

export { SAVES_KEY, CHAT_KEY, LAST_SEEN_KEY };
