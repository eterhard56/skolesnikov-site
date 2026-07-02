import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Parser — Lead Generation",
  description:
    "Поиск компаний без сайта для лидогенерации. Защищённый парсер-дашборд.",
  robots: { index: false, follow: false },
};

export default function ParserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-studio-snow text-studio-charcoal">
      {children}
    </div>
  );
}
