"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navLinks, services, siteConfig } from "@/lib/data/content";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ContactButtonGroup } from "@/components/ui/ContactButtons";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative bg-studio-charcoal text-white overflow-hidden">
      <div className="absolute inset-0 bg-mesh-dark opacity-70" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-studio-accent/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative section-padding border-t border-white/[0.06]">
        <div className="container-studio">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40 mb-5">
              Контакт
            </p>
            <h2 className="font-display text-display-lg text-gradient-light tracking-tight leading-[1.08]">
              Готов обсудить ваш сайт
            </h2>
            <p className="mt-5 text-base md:text-lg text-white/50 max-w-lg mx-auto leading-relaxed font-light">
              Позвоните или напишите — расскажите о задаче, и я предложу понятный
              вариант по срокам и стоимости.
            </p>
            <div className="mt-9 md:mt-10 flex justify-center px-2">
              <ContactButtonGroup
                size="lg"
                layout="col"
                callVariant="outline-light"
                writeVariant="primary"
                dark
                className="max-w-md w-full"
              />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 pb-12 md:pb-14 border-b border-white/[0.06]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/30 mb-4">
                Навигация
              </p>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/55 hover:text-white transition-colors duration-300 text-sm flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/30 mb-4">
                Услуги
              </p>
              <ul className="space-y-2.5">
                {services.slice(0, 5).map((s) => (
                  <li key={s.title} className="text-white/55 text-sm leading-relaxed">
                    {s.title}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/30 mb-4">
                О разработчике
              </p>
              <Logo variant="light" size="sm" className="mb-4" />
              <p className="text-white/55 text-sm leading-relaxed">
                {siteConfig.role}
                <br />
                {siteConfig.location}
              </p>
              <p className="mt-3 text-white/35 text-sm font-light">
                Сайты для бизнеса · WordPress · Next.js
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7 md:pt-8">
            <p className="text-sm text-white/45 text-center sm:text-left">
              © {year} {siteConfig.brand} · {siteConfig.location}
            </p>
            <p className="text-xs text-white/30 font-mono tracking-wide">
              Веб-разработка для бизнеса
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
