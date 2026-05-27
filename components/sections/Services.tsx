"use client";

import { services } from "@/lib/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { ContactButtonGroup } from "@/components/ui/ContactButtons";
import { cn } from "@/lib/utils/cn";

export function Services() {
  return (
    <section id="services" className="section-padding bg-white relative overflow-hidden">
      <div className="container-studio">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16 md:mb-20">
          <SectionHeading
            eyebrow="Услуги"
            title="Чем могу помочь"
            description="Подбираю решение под вашу задачу — от простого сайта-визитки до полноценного корпоративного проекта."
          />
          <ScrollReveal delay={0.15}>
            <ContactButtonGroup
              size="md"
              callVariant="secondary"
              writeVariant="primary"
              className="mt-2 lg:mt-0"
            />
          </ScrollReveal>
        </div>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {services.map((service, i) => (
            <StaggerItem key={service.title}>
              <div
                className={cn(
                  "group h-full p-6 md:p-7 rounded-2xl bg-studio-snow border border-neutral-200/60",
                  "hover:border-studio-accent/20 hover:shadow-glass motion-hover-lift motion-gpu"
                )}
              >
                <span className="font-mono text-[10px] text-neutral-400">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-studio-charcoal tracking-tight group-hover:text-studio-accent transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
