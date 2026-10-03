import { Suspense } from "react";
import { UchetLoginForm } from "@/components/uchet/UchetLoginForm";

export default function UchetLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="uchet-shell flex min-h-dvh items-center justify-center text-sm text-uchet-muted">
          Загрузка…
        </div>
      }
    >
      <UchetLoginForm />
    </Suspense>
  );
}
