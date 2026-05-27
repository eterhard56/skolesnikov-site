"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/data/content";
import { WriteButton } from "@/components/ui/ContactButtons";
import { Logo } from "@/components/ui/Logo";
import { SmoothLink } from "@/components/ui/SmoothLink";
import {
  easePremium,
  transitionCinematic,
  transitionFast,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils/cn";

const navGlassShadow =
  "0 1px 2px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.05), 0 24px 64px rgba(124,108,255,0.04), inset 0 1px 0 rgba(255,255,255,0.75)";

const navGlassShadowScrolled =
  "0 2px 4px rgba(0,0,0,0.03), 0 12px 40px rgba(0,0,0,0.06), 0 32px 80px rgba(124,108,255,0.05), inset 0 1px 0 rgba(255,255,255,0.8)";

function useActiveSection() {
  const [activeHref, setActiveHref] = useState<string>(navLinks[0]?.href ?? "");

  useEffect(() => {
    const sections = navLinks
      .map((link) => ({
        href: link.href,
        el: document.querySelector<HTMLElement>(link.href),
      }))
      .filter((s): s is { href: string; el: HTMLElement } => !!s.el);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveHref(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.15, 0.35, 0.55] }
    );

    sections.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return activeHref;
}

const navPillShadow =
  "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(124,108,255,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <SmoothLink
      href={href}
      onClick={onClick}
      className={cn(
        "relative block px-2.5 xl:px-3 py-2 text-[12px] xl:text-[13px] font-medium tracking-[-0.01em] rounded-xl whitespace-nowrap transition-colors duration-250",
        active ? "text-studio-charcoal" : "text-neutral-500 hover:text-studio-charcoal"
      )}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-xl bg-white/75 border border-white/80 motion-gpu transition-opacity duration-250",
          active ? "opacity-100" : "opacity-0"
        )}
        style={{ boxShadow: navPillShadow }}
        aria-hidden
      />
      <span className="relative z-10">{label}</span>
    </SmoothLink>
  );
}

function MobileMenuButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      className="lg:hidden relative w-10 h-10 rounded-xl flex items-center justify-center bg-white/50 border border-white/50 hover:bg-white/70 transition-colors duration-250 shrink-0 motion-gpu"
      style={{
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.05)",
      }}
      onClick={onClick}
      aria-label={open ? "Закрыть меню" : "Открыть меню"}
      whileTap={{ scale: 0.94 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.span
            key="close"
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.2, ease: easePremium }}
          >
            <X size={20} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="menu"
            initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
            transition={{ duration: 0.2, ease: easePremium }}
          >
            <Menu size={20} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeHref = useActiveSection();
  const prefersReducedMotion = useReducedMotion();

  useLenis(({ scroll }) => {
    const next = scroll > 32;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...transitionCinematic, delay: 0.04 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 motion-gpu transition-[padding] duration-400 ease-out",
          scrolled ? "py-3" : "py-4 md:py-5"
        )}
      >
        <div className="container-studio px-5 sm:px-8 lg:px-12 xl:px-16">
          <nav
            className={cn(
              "relative flex items-center gap-3 sm:gap-4 lg:gap-5",
              "px-4 sm:px-5 lg:px-7 py-3.5 lg:py-4 rounded-2xl",
              "border transition-[background-color,box-shadow,border-color] duration-400 ease-out motion-gpu",
              scrolled
                ? "bg-white/65 backdrop-blur-md border-white/65"
                : "bg-white/40 backdrop-blur-md border-white/45"
            )}
            style={{
              boxShadow: scrolled ? navGlassShadowScrolled : navGlassShadow,
            }}
          >
            <div
              className="absolute inset-x-6 top-0 h-px pointer-events-none rounded-full opacity-60"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
              }}
            />

            <Logo asLink size="sm" showTagline={false} className="shrink-0 min-w-0 max-w-[42%] sm:max-w-none" />

            <ul className="hidden lg:flex flex-1 items-center justify-center gap-0.5 min-w-0 px-1">
              {navLinks.map((link) => (
                <li key={link.href} className="shrink-0">
                  <NavLink
                    href={link.href}
                    label={link.label}
                    active={activeHref === link.href}
                  />
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto lg:ml-0">
              <WriteButton
                size="sm"
                variant="primary"
                className="hidden lg:inline-flex !px-5 !py-2.5"
              />
              <MobileMenuButton
                open={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              />
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easePremium }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              className="absolute inset-0 bg-studio-charcoal/20 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />

            <motion.div
              initial={{ x: "100%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.8 }}
              transition={transitionFast}
              className="absolute right-0 top-0 bottom-0 w-[min(88vw,22rem)] flex flex-col motion-gpu"
              data-lenis-prevent
            >
              <div
                className="flex-1 m-3 ml-0 mt-3 mb-3 rounded-3xl rounded-r-none bg-white/80 backdrop-blur-md border border-white/60 border-r-0 overflow-hidden flex flex-col motion-gpu"
                style={{ boxShadow: navGlassShadowScrolled }}
              >
                <div className="px-6 pt-24 pb-8 flex flex-col flex-1">
                  <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-[0.18em] mb-6">
                    Меню
                  </p>

                  <ul className="flex flex-col gap-1">
                    {navLinks.map((link, i) => (
                      <motion.li
                        key={link.href}
                        initial={
                          prefersReducedMotion
                            ? false
                            : { opacity: 0, x: 20 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{
                          duration: 0.35,
                          delay: i * 0.05,
                          ease: easePremium,
                        }}
                      >
                        <NavLink
                          href={link.href}
                          label={link.label}
                          active={activeHref === link.href}
                          onClick={closeMobile}
                        />
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div
                    className="mt-auto pt-8"
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 12 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35, ease: easePremium }}
                  >
                    <WriteButton
                      size="md"
                      variant="primary"
                      fullWidth
                      onClick={closeMobile}
                      className="w-full justify-center"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
