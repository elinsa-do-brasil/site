import type { Metadata } from "next";
import { Suspense } from "react";
import { RedefinirSenhaForm } from "@/components/auth/RedefinirSenhaForm";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default function RedefinirSenhaPage() {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      id="conteudo-principal"
    >
      <Suspense
        fallback={
          <div className="flex w-full max-w-md justify-center rounded-md border border-border/80 bg-card p-8 text-muted-foreground shadow-sm ring-1 ring-foreground/5">
            <Spinner />
          </div>
        }
      >
        <RedefinirSenhaForm />
      </Suspense>
    </main>
  );
}
