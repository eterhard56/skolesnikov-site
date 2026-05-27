"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { type ReactNode, useRef } from "react";
import { springSmooth } from "@/lib/motion/presets";
import { cn } from "@/lib/utils/cn";

type Floating3DProps = {
  children: ReactNode;
  className?: string;
  /** Max translate in px — keep low for premium subtlety */
  intensity?: number;
};

/** Subtle 2D parallax (translate only — GPU-friendly, no 3D rotate). */
export function Floating3D({
  children,
  className,
  intensity = 3,
}: Floating3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const max = prefersReducedMotion ? 0 : intensity;

  const x = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), springSmooth);
  const y = useSpring(useTransform(py, [-0.5, 0.5], [-max, max]), springSmooth);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || prefersReducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={cn("motion-gpu", className)}
    >
      {children}
    </motion.div>
  );
}
