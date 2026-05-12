import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getUserTeamsInElinsa } from "@/lib/organization/access";

export const dynamic = "force-dynamic";

const tools = [
  {
    label: "Comitê de Ética",
    description: "Triagem e acompanhamento de denúncias.",
    href: "/comite",
    requiredTeam: "comite_etica",
  },
  {
    label: "Ferramentas de TI",
    description: "Área técnica interna.",
    href: "/ti",
    requiredTeam: "ti",
  },
];

export default async function ToolsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
        <h1 className="text-3xl font-bold tracking-tight">
          Ferramentas internas
        </h1>
        <p className="mt-2 text-muted-foreground">
          Entre para ver as ferramentas disponíveis para seus times.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/login?redirectTo=/ferramentas">Entrar</Link>
        </Button>
      </main>
    );
  }

  const teams = await getUserTeamsInElinsa(session.user.id);
  const teamNames = new Set(teams.map((team) => team.name));
  const availableTools = tools.filter((tool) =>
    teamNames.has(tool.requiredTeam),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Ferramentas internas
        </h1>
        <p className="mt-2 text-muted-foreground">
          Atalhos liberados conforme os times vinculados à organization Elinsa.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {availableTools.map((tool) => (
          <Card key={tool.href}>
            <CardHeader>
              <CardTitle>{tool.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {tool.description}
              </p>
              <Button asChild>
                <Link href={tool.href}>Abrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableTools.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma ferramenta interna está vinculada aos seus times.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
