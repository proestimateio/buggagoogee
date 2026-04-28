import React, { useEffect, useRef } from "react";

const CONFIGS = {
  home:      { dust: 30 },
  camp:      { fireflies: 15, ffHue: 50 },
  overworld: { petals: 20 },
  space:     { stars: 80, shooting: true },
  jungle:    { fireflies: 25, ffHue: 110, leaves: 10 },
  ocean:     { bubbles: 50 },
};

function rand(a, b) { return a + Math.random() * (b - a); }

function makeParticles(world, w, h) {
  const cfg = CONFIGS[world] || CONFIGS.home;
  const out = [];
  if (cfg.dust) {
    for (let i = 0; i < cfg.dust; i++) {
      out.push({ kind: "dust", x: rand(0, w), y: rand(0, h),
        vx: rand(-0.05, 0.05), vy: rand(-0.04, -0.01),
        r: rand(0.8, 2.2), hue: rand(35, 55), a: rand(0.15, 0.45), ph: rand(0, Math.PI*2) });
    }
  }
  if (cfg.fireflies) {
    for (let i = 0; i < cfg.fireflies; i++) {
      out.push({ kind: "firefly", x: rand(0, w), y: rand(0, h),
        vx: rand(-0.2, 0.2), vy: rand(-0.15, 0.15),
        r: rand(1.5, 2.8), hue: cfg.ffHue, ph: rand(0, Math.PI*2), spd: rand(1.5, 3) });
    }
  }
  if (cfg.petals) {
    for (let i = 0; i < cfg.petals; i++) {
      out.push({ kind: "petal", x: rand(0, w), y: rand(0, h),
        vx: rand(-0.3, 0.3), vy: rand(0.2, 0.6),
        r: rand(3, 6), hue: rand(320, 360), rot: rand(0, Math.PI*2), vr: rand(-0.02, 0.02) });
    }
  }
  if (cfg.stars) {
    for (let i = 0; i < cfg.stars; i++) {
      out.push({ kind: "star", x: rand(0, w), y: rand(0, h),
        r: rand(0.5, 1.8), hue: rand(180, 240), ph: rand(0, Math.PI*2), spd: rand(0.5, 2) });
    }
  }
  if (cfg.leaves) {
    for (let i = 0; i < cfg.leaves; i++) {
      out.push({ kind: "leaf", x: rand(0, w), y: rand(0, h),
        vx: rand(-0.4, 0.4), vy: rand(0.3, 0.8),
        r: rand(4, 7), hue: rand(80, 130), rot: rand(0, Math.PI*2), vr: rand(-0.03, 0.03) });
    }
  }
  if (cfg.bubbles) {
    for (let i = 0; i < cfg.bubbles; i++) {
      out.push({ kind: "bubble", x: rand(0, w), y: rand(0, h),
        vx: rand(-0.1, 0.1), vy: rand(-0.6, -0.2),
        r: rand(2, 7), hue: rand(180, 210), a: rand(0.2, 0.5), ph: rand(0, Math.PI*2) });
    }
  }
  return out;
}

export default function Particles({ world = "home" }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], shoot: null, t: 0, w: 0, h: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    function resize() {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.w = w;
      state.h = h;
      state.particles = makeParticles(world, w, h);
      state.shoot = null;
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("resize", resize);

    const cfg = CONFIGS[world] || CONFIGS.home;

    function frame() {
      state.t += 1 / 60;
      const { w, h } = state;
      ctx.clearRect(0, 0, w, h);

      for (const p of state.particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.kind === "dust") {
          p.ph += 0.02;
          const alpha = p.a + Math.sin(p.ph) * 0.1;
          ctx.fillStyle = `hsla(${p.hue}, 60%, 85%, ${alpha})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
          if (p.y < -5) p.y = h + 5;
          if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
        } else if (p.kind === "firefly") {
          p.ph += 0.05 * p.spd;
          const pulse = (Math.sin(p.ph) + 1) * 0.5;
          ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${0.25 + pulse*0.6})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r + pulse*1.5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${pulse*0.9})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r*0.5, 0, Math.PI*2); ctx.fill();
          if (Math.random() < 0.02) { p.vx += rand(-0.1, 0.1); p.vy += rand(-0.1, 0.1); }
          p.vx = Math.max(-0.4, Math.min(0.4, p.vx));
          p.vy = Math.max(-0.3, Math.min(0.3, p.vy));
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        } else if (p.kind === "petal" || p.kind === "leaf") {
          p.rot += p.vr;
          p.vx += Math.sin(state.t + p.rot) * 0.01;
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.75)`;
          ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r*0.55, 0, 0, Math.PI*2); ctx.fill();
          ctx.restore();
          if (p.y > h + 10) { p.y = -10; p.x = rand(0, w); }
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        } else if (p.kind === "star") {
          p.ph += 0.03 * p.spd;
          const tw = (Math.sin(p.ph) + 1) * 0.5;
          ctx.fillStyle = `hsla(${p.hue}, 50%, 95%, ${0.3 + tw*0.7})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
        } else if (p.kind === "bubble") {
          p.ph += 0.04;
          p.x += Math.sin(p.ph) * 0.3;
          ctx.strokeStyle = `hsla(${p.hue}, 80%, 85%, ${p.a})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.stroke();
          ctx.fillStyle = `hsla(${p.hue}, 80%, 95%, ${p.a*0.4})`;
          ctx.beginPath(); ctx.arc(p.x - p.r*0.3, p.y - p.r*0.3, p.r*0.3, 0, Math.PI*2); ctx.fill();
          if (p.y < -10) { p.y = h + 10; p.x = rand(0, w); }
        }
      }

      if (cfg.shooting) {
        if (!state.shoot && Math.random() < 0.004) {
          state.shoot = { x: rand(0, state.w), y: rand(0, state.h*0.4),
            vx: rand(4, 7), vy: rand(2, 4), life: 1 };
        }
        if (state.shoot) {
          const s = state.shoot;
          ctx.strokeStyle = `hsla(200, 100%, 90%, ${s.life})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx*8, s.y - s.vy*8); ctx.stroke();
          s.x += s.vx; s.y += s.vy; s.life -= 0.015;
          if (s.life <= 0 || s.x > state.w + 50 || s.y > state.h + 50) state.shoot = null;
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [world]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ pointerEvents: "none", width: "100%", height: "100%" }}
    />
  );
}
