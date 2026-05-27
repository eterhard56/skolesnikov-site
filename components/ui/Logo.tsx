import Link from "next/link";
import { siteConfig } from "@/lib/data/content";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  variant?: "default" | "light";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  asLink?: boolean;
  className?: string;
};

const sizeStyles = {
  sm: {
    word: "text-[15px] sm:text-base",
    domain: "text-[13px] sm:text-[14px]",
    tagline: "text-[10px]",
  },
  md: {
    word: "text-base sm:text-lg",
    domain: "text-sm sm:text-[15px]",
    tagline: "text-[11px]",
  },
  lg: {
    word: "text-lg sm:text-xl",
    domain: "text-base sm:text-lg",
    tagline: "text-xs",
  },
};

export function Logo({
  variant = "default",
  size = "md",
  showTagline = false,
  asLink = false,
  className,
}: LogoProps) {
  const styles = sizeStyles[size];
  const isLight = variant === "light";

  const content = (
    <span className={cn("inline-flex flex-col", className)}>
      <span className="inline-flex items-baseline leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-[-0.045em]",
            styles.word,
            isLight ? "text-white" : "text-studio-charcoal"
          )}
        >
          SKolesnikov
        </span>
        <span
          className={cn(
            "font-mono font-medium tracking-[-0.02em]",
            styles.domain,
            isLight ? "text-white/50" : "text-neutral-400"
          )}
        >
          .site
        </span>
      </span>
      {showTagline && (
        <span
          className={cn(
            "font-mono tracking-[0.04em] mt-1.5 hidden sm:block",
            styles.tagline,
            isLight ? "text-white/40" : "text-neutral-400"
          )}
        >
          {siteConfig.role} · {siteConfig.location}
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="group shrink-0 transition-opacity duration-300 hover:opacity-85">
        {content}
      </Link>
    );
  }

  return content;
}
