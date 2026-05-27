"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { frame, useReducedMotion } from "framer-motion";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { LENIS_OPTIONS } from "@/lib/motion/presets";

type SmoothScrollContextValue = {
  enabled: boolean;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  enabled: true,
});

function LenisFrameSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    function onFrame({ timestamp }: { timestamp: number }) {
      lenis.raf(timestamp);
    }

    frame.update(onFrame, true);
    return () => {
      frame.update(onFrame, false);
    };
  }, [lenis]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  const options = useMemo(
    () =>
      prefersReducedMotion
        ? { ...LENIS_OPTIONS, lerp: 1, duration: 0 }
        : LENIS_OPTIONS,
    [prefersReducedMotion]
  );

  if (prefersReducedMotion) {
    return (
      <SmoothScrollContext.Provider value={{ enabled: false }}>
        {children}
      </SmoothScrollContext.Provider>
    );
  }

  return (
    <SmoothScrollContext.Provider value={{ enabled: true }}>
      <ReactLenis root options={options}>
        <LenisFrameSync />
        {children}
      </ReactLenis>
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScrollContext() {
  return useContext(SmoothScrollContext);
}
