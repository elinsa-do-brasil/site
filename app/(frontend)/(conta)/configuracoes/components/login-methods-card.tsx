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
  createdAt: Date;
  updatedAt: Date;
};

function getProviderLabel(providerId: string) {
  const normalizedProviderId = providerId.trim().toLowerCase();

  if (normalizedProviderId === "microsoft") return "Microsoft";
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
  hasMicrosoft,
  passkeysCount,
}: {
  accounts: LoginMethodAccount[];
  hasMicrosoft: boolean;
  passkeysCount: number;
}) {
  return (
    <Card className="rounded-md border-border/80 py-0 shadow-sm ring-1 ring-foreground/5">
      <CardHeader className="border-b bg-muted/30 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="size-4 text-elinsa-primary" />
          Métodos de acesso
        </CardTitle>
        <CardDescription>
          Formas habilitadas para entrar nesta conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <StatusTile
            icon={MailCheck}
            label="Código por e-mail"
            value="Disponível"
            active
          />
          <StatusTile
            icon={Link2}
            label="Microsoft"
            value={hasMicrosoft ? "Vinculada" : "Não vinculada"}
            active={hasMicrosoft}
          />
          <StatusTile
            icon={Fingerprint}
            label="Passkeys"
            value={`${passkeysCount} cadastrada${passkeysCount === 1 ? "" : "s"}`}
            active={passkeysCount > 0}
          />
        </div>

        {accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border border-border/80 bg-background/70 p-3"
                key={account.id}
              >
                <div>
                  <p className="font-medium">
                    {getProviderLabel(account.providerId)}
                  </p>
                  <p className="text-muted-foreground">
                    Atualizada em {formatDate(account.updatedAt)}
                  </p>
                </div>
                <Badge variant="outline">
                  <Link2 className="size-3" />
                  OAuth
                </Badge>
              </div>
            ))}
          </div>
        ) : null}
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
    <div className="rounded-md border border-border/80 bg-background/70 p-3">
      <p className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-elinsa-primary" />
        {label}
      </p>
      <Badge className="mt-2" variant={active ? "secondary" : "outline"}>
        {value}
      </Badge>
    </div>
  );
}
