import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { userHasTeam } from "@/lib/organization/access";

export const dynamic = "force-dynamic";

export default async function TiPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id || !(await userHasTeam(session.user.id, "ti"))) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ferramentas de TI</h1>
        <p className="mt-2 text-muted-foreground">
          Área reservada para usuários do time de TI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operações técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Os atalhos técnicos podem ser conectados aqui conforme os próximos
            fluxos internos forem definidos.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
