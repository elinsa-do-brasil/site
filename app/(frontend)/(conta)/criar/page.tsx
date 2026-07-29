import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Or } from "@/components/auth/or";
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
    <main
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      id="conteudo-principal"
    >
      <Card className="w-full max-w-108" variant="auth">
        <CardHeader className="flex flex-col items-center gap-2 px-6 text-center">
          <CardTitle className="mt-6 mb-3">
            <Logo className="mx-auto" />
          </CardTitle>
          <h1 className="text-lg font-semibold tracking-tight">
            Acesso ao Portal Interno
          </h1>
          <CardDescription>
            Colaboradores entram pela Microsoft; convidados externos usam um
            convite válido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <p className="text-center text-sm">
            Se você possui uma conta @grupoamperelinsa.com, use a Microsoft na
            tela de login para fazer o primeiro acesso.
          </p>
          <p className="text-center text-sm">
            Se recebeu um convite externo, abra o link enviado por e-mail para
            confirmar o endereço com um código de uso único.
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
