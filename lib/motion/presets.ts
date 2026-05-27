import type { Transition, Variants } from "framer-motion";

/** Linear / Apple-style deceleration — no overshoot */
export const easePremium = [0.25, 0.1, 0.25, 1] as const;

/** Slightly longer ease for hero typography */
export const easeCinematic = [0.22, 0.03, 0.26, 1] as const;

/** Soft spring — high damping, no bounce */
export const springSmooth = {
  type: "spring" as const,
  stiffness: 140,
  damping: 28,
  mass: 0.65,
};

export const springNav = {
  type: "spring" as const,
  stiffness: 260,
  damping: 32,
  mass: 0.75,
};

/** @deprecated Use springSmooth */
export const springSnappy = springNav;

/** @deprecated Use springSmooth */
export const springSoft = springSmooth;

/** @deprecated Prefer CSS hover — kept for rare use */
export const springMagnetic = {
  type: "spring" as const,
  stiffness: 180,
  damping: 26,
  mass: 0.7,
};

export const transitionReveal: Transition = {
  duration: 0.5,
  ease: easePremium,
};

export const transitionSubtle: Transition = {
  duration: 0.4,
  ease: easePremium,
};

export const transitionCinematic: Transition = {
  duration: 0.65,
  ease: easeCinematic,
};

export const transitionFast: Transition = {
  duration: 0.28,
  ease: easePremium,
};

export const viewportReveal = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -6% 0px",
} as const;

export const revealDistance = {
  y: 10,
  x: 8,
} as const;

/** Opacity + transform only — GPU-friendly */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: revealDistance.y,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionReveal,
  },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitionSubtle,
  },
};

export const heroContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.06,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionCinematic,
  },
};

export const LENIS_OPTIONS = {
  autoRaf: false,
  lerp: 0.085,
  duration: 1.05,
  smoothWheel: true,
  wheelMultiplier: 0.92,
  touchMultiplier: 1,
  infinite: false,
  syncTouch: true,
} as const;

export const NAV_SCROLL_OFFSET = -88;

/** Shared class names — pair with globals.css */
export const motionClass = {
  gpu: "motion-gpu",
  float: "motion-float",
  hoverLift: "motion-hover-lift",
  btn: "motion-btn",
  fadeIn: "motion-fade-in",
} as const;
