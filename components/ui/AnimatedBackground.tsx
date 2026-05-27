"use client";

import { useReducedMotion } from "framer-motion";

/** Static mesh — no pointer tracking (avoids spring + re-render cost). */
export function AnimatedBackground({ dark = false }: { dark?: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none motion-gpu"
      aria-hidden
    >
      <div
        className={
          dark
            ? "absolute inset-0 bg-mesh-dark"
            : "absolute inset-0 bg-mesh-light"
        }
      />

      {!prefersReducedMotion && (
        <>
          <div
            className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full opacity-30 motion-gpu"
            style={{
              background:
                "radial-gradient(circle, rgba(124,108,255,0.1) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-[30%] -left-[15%] w-[70%] h-[70%] rounded-full opacity-25 motion-gpu"
            style={{
              background:
                "radial-gradient(circle, rgba(94,234,212,0.06) 0%, transparent 70%)",
            }}
          />
        </>
      )}

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: dark
            ? `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.25) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,0,0,0.25) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />
    </div>
  );
}
