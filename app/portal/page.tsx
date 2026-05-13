import Link from "next/link";
import { BotaoSair } from "@/components/auth/LogoutButton";
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

export default async function InternoDashboardPage() {
  const context = await requireInternalAccess();
  const availableTools = getAvailableInternalTools(context);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal interno</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma ferramenta para continuar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BotaoSair />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Suas Ferramentas
        </h2>
        <p className="text-xs text-muted-foreground">
          Os atalhos abaixo refletem os acessos liberados para o seu perfil.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {availableTools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <CardTitle>{tool.label}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {tool.href === "/portal" ? (
                <Button size="sm" variant="secondary" disabled>
                  Disponível no portal
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link href={tool.href}>Acessar</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {availableTools.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="text-sm">
                Nenhuma ferramenta interna foi disponibilizada para o seu
                perfil.
              </p>
              <p className="mt-1 text-xs">
                Caso acredite que seja um erro, contate o administrador da
                organização.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
