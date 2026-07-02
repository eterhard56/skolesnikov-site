import { ParserAuthLoading } from "@/components/parser/ParserAuthLoading";
import { ParserShell } from "@/components/parser/ParserShell";

export default function ParserLoginLoading() {
  return (
    <ParserShell variant="auth">
      <ParserAuthLoading label="Загрузка…" />
    </ParserShell>
  );
}
