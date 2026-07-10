import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Verificar e-mail",
};

export default function VerificarEmailPage() {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      id="conteudo-principal"
    >
      <Card className="w-full max-w-108" variant="auth">
        <CardHeader className="px-6 text-center">
          <CardTitle className="mt-6 mb-3">
            <Logo className="mx-auto" />
          </CardTitle>
          <h1 className="text-lg font-semibold tracking-tight">
            Verificação de e-mail
          </h1>
          <CardDescription>
            Se você acessou o link enviado para o seu e-mail, sua conta foi
            confirmada pelo sistema de autenticação.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 text-center">
          <p className="text-sm leading-6 text-muted-foreground">
            Caso tenha sido convidado para uma organização, abra o link do
            convite para vincular seu acesso antes de usar as ferramentas
            internas.
          </p>
        </CardContent>
        <CardFooter className="px-6">
          <Button className="w-full" asChild>
            <Link href="/entrar">Ir para o login</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
