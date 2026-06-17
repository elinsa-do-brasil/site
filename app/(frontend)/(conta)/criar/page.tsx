import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Criar conta",
};

type CriarContaPageProps = {
  searchParams: Promise<{
    convite?: string;
    invitationId?: string;
  }>;
};

export default async function CriarContaPage({
  searchParams,
}: CriarContaPageProps) {
  const { convite, invitationId } = await searchParams;
  const inviteId = convite || invitationId;

  if (inviteId) {
    redirect(`/convite/${encodeURIComponent(inviteId)}`);
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <Card className="w-full max-w-108">
        <CardHeader className="px-6 text-center">
          <CardTitle className="mt-6 mb-3">
            <Logo className="mx-auto" />
          </CardTitle>
          <h1 className="text-lg font-semibold tracking-tight">
            Cadastro por convite
          </h1>
          <CardDescription>
            Contas do Portal Interno Elinsa são criadas a partir do link de
            convite enviado pela organização.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <p className="text-center text-sm text-muted-foreground">
            Use o link recebido por e-mail. Ele abre o formulário com o endereço
            do convite já definido.
          </p>
          <Button className="w-full" asChild>
            <Link href="/entrar">Ir para o login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
