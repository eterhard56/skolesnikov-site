"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
  float?: boolean;
};

export function GlassCard({
  children,
  className,
  dark = false,
  hover = true,
  float = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden motion-gpu",
        dark ? "glass-dark" : "glass",
        float && "shadow-float",
        hover &&
          !float &&
          "shadow-glass hover:shadow-glass-lg transition-shadow duration-400",
        hover && "motion-hover-lift",
        className
      )}
    >
      <div className="absolute inset-0 noise-overlay rounded-3xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
