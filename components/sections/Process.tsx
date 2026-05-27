"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/lib/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { transitionReveal, viewportReveal } from "@/lib/motion/presets";

export function Process() {
  return (
    <section id="process" className="section-padding bg-studio-mist relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-light opacity-50" />

      <div className="container-studio relative">
        <SectionHeading
          eyebrow="Процесс"
          title="Как проходит работа"
          description="Понятные этапы — от первого звонка до запуска сайта и поддержки после."
          className="mb-16 md:mb-24"
        />

        <div className="relative">
          <div className="absolute left-[27px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-studio-accent/50 via-studio-accent/20 to-transparent hidden md:block" />

          <StaggerContainer className="space-y-8 md:space-y-0">
            {processSteps.map((step, i) => (
              <StaggerItem key={step.step}>
                <ProcessStep step={step} index={i} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({
  step,
  index,
}: {
  step: (typeof processSteps)[number];
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`relative md:grid md:grid-cols-2 md:gap-16 md:py-10 ${
        isEven ? "" : "md:[&>div:first-child]:order-2"
      }`}
    >
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
        <motion.div
          className="w-14 h-14 rounded-2xl bg-white border border-neutral-200/70 shadow-glass flex items-center justify-center motion-gpu"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportReveal}
          transition={transitionReveal}
        >
          <span className="font-mono text-sm font-semibold text-studio-accent">
            {step.step}
          </span>
        </motion.div>
      </div>

      <ScrollReveal
        direction={isEven ? "left" : "right"}
        className={isEven ? "md:pr-16 md:text-right" : "md:pl-16"}
      >
        <div className="md:hidden flex items-center gap-4 mb-4">
          <span className="w-12 h-12 rounded-xl bg-studio-accent/10 border border-studio-accent/20 flex items-center justify-center font-mono text-sm font-semibold text-studio-accent">
            {step.step}
          </span>
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
            {step.duration}
          </span>
        </div>

        <h3 className="font-display text-2xl md:text-3xl font-semibold text-studio-charcoal tracking-tight">
          {step.title}
        </h3>
        <p className="mt-4 text-neutral-500 leading-relaxed text-base md:text-lg font-light">
          {step.description}
        </p>

        <p className="hidden md:block mt-4 text-xs font-mono text-neutral-400 uppercase tracking-wider">
          {step.duration}
        </p>
      </ScrollReveal>

      <div className="hidden md:block" aria-hidden />
    </div>
  );
}
