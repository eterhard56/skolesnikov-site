"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ContactButtonGroup } from "@/components/ui/ContactButtons";
import { HeroDeviceMockup } from "@/components/ui/HeroDeviceMockup";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { heroTags, siteConfig } from "@/lib/data/content";
import {
  heroContainerVariants,
  heroItemVariants,
  transitionCinematic,
} from "@/lib/motion/presets";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden bg-studio-snow">
      <AnimatedBackground />

      <div className="relative container-studio px-6 sm:px-8 lg:px-12 xl:px-16 pt-32 pb-24 md:pt-40 md:pb-32 w-full flex-1 flex items-center">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-center w-full">
          <motion.div
            className="lg:col-span-7 order-2 lg:order-1 motion-gpu"
            variants={prefersReducedMotion ? undefined : heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={heroItemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/60 shadow-glass mb-8"
            >
              <span className="text-sm font-medium text-neutral-600">
                {siteConfig.role} · {siteConfig.location}
              </span>
            </motion.div>

            <motion.h1
              variants={heroItemVariants}
              className="font-display text-display-xl text-studio-charcoal tracking-[-0.04em]"
            >
              Создаю{" "}
              <span className="text-gradient">современные сайты</span>
              <br />
              для бизнеса
            </motion.h1>

            <motion.p
              variants={heroItemVariants}
              className="mt-8 text-lg md:text-xl text-neutral-500 leading-relaxed max-w-xl font-light"
            >
              Разрабатываю корпоративные сайты, лендинги и обновляю существующие
              проекты. Быстро, аккуратно и с понятным результатом для вашей
              компании.
            </motion.p>

            <motion.div
              variants={heroItemVariants}
              className="mt-10 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4"
            >
              <ContactButtonGroup size="lg" callVariant="primary" writeVariant="secondary" />
              <MagneticButton href="#work" variant="secondary" size="lg">
                Смотреть работы
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </motion.div>

            <motion.div
              variants={heroItemVariants}
              className="flex flex-wrap gap-2 mt-12"
            >
              {heroTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 text-xs font-mono text-neutral-500 bg-white/80 border border-neutral-200/80 rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-5 order-1 lg:order-2 relative flex items-center justify-center motion-gpu"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionCinematic, delay: 0.15 }}
          >
            <HeroDeviceMockup className="w-full" />
          </motion.div>
        </div>
      </div>

      <div className="relative pb-8 hidden md:flex flex-col items-center gap-2 pointer-events-none motion-fade-in">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-studio-accent/40 to-transparent motion-scroll-pulse" />
      </div>
    </section>
  );
}
