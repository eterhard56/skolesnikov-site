"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Floating3D } from "@/components/ui/Floating3D";
import { cn } from "@/lib/utils/cn";

const HERO_MOCKUP = "/images/hero/1.png";

export function HeroDeviceMockup({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Floating3D intensity={2.5} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative mx-auto w-full max-w-[560px] lg:max-w-none motion-fade-in motion-gpu",
          !prefersReducedMotion && "motion-float"
        )}
      >
        <div
          className="absolute left-1/2 top-[72%] -translate-x-1/2 w-[70%] h-[14%] rounded-[50%] bg-studio-charcoal/[0.07] blur-xl pointer-events-none motion-gpu"
          aria-hidden
        />

        <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-float border border-white/50 bg-transparent motion-gpu">
          <Image
            src={HERO_MOCKUP}
            alt="Макет сайта на MacBook и iPhone"
            width={1200}
            height={900}
            priority
            sizes="(max-width: 1024px) 92vw, 560px"
            className="w-full h-auto object-contain"
          />
        </div>

        {!prefersReducedMotion && (
          <div className="absolute -left-2 sm:-left-4 top-[14%] glass rounded-2xl px-4 py-3 shadow-glass border-white/60 z-10 motion-gpu">
            <p className="text-xs text-neutral-500">PageSpeed</p>
            <p className="text-xl font-display font-semibold text-studio-accent">
              95+
            </p>
          </div>
        )}
      </div>
    </Floating3D>
  );
}
