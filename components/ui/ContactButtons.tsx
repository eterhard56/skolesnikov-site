"use client";

import { Mail, Phone } from "lucide-react";
import { type ReactNode } from "react";
import { siteConfig } from "@/lib/data/content";
import { cn } from "@/lib/utils/cn";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "outline-light";

const sizes: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm rounded-xl gap-2.5",
  md: "px-7 py-3.5 text-[15px] rounded-2xl gap-2.5",
  lg: "px-9 py-4 text-base rounded-2xl gap-3 min-h-[52px]",
};

const iconSizes: Record<ButtonSize, string> = {
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
  lg: "w-5 h-5",
};

const callVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-studio-accent to-[#6b5ce7] text-white border border-white/20 shadow-premium hover:shadow-float hover:brightness-[1.02]",
  secondary:
    "bg-white/70 text-studio-charcoal border border-white/65 shadow-glass hover:shadow-glass-lg hover:bg-white/85",
  "outline-light":
    "bg-white/12 text-white border border-white/25 hover:bg-white/18 hover:border-white/40",
};

const writeVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-studio-charcoal text-white border border-white/10 shadow-premium hover:shadow-float hover:bg-studio-slate",
  secondary:
    "bg-white/70 text-studio-charcoal border border-white/65 shadow-glass hover:shadow-glass-lg hover:bg-white/85",
  "outline-light":
    "bg-white/12 text-white border border-white/25 hover:bg-white/18 hover:border-white/40",
};

type ContactButtonProps = {
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  fullWidth?: boolean;
};

function ContactLink({
  href,
  children,
  className,
  onClick,
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "relative inline-flex items-center justify-center font-medium tracking-tight motion-btn motion-gpu",
        className
      )}
    >
      {children}
    </a>
  );
}

export function CallButton({
  size = "md",
  variant = "primary",
  className,
  onClick,
  fullWidth,
}: ContactButtonProps) {
  return (
    <ContactLink
      href={`tel:${siteConfig.phoneTel}`}
      onClick={onClick}
      className={cn(
        callVariants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      <Phone className={iconSizes[size]} strokeWidth={2} />
      <span>Позвонить</span>
    </ContactLink>
  );
}

export function WriteButton({
  size = "md",
  variant = "secondary",
  className,
  onClick,
  fullWidth,
}: ContactButtonProps) {
  return (
    <ContactLink
      href={`mailto:${siteConfig.email}`}
      onClick={onClick}
      className={cn(
        writeVariants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      <Mail className={iconSizes[size]} strokeWidth={2} />
      <span>Написать</span>
    </ContactLink>
  );
}

/** @deprecated Use CallButton */
export const EmailButton = WriteButton;

/** @deprecated Use WriteButton */
export const MaxButton = WriteButton;

export function ContactButtonGroup({
  size = "md",
  layout = "row",
  callVariant = "primary",
  writeVariant = "secondary",
  emailVariant,
  maxVariant,
  className,
  onClick,
  dark = false,
}: {
  size?: ButtonSize;
  layout?: "row" | "col";
  callVariant?: ButtonVariant;
  writeVariant?: ButtonVariant;
  emailVariant?: ButtonVariant;
  maxVariant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  dark?: boolean;
}) {
  const effectiveCallVariant = callVariant ?? emailVariant ?? "primary";
  const effectiveWriteVariant = writeVariant ?? maxVariant ?? "secondary";
  const resolvedCallVariant =
    dark && effectiveCallVariant === "primary" ? "outline-light" : effectiveCallVariant;
  const resolvedWriteVariant =
    dark && effectiveWriteVariant === "secondary" ? "outline-light" : effectiveWriteVariant;

  return (
    <div
      className={cn(
        "flex gap-3 sm:gap-4",
        layout === "col" ? "flex-col w-full" : "flex-col sm:flex-row flex-wrap",
        className
      )}
    >
      <CallButton
        size={size}
        variant={resolvedCallVariant}
        onClick={onClick}
        fullWidth={layout === "col"}
        className={layout === "col" ? "justify-center" : undefined}
      />
      <WriteButton
        size={size}
        variant={resolvedWriteVariant}
        onClick={onClick}
        fullWidth={layout === "col"}
        className={layout === "col" ? "justify-center" : undefined}
      />
    </div>
  );
}
