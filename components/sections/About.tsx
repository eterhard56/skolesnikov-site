"use client";

import { aboutHighlights, siteConfig } from "@/lib/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { ContactButtonGroup } from "@/components/ui/ContactButtons";
import { GlassCard } from "@/components/ui/GlassCard";

export function About() {
  return (
    <section id="about" className="section-padding bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-studio-accent/6 to-transparent blur-3xl pointer-events-none" />

      <div className="container-studio relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          <SectionHeading
            eyebrow="Обо мне"
            title="Разработчик сайтов из Оренбурга"
            description="Помогаю компаниям и предпринимателям получить современный сайт, который вызывает доверие и работает на бизнес. Работаю напрямую — от обсуждения задачи до запуска."
          />

          <ScrollReveal delay={0.15}>
            <div className="space-y-6 text-neutral-500 leading-relaxed text-lg">
              <p>
                Специализируюсь на корпоративных сайтах, лендингах и редизайне
                существующих проектов. Использую WordPress и Next.js — выбор
                зависит от задачи, бюджета и того, как вам удобнее управлять
                сайтом.
              </p>
              <p>
                Для меня важны скорость загрузки, мобильная версия и понятная
                структура. Сайт должен быть не «красивой картинкой», а рабочим
                инструментом для ваших клиентов.
              </p>
              <ContactButtonGroup size="md" callVariant="secondary" writeVariant="primary" />
            </div>
          </ScrollReveal>
        </div>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-16 md:mt-24">
          {aboutHighlights.map((item) => (
            <StaggerItem key={item.label}>
              <GlassCard className="p-8 md:p-10 h-full text-center">
                <p className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-studio-charcoal">
                  {item.value}
                </p>
                <p className="mt-3 text-neutral-500">{item.label}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.1} className="mt-12 text-center">
          <p className="text-sm text-neutral-400">
            {siteConfig.location} · Работаю с клиентами по всей России
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
