"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ContactButtonGroup } from "@/components/ui/ContactButtons";
import { siteConfig } from "@/lib/data/content";

export function ContactCTA() {
  return (
    <section className="section-padding bg-studio-snow relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-light opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] bg-gradient-radial from-studio-accent/5 to-transparent blur-3xl pointer-events-none" />

      <div className="container-studio relative">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal className="text-center mb-10 md:mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-studio-accent/90 mb-5">
              Связаться
            </p>
            <h2 className="font-display text-display-lg text-studio-charcoal tracking-tight leading-[1.08]">
              Обсудим ваш проект
            </h2>
            <p className="mt-4 text-base md:text-lg text-neutral-500 leading-relaxed font-light max-w-lg mx-auto">
              Позвоните или напишите — отвечу и подскажу по срокам и стоимости.
              Первая консультация бесплатно.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="rounded-[1.75rem] md:rounded-[2rem] border border-white/75 bg-white/55 backdrop-blur-md p-6 sm:p-8 md:p-10 shadow-glass flex justify-center motion-gpu">
              <ContactButtonGroup
                size="lg"
                layout="col"
                className="max-w-md w-full"
              />
            </div>
          </ScrollReveal>

          <p className="mt-7 md:mt-8 text-sm text-neutral-400 text-center font-light">
            {siteConfig.location} · Ответ обычно в течение нескольких часов
          </p>
        </div>
      </div>
    </section>
  );
}
