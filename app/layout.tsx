import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { siteConfig } from "@/lib/data/content";

const display = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: {
    default: `${siteConfig.brand} — ${siteConfig.role} · ${siteConfig.location}`,
    template: `%s · ${siteConfig.brand}`,
  },
  description:
    "Разработка корпоративных сайтов, лендингов и редизайн для бизнеса. WordPress и Next.js. Оренбург и вся Россия.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
