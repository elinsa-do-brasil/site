import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Or } from "@/components/auth/or";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <main
      className="flex min-h-screen w-full items-center justify-center"
      id="conteudo-principal"
    >
      <Card className="w-full max-w-108 ">
        <CardHeader className="flex flex-col items-center space-y-4 text-center">
          <CardTitle className="mt-6 mb-3">
            <Logo className="mx-auto" />
          </CardTitle>
          <h1 className="text-lg font-semibold tracking-tight">Olá!</h1>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-6">
          <p className="text-center text-sm">
            Para criar uma conta no Portal Interno da Elinsa você precisa de um
            convite.
          </p>
          <p className="text-center text-sm">
            Se você recebeu um convite por e-mail, clique no link do convite
            para abrir o formulário de criação de conta.
          </p>
          <Or />
          <Button variant="link" className="w-full text-sm" asChild>
            <Link href="/entrar">Eu já tenho uma conta</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
