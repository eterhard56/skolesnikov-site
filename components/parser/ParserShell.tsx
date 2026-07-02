"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { transitionCinematic } from "@/lib/motion/presets";
import { ParserBackground } from "@/components/parser/ParserBackground";

type ParserShellProps = {
  children: ReactNode;
  variant?: "auth" | "dashboard";
};

export function ParserShell({
  children,
  variant = "dashboard",
}: ParserShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ParserBackground />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitionCinematic}
        className={
          variant === "auth"
            ? "relative z-10 flex min-h-screen items-center justify-center px-5 py-16 sm:px-8"
            : "relative z-10 container-studio px-5 py-8 sm:px-8 lg:px-12 xl:px-16 md:py-10"
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
