"use client";

import { useLenis } from "lenis/react";
import { useCallback } from "react";
import { NAV_SCROLL_OFFSET } from "@/lib/motion/presets";

type ScrollTarget = string | number | HTMLElement;

export function useSmoothScroll() {
  const lenis = useLenis();

  const scrollTo = useCallback(
    (
      target: ScrollTarget,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
      }
    ) => {
      const offset = options?.offset ?? NAV_SCROLL_OFFSET;

      if (!lenis) {
        if (typeof target === "string" && target.startsWith("#")) {
          const el = document.querySelector(target);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      lenis.scrollTo(target, {
        offset,
        duration: options?.duration,
        immediate: options?.immediate,
      });
    },
    [lenis]
  );

  const scrollToTop = useCallback(
    (options?: { duration?: number }) => {
      scrollTo(0, { offset: 0, ...options });
    },
    [scrollTo]
  );

  return { lenis, scrollTo, scrollToTop };
}
