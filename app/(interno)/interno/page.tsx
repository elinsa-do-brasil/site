import type { Metadata } from "next";
import Link from "next/link";
import { BotaoSair } from "@/components/auth/LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAvailableInternalTools,
  requireInternalAccess,
} from "@/lib/organization/access";

export const metadata: Metadata = {
  title: "Portal Interno - Elinsa",
};

export default async function InternoDashboardPage() {
  const context = await requireInternalAccess();
  const availableTools = getAvailableInternalTools(context);

  const roleText = Array.isArray(context.role)
    ? context.role.join(", ")
    : context.role;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal Interno</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesso integrado às ferramentas operacionais e administrativas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {context.isOrgAdmin && (
            <Button size="sm" asChild>
              <Link href="/interno/admin/convites">Gerenciar Convites</Link>
            </Button>
          )}
          <BotaoSair />
        </div>
      </div>

      <div className="mb-8 rounded-xl border bg-card p-4 text-xs">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <span className="text-muted-foreground font-medium">Usuário: </span>
            <span className="font-mono">{context.userId}</span>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">Função: </span>
            <span className="capitalize">{roleText || "Membro"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Times ativos: </span>
            {context.teams.length > 0 ? (
              context.teams.map((t) => (
                <Badge key={t} variant="secondary" className="capitalize">
                  {t.replace("_", " ")}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground italic">Nenhum time alocado</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Suas Ferramentas</h2>
        <p className="text-xs text-muted-foreground">
          Acessos liberados cumulativamente com base nos times alocados na organização.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {availableTools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <CardTitle>{tool.label}</CardTitle>
              <CardDescription>
                Requer vínculo com: {tool.requiredTeams.join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild>
                <Link href={tool.href}>Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {availableTools.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="text-sm">
                Nenhuma ferramenta interna foi disponibilizada para o seu perfil.
              </p>
              <p className="mt-1 text-xs">
                Caso acredite que seja um erro, contate o administrador da organização.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
