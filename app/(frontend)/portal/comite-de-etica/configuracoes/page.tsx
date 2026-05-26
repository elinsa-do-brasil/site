import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { requireCommitteeAccess, requireUserId } from "@/lib/comite/access";

export const dynamic = "force-dynamic";

export default async function CommitteeSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = requireUserId(session?.user.id);
  const context = await requireCommitteeAccess(userId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações do Comitê
          </h1>
          <p className="mt-2 text-muted-foreground">
            Resumo do seu acesso às rotinas do comitê.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/portal/comite-de-etica">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissões disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <InfoItem label="Área" value="Comitê de Ética" />
            <InfoItem
              label="Função"
              value={
                context.isCommitteeLawyer
                  ? "Advogada externa"
                  : "Não habilitada"
              }
            />
            <InfoItem
              label="Consulta de denúncias"
              value={context.hasCommitteeAccess ? "Liberada" : "Restrita"}
            />
            <InfoItem
              label="Gestão dos casos"
              value={context.hasCommitteeAccess ? "Liberada" : "Restrita"}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium">{value}</dd>
    </div>
  );
}
