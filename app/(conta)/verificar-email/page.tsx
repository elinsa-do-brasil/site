import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verificar e-mail",
};

export default function VerificarEmailPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight">Verificação de E-mail</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Se você acessou o link enviado para o seu e-mail, sua conta foi confirmada
          pelo sistema de autenticação.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Caso tenha sido convidado para uma organização, clique no link do convite
          para vincular seu acesso antes de tentar abrir as ferramentas internas.
        </p>
        <Button className="mt-6 w-full" asChild>
          <Link href="/entrar">Ir para o Login</Link>
        </Button>
      </div>
    </main>
  );
}
