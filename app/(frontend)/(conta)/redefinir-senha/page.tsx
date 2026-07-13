import type { Metadata } from "next";
import { Suspense } from "react";
import { RedefinirSenhaForm } from "@/components/auth/RedefinirSenhaForm";
import { Card, CardContent } from "@/components/ui/card";
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
          <Card className="w-full max-w-108" variant="auth">
            <CardContent className="flex justify-center px-6 text-muted-foreground">
              <Spinner />
            </CardContent>
          </Card>
        }
      >
        <RedefinirSenhaForm />
      </Suspense>
    </main>
  );
}
