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
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações do Comitê
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visão técnica da organização, roles e times do usuário atual.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/comite">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seu contexto de acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <InfoItem label="Organização" value={context.organizationId} />
            <InfoItem label="Times" value={context.teams.join(", ") || "-"} />
            <InfoItem label="Roles" value={context.roles.join(", ") || "-"} />
            <InfoItem
              label="Acesso completo"
              value={context.hasFullAccess ? "sim" : "não"}
            />
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-mono">{value}</dd>
    </div>
  );
}
