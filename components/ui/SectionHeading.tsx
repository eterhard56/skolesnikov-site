"use client";

import { cn } from "@/lib/utils/cn";
import { ScrollReveal } from "./ScrollReveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <ScrollReveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.18em] mb-5 md:mb-6",
            light
              ? "bg-white/10 text-white/65 border border-white/10"
              : "bg-studio-accent/[0.06] text-studio-accent/90 border border-studio-accent/15"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              light ? "bg-studio-glow" : "bg-studio-accent"
            )}
          />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-display text-display-lg tracking-tight",
          light ? "text-white" : "text-studio-charcoal"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 md:mt-5 text-base md:text-lg leading-[1.7] font-light max-w-2xl",
            light ? "text-white/55" : "text-neutral-500"
          )}
        >
          {description}
        </p>
      )}
    </ScrollReveal>
  );
}
