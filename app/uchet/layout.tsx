import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { UchetProvider } from "@/lib/uchet/store";
import "./uchet.css";

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-uchet-display",
  weight: ["500", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-uchet-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ЦехУчёт — зарплата и табель ПВХ",
  description:
    "Учёт заказов ПВХ-окон: квадраты, замки, москитные сетки и табель посещений. Итог зарплаты считается сразу.",
};

export default function UchetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${display.variable} ${sans.variable} font-[family-name:var(--font-uchet-sans)]`}
    >
      <UchetProvider>{children}</UchetProvider>
    </div>
  );
}
