import type { Metadata } from "next";
import { Suspense } from "react";
import { RedefinirSenhaForm } from "@/components/auth/RedefinirSenhaForm";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default function RedefinirSenhaPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            Carregando...
          </div>
        }
      >
        <RedefinirSenhaForm />
      </Suspense>
    </main>
  );
}
