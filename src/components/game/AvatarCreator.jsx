import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Shuffle, Check } from "lucide-react";
import { AVATAR_OPTIONS, DEFAULT_APPEARANCE, PRESET_LOOKS } from "@/lib/gameData";
import { buildAvatar, animateAvatar, disposeAvatar } from "./Avatar3D";

const STEPS = [
  { key: "skinTone",    label: "Skin Tone",  field: "skinTones",    type: "color" },
  { key: "hair",        label: "Hair Style", field: "hairStyles",   type: "string" },
  { key: "hairColor",   label: "Hair Color", field: "hairColors",   type: "color" },
  { key: "top",         label: "Top",        field: "tops",         type: "string" },
  { key: "topColor",    label: "Top Color",  field: "topColors",    type: "color" },
  { key: "bottom",      label: "Bottom",     field: "bottoms",      type: "string" },
  { key: "bottomColor", label: "Bottom Color", field: "bottomColors", type: "color" },
  { key: "shoes",       label: "Shoes",      field: "shoes",        type: "string" },
  { key: "shoesColor",  label: "Shoes Color", field: "shoesColors", type: "color" },
  { key: "accessory",   label: "Accessory",  field: "accessories",  type: "string" },
];

function PreviewCanvas({ appearance }) {
  const ref = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;

    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0a1f");

    // Soft floor circle
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2, 32),
      new THREE.MeshBasicMaterial({ color: "#1e1b3a" })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 1.95, 64),
      new THREE.MeshBasicMaterial({ color: "#a855f7", side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.7, 4);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    wrap.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(3, 5, 4);
    dl.castShadow = true;
    scene.add(dl);
    const fillBack = new THREE.DirectionalLight(0xa855f7, 0.4);
    fillBack.position.set(-3, 3, -3);
    scene.add(fillBack);

    let avatar = buildAvatar(appearance);
    scene.add(avatar);
    stateRef.current = { scene, camera, renderer, avatar, ring };

    let frame = 0;
    let raf;
    let rotating = true;
    const onPointerDown = () => { rotating = false; };
    const onPointerUp   = () => { rotating = true; };
    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointerup",   onPointerUp);
    wrap.addEventListener("pointercancel", onPointerUp);

    const start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / 1000;
      if (rotating) avatar.rotation.y += 0.005;
      animateAvatar(avatar, t, false);
      ring.material.opacity = 0.5 + Math.sin(t * 2) * 0.3;
      ring.material.transparent = true;
      renderer.render(scene, camera);
      frame++;
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const ww = wrap.clientWidth;
      const hh = wrap.clientHeight;
      renderer.setSize(ww, hh);
      camera.aspect = ww / hh;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointerup",   onPointerUp);
      wrap.removeEventListener("pointercancel", onPointerUp);
      disposeAvatar(avatar);
      ring.geometry.dispose(); ring.material.dispose();
      floor.geometry.dispose(); floor.material.dispose();
      renderer.dispose();
      wrap.removeChild(renderer.domElement);
    };
  }, []); // mount once

  // Rebuild avatar whenever appearance changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.scene) return;
    if (s.avatar) {
      s.scene.remove(s.avatar);
      disposeAvatar(s.avatar);
    }
    const next = buildAvatar(appearance);
    s.scene.add(next);
    s.avatar = next;
  }, [JSON.stringify(appearance)]);

  return <div ref={ref} className="w-full h-full" />;
}

export default function AvatarCreator({ initialAppearance, characterId, onConfirm, onBack }) {
  const [appearance, setAppearance] = useState({
    ...DEFAULT_APPEARANCE,
    ...(PRESET_LOOKS[characterId] || {}),
    ...(initialAppearance || {}),
  });
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const options = AVATAR_OPTIONS[step.field] || [];
  const current = appearance[step.key];

  function pick(value) {
    setAppearance(a => ({ ...a, [step.key]: value }));
  }

  function shuffle() {
    const next = { ...appearance };
    for (const s of STEPS) {
      const opts = AVATAR_OPTIONS[s.field];
      next[s.key] = opts[Math.floor(Math.random() * opts.length)];
    }
    setAppearance(next);
  }

  function applyPreset(id) {
    setAppearance(a => ({ ...a, ...(PRESET_LOOKS[id] || {}) }));
  }

  return (
    <motion.div
      key="avatar-creator"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-3xl"
    >
      <div className="text-center mb-3">
        <h2 className="font-orbitron font-black text-3xl text-white mb-1">Build Your Avatar</h2>
        <p className="text-white/50 text-sm">Mix and match — Roxy can't wait to meet you!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 3D preview */}
        <div className="glass-card rounded-3xl border border-purple-500/30 overflow-hidden h-[420px] relative">
          <PreviewCanvas appearance={appearance} />
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            <span className="text-[11px] font-orbitron tracking-wider text-purple-300/70 uppercase">Preview</span>
            <button onClick={shuffle}
              className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors flex items-center gap-1">
              <Shuffle className="w-3 h-3" /> Shuffle
            </button>
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
            {Object.keys(PRESET_LOOKS).map(id => (
              <button key={id} onClick={() => applyPreset(id)}
                className="text-[10px] px-2 py-1 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all">
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Step picker */}
        <div className="glass-card rounded-3xl p-5 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setStepIdx(i => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center flex-1">
              <div className="text-[10px] font-orbitron text-purple-400 tracking-widest">STEP {stepIdx + 1} / {STEPS.length}</div>
              <div className="text-white font-black text-lg">{step.label}</div>
            </div>
            <button onClick={() => setStepIdx(i => Math.min(STEPS.length - 1, i + 1))}
              disabled={stepIdx === STEPS.length - 1}
              className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className={`grid gap-2 flex-1 ${step.type === "color" ? "grid-cols-5" : "grid-cols-3"}`}>
            {options.map(opt => {
              const selected = current === opt;
              if (step.type === "color") {
                return (
                  <button key={opt} onClick={() => pick(opt)}
                    className={`aspect-square rounded-2xl border-2 transition-all ${selected ? 'border-white scale-105' : 'border-white/10 hover:border-white/40'}`}
                    style={{ background: opt, boxShadow: selected ? `0 0 16px ${opt}` : undefined }}
                    aria-label={opt} />
                );
              }
              return (
                <button key={opt} onClick={() => pick(opt)}
                  className={`p-3 rounded-2xl border-2 text-center font-bold transition-all capitalize ${selected ? 'border-purple-400 bg-purple-500/20 text-white' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'}`}>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1 justify-center mt-4">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStepIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === stepIdx ? 'w-6 bg-purple-400' : 'w-1.5 bg-white/20'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-bold text-white/60 glass-card border border-white/10 hover:text-white">
          ← Back
        </button>
        {stepIdx < STEPS.length - 1 ? (
          <button onClick={() => setStepIdx(i => i + 1)}
            className="flex-[2] py-4 rounded-2xl font-black text-xl text-white"
            style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}>
            Next →
          </button>
        ) : (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onConfirm(appearance)}
            className="flex-[2] py-4 rounded-2xl font-black text-xl text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #4ade80, #22d3ee)", boxShadow: "0 0 30px rgba(34,211,238,0.5)" }}>
            <Check className="w-6 h-6" /> Enter the World!
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
