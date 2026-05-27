"use client";

import { advantages } from "@/lib/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils/cn";

export function Advantages() {
  return (
    <section
      id="advantages"
      className="section-padding bg-studio-mist relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-mesh-light opacity-40" />

      <div className="container-studio relative">
        <SectionHeading
          eyebrow="Преимущества"
          title="Почему со мной удобно работать"
          description="Без лишних обещаний — только то, что важно для реального бизнеса."
          className="mb-16 md:mb-20"
        />

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {advantages.map((item, i) => (
            <StaggerItem key={item.title}>
              <div
                className={cn(
                  "group h-full p-7 md:p-8 rounded-2xl bg-white border border-neutral-200/60",
                  "hover:border-studio-accent/20 hover:shadow-glass motion-hover-lift motion-gpu"
                )}
              >
                <span className="font-mono text-xs text-studio-accent">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-studio-charcoal tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-neutral-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
