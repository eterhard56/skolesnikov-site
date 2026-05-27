"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { SmoothLink } from "./SmoothLink";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline-light";
  className?: string;
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary:
    "bg-studio-charcoal text-white shadow-premium hover:shadow-float border border-white/10",
  secondary:
    "glass text-studio-charcoal shadow-glass hover:shadow-glass-lg border-white/60",
  ghost:
    "bg-transparent text-studio-charcoal hover:bg-black/5",
  "outline-light":
    "bg-transparent text-white border border-white/25 hover:bg-white/10 hover:border-white/40",
};

const sizes = {
  sm: "px-5 py-2.5 text-sm rounded-xl",
  md: "px-7 py-3.5 text-[15px] rounded-2xl",
  lg: "px-9 py-4 text-base rounded-2xl",
};

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  size = "md",
}: MagneticButtonProps) {
  const classes = cn(
    "relative inline-flex items-center justify-center gap-2 font-medium tracking-tight overflow-hidden group motion-btn motion-gpu",
    variants[variant],
    sizes[size],
    className
  );

  const inner = (
    <>
      {variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-r from-studio-accent/0 via-studio-accent/12 to-studio-glow/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  if (href) {
    return (
      <SmoothLink href={href} className={classes}>
        {inner}
      </SmoothLink>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}
