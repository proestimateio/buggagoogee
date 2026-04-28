import React, { useRef, useState } from "react";

export default function FPSMobileControls({ onMove, onTurn }) {
  const joyRef = useRef(null);
  const [joyPos, setJoyPos] = useState({ x: 0, y: 0 });
  const activeRef = useRef(null);

  const handlePointerDown = (e) => {
    activeRef.current = e.pointerId;
    joyRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (activeRef.current !== e.pointerId) return;
    const rect = joyRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-40, Math.min(40, e.clientX - cx));
    const dy = Math.max(-40, Math.min(40, e.clientY - cy));
    setJoyPos({ x: dx, y: dy });
    onMove({ forward: -dy / 40, strafe: dx / 40 });
  };

  const handlePointerUp = () => {
    activeRef.current = null;
    setJoyPos({ x: 0, y: 0 });
    onMove({ forward: 0, strafe: 0 });
  };

  return (
    <div className="md:hidden absolute bottom-4 inset-x-0 flex justify-between px-6 items-end pointer-events-none z-30">
      {/* Left joystick — move */}
      <div className="pointer-events-auto">
        <div
          ref={joyRef}
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: 90, height: 90,
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(255,255,255,0.2)",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 36, height: 36,
              background: "rgba(168,85,247,0.6)",
              border: "2px solid rgba(168,85,247,0.9)",
              transform: `translate(${joyPos.x}px, ${joyPos.y}px)`,
              transition: joyPos.x === 0 ? "transform 0.1s" : "none",
              boxShadow: "0 0 12px rgba(168,85,247,0.5)",
            }}
          />
        </div>
        <p className="text-center text-white/30 text-xs mt-1">MOVE</p>
      </div>

      {/* Right: turn buttons */}
      <div className="pointer-events-auto flex gap-3 items-center">
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-black select-none active:scale-90"
          style={{ background: "rgba(34,211,238,0.15)", border: "2px solid rgba(34,211,238,0.3)", touchAction: "none" }}
          onPointerDown={() => onTurn(-1)} onPointerUp={() => onTurn(0)} onPointerLeave={() => onTurn(0)}
        >←</button>
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-black select-none active:scale-90"
          style={{ background: "rgba(34,211,238,0.15)", border: "2px solid rgba(34,211,238,0.3)", touchAction: "none" }}
          onPointerDown={() => onTurn(1)} onPointerUp={() => onTurn(0)} onPointerLeave={() => onTurn(0)}
        >→</button>
      </div>
    </div>
  );
}