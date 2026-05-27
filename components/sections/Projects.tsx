"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { WriteButton } from "@/components/ui/ContactButtons";
import { cn } from "@/lib/utils/cn";

const portfolioProjects = [
  {
    id: "01",
    name: "ОренПропант",
    headline:
      "Крупнейший производитель пропантов для нефтегазовой промышленности",
    description:
      "Современный корпоративный сайт для промышленной компании. Адаптивный дизайн, высокая скорость загрузки и современная структура контента.",
    url: "https://orenpropant.ru",
    domain: "orenpropant.ru",
    category: "Корпоративный сайт",
    image: "/images/projects/orenpropant.png",
  },
  {
    id: "02",
    name: "Вечерний Оренбург",
    headline: "Газета «Вечерний Оренбург»",
    description:
      "Новостной городской портал с удобной навигацией, мобильной адаптацией и современной подачей контента.",
    url: "https://vecherka56.ru",
    domain: "vecherka56.ru",
    category: "Новостной портал",
    image: "/images/projects/vecherka56.png",
  },
  {
    id: "03",
    name: "Совет Муниципальных образований Оренбургской области",
    headline: "Совет Муниципальных образований Оренбургской области",
    description:
      "Официальный сайт организации с современной структурой, удобным доступом к информации и адаптивным интерфейсом.",
    url: "https://smo56.ru",
    domain: "smo56.ru",
    category: "Официальный сайт",
    image: "/images/projects/smo56.png",
  },
] as const;

function ProjectCard({
  project,
  index,
}: {
  project: (typeof portfolioProjects)[number];
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isFirst = index === 0;

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block rounded-[1.75rem] md:rounded-[2.25rem] overflow-hidden motion-gpu",
        "bg-white border border-neutral-200/50",
        "shadow-premium hover:shadow-float hover:border-neutral-200/80",
        !prefersReducedMotion && "motion-hover-lift"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-neutral-100",
          isFirst ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[16/10] md:aspect-[18/10]"
        )}
      >
        <Image
          src={project.image}
          alt={`Скриншот сайта ${project.name}`}
          fill
          priority={isFirst}
          sizes="(max-width: 768px) 100vw, 1400px"
          className={cn(
            "object-cover object-top transition-transform duration-500 ease-out motion-gpu",
            !prefersReducedMotion && "group-hover:scale-[1.02]"
          )}
        />

        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-studio-charcoal/75 via-studio-charcoal/15 to-transparent",
            "opacity-50 transition-opacity duration-400 group-hover:opacity-65"
          )}
        />

        <div className="absolute inset-0 bg-studio-charcoal/0 group-hover:bg-studio-charcoal/8 transition-colors duration-400" />

        <div className="absolute top-5 left-5 md:top-6 md:left-6">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.14em] text-white/90 bg-white/15 border border-white/25 backdrop-blur-md">
            {project.category}
          </span>
        </div>

        <div
          className={cn(
            "absolute top-5 right-5 md:top-6 md:right-6",
            "w-11 h-11 rounded-full flex items-center justify-center",
            "bg-white/15 border border-white/25 backdrop-blur-md",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300 ease-out motion-gpu"
          )}
        >
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 lg:p-10">
          <p className="font-mono text-xs text-white/50 mb-2">{project.domain}</p>
          <h3
            className={cn(
              "font-display font-semibold text-white tracking-[-0.03em] leading-[1.1]",
              isFirst ? "text-2xl md:text-3xl lg:text-4xl" : "text-xl md:text-2xl lg:text-3xl"
            )}
          >
            {project.headline}
          </h3>
        </div>
      </div>

      <div className="p-7 md:p-9 lg:p-10 border-t border-neutral-100/80">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-studio-accent mb-2">
              {project.name}
            </p>
            <p className="text-neutral-500 text-base md:text-lg leading-relaxed font-light">
              {project.description}
            </p>
          </div>

          <span className="inline-flex items-center gap-2 text-sm font-medium text-studio-charcoal shrink-0 group-hover:text-studio-accent transition-colors duration-500">
            Открыть сайт
            <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

export function Projects() {
  return (
    <section id="work" className="section-padding bg-studio-snow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-gradient-radial from-studio-accent/5 to-transparent blur-3xl pointer-events-none" />

      <div className="container-studio relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 md:gap-10 mb-16 md:mb-20 lg:mb-28">
          <SectionHeading
            eyebrow="Портфолио"
            title="Реальные проекты"
            description="Сайты для компаний и организаций Оренбурга и региона. Можно открыть и посмотреть вживую."
          />
          <ScrollReveal delay={0.15} className="shrink-0">
            <WriteButton variant="secondary" />
          </ScrollReveal>
        </div>

        <StaggerContainer className="flex flex-col gap-8 md:gap-10 lg:gap-14" stagger={0.05}>
          {portfolioProjects.map((project, i) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} index={i} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
