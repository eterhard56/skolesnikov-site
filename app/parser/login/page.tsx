import { Suspense } from "react";
import { ParserLoginForm } from "@/components/parser/ParserLoginForm";
import { ParserShell } from "@/components/parser/ParserShell";

function LoginFallback() {
  return (
    <div className="w-full max-w-md rounded-3xl glass p-8 text-center text-sm text-neutral-500 shadow-glass">
      Загрузка…
    </div>
  );
}

export default function ParserLoginPage() {
  return (
    <ParserShell variant="auth">
      <Suspense fallback={<LoginFallback />}>
        <ParserLoginForm />
      </Suspense>
    </ParserShell>
  );
}
