import { ParserAuthLoading } from "@/components/parser/ParserAuthLoading";
import { ParserShell } from "@/components/parser/ParserShell";

export default function ParserProtectedLoading() {
  return (
    <ParserShell variant="dashboard">
      <ParserAuthLoading label="Проверка доступа…" />
    </ParserShell>
  );
}
