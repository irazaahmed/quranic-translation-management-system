"use client";

import { useRef, type ReactNode } from "react";

interface TiltProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees on each axis. */
  max?: number;
  /** Scale applied while hovering. */
  scale?: number;
  /** Show the moving light glare overlay. */
  glare?: boolean;
}

/**
 * Wraps content in a mouse-following 3D tilt. The card leans toward the
 * cursor with a soft light glare. Pointer/touch and reduced-motion safe:
 * coarse (touch) pointers are ignored, and the CSS resets the transform
 * under `prefers-reduced-motion`.
 */
export default function Tilt({
  children,
  className = "",
  max = 9,
  scale = 1.02,
  glare = true,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return; // no tilt on touch drags
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1 across
    const py = (e.clientY - r.top) / r.height; // 0..1 down
    const ry = (px - 0.5) * 2 * max; // rotateY: left/right
    const rx = -(py - 0.5) * 2 * max; // rotateX: up/down
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--tilt-scale", `${scale}`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--tilt-scale", "1");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`tilt-3d ${className}`}
    >
      <div className="tilt-3d-inner">
        {children}
        {glare && <span className="tilt-3d-glare" aria-hidden="true" />}
      </div>
    </div>
  );
}
