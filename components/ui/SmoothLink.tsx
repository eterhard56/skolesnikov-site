"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps, type MouseEvent } from "react";
import { useSmoothScroll } from "@/lib/hooks/useSmoothScroll";
import { cn } from "@/lib/utils/cn";

type SmoothLinkProps = ComponentProps<typeof Link> & {
  offset?: number;
};

export const SmoothLink = forwardRef<HTMLAnchorElement, SmoothLinkProps>(
  function SmoothLink(
    { href, onClick, offset, className, children, ...props },
    ref
  ) {
    const { scrollTo } = useSmoothScroll();
    const hrefStr = typeof href === "string" ? href : href.pathname ?? "";

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      if (hrefStr.startsWith("#")) {
        e.preventDefault();
        scrollTo(hrefStr, { offset });
      }
    };

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        className={cn(className)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);
