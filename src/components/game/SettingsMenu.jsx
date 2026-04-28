import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Monitor, Zap } from "lucide-react";

export default function SettingsMenu({ open, onClose, settings, onChange }) {
  if (!open) return null;

  const toggle = (key) => onChange({ ...settings, [key]: !settings[key] });
  const setVolume = (v) => onChange({ ...settings, musicVolume: v });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card rounded-3xl p-6 border border-purple-500/30 w-full max-w-sm"
          style={{ boxShadow: "0 0 30px rgba(168,85,247,0.2)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-orbitron font-black text-xl text-white flex items-center gap-2">
              ⚙️ Settings
            </h3>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-white/50 hover:text-white transition-colors" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Music Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 font-bold text-sm flex items-center gap-2">
                  {settings.musicVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  Music Volume
                </label>
                <span className="font-orbitron text-purple-300 text-sm font-black">
                  {settings.musicVolume === 0 ? "OFF" : `${settings.musicVolume}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={settings.musicVolume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-full accent-purple-500"
                style={{ cursor: "pointer" }}
              />
              <div className="flex justify-between text-white/20 text-xs mt-1">
                <span>Off</span>
                <span>Max</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* CRT Scanlines */}
            <ToggleRow
              icon={<Monitor className="w-4 h-4" />}
              label="CRT Scanlines"
              description="Retro screen lines overlay"
              value={settings.scanlines}
              onToggle={() => toggle("scanlines")}
            />

            {/* Pixel Grid */}
            <ToggleRow
              icon={<span className="text-sm">▦</span>}
              label="Pixel Grid"
              description="Low-res pixel art look"
              value={settings.pixelGrid}
              onToggle={() => toggle("pixelGrid")}
            />

            {/* Vignette */}
            <ToggleRow
              icon={<span className="text-sm">◉</span>}
              label="Vignette"
              description="Dark edge darkening effect"
              value={settings.vignette}
              onToggle={() => toggle("vignette")}
            />

            {/* Neon Border */}
            <ToggleRow
              icon={<Zap className="w-4 h-4" />}
              label="Neon Border Glow"
              description="Animated accent border"
              value={settings.neonBorder}
              onToggle={() => toggle("neonBorder")}
            />
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-2xl font-black text-white transition-all"
            style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 15px rgba(168,85,247,0.4)" }}
          >
            Save & Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ToggleRow({ icon, label, description, value, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-white/50 shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="text-white font-bold text-sm">{label}</div>
          <div className="text-white/40 text-xs truncate">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className="shrink-0 w-12 h-6 rounded-full relative transition-all duration-200"
        style={{ background: value ? "#a855f7" : "rgba(255,255,255,0.1)", boxShadow: value ? "0 0 10px rgba(168,85,247,0.5)" : "none" }}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
          style={{ left: value ? "calc(100% - 20px)" : "4px" }}
        />
      </button>
    </div>
  );
}