import { Fingerprint, KeyRound, Link2, MailCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LoginMethodAccount = {
  id: string;
  providerId: string;
  accountId: string;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function getProviderLabel(providerId: string) {
  const normalizedProviderId = providerId.trim().toLowerCase();

  if (normalizedProviderId === "credential") return "E-mail e senha";
  if (normalizedProviderId === "microsoft") return "Microsoft";
  if (normalizedProviderId === "google") return "Google";
  if (normalizedProviderId === "github") return "GitHub";

  return normalizedProviderId || "Provedor externo";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export function LoginMethodsCard({
  accounts,
  hasPassword,
  socialProviders,
}: {
  accounts: LoginMethodAccount[];
  hasPassword: boolean;
  socialProviders: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4" />
          Métodos de acesso
        </CardTitle>
        <CardDescription>
          Formas de login já vinculadas à sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <StatusTile
            icon={MailCheck}
            label="Senha local"
            value={hasPassword ? "Configurada" : "Não configurada"}
            active={hasPassword}
          />
          <StatusTile
            icon={Link2}
            label="Login social"
            value={
              socialProviders.length > 0
                ? socialProviders.map(getProviderLabel).join(", ")
                : "Não conectado"
            }
            active={socialProviders.length > 0}
          />
        </div>

        <div className="space-y-2">
          {accounts.length === 0 ? (
            <p className="rounded-md border p-3 text-muted-foreground">
              Nenhum método de login foi encontrado.
            </p>
          ) : (
            accounts.map((account) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border p-3"
                key={account.id}
              >
                <div>
                  <p className="font-medium">
                    {getProviderLabel(account.providerId)}
                  </p>
                  <p className="text-muted-foreground">
                    Atualizado em {formatDate(account.updatedAt)}
                  </p>
                </div>
                <Badge variant="outline">
                  <Fingerprint className="size-3" />
                  {account.providerId === "credential" ? "Credencial" : "OAuth"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusTile({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </p>
      <Badge className="mt-2" variant={active ? "secondary" : "outline"}>
        {value}
      </Badge>
    </div>
  );
}
