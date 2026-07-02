import { ParserDashboard } from "@/components/parser/ParserDashboard";
import { ParserShell } from "@/components/parser/ParserShell";

export default function ParserPage() {
  return (
    <ParserShell variant="dashboard">
      <ParserDashboard />
    </ParserShell>
  );
}
