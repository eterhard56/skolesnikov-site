"use client";

import { useEffect, useRef } from "react";
import { useMotionValue } from "framer-motion";

/**
 * Normalized pointer position (-1…1) via motion values — no React re-renders per move.
 */
export function useMousePosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rafId = useRef<number | null>(null);
  const pending = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const flush = () => {
      rafId.current = null;
      x.set(pending.current.x);
      y.set(pending.current.y);
    };

    const handleMove = (e: MouseEvent) => {
      pending.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(flush);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [x, y]);

  return { x, y };
}
