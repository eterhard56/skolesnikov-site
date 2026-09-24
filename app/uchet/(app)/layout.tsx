import { UchetProvider } from "@/lib/uchet/store";

export default function UchetAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UchetProvider>{children}</UchetProvider>;
}
