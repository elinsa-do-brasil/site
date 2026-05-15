import {
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AccountOverviewUser = {
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
  createdAt?: Date | string | null;
};

function getInitials(name?: string | null) {
  if (!name) return "E";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value?: Date | string | null) {
  if (!value) return "Não disponível";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Não disponível";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(date);
}

export function AccountOverviewCard({
  user,
  hasPassword,
  passkeysCount,
  sessionsCount,
}: {
  user: AccountOverviewUser;
  hasPassword: boolean;
  passkeysCount: number;
  sessionsCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4" />
          Conta
        </CardTitle>
        <CardDescription>
          Dados principais da sua conta no portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-md border bg-muted/20 p-3">
          <Avatar size="lg">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {user.name || "Usuário Elinsa"}
            </p>
            <p className="truncate text-muted-foreground">
              {user.email || "Sem e-mail"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile
            icon={Mail}
            label="E-mail"
            value={user.emailVerified ? "Verificado" : "Pendente"}
            active={Boolean(user.emailVerified)}
          />
          <InfoTile
            icon={ShieldCheck}
            label="Acesso"
            value={hasPassword ? "Senha ativa" : "Sem senha local"}
            active={hasPassword}
          />
          <InfoTile
            icon={CheckCircle2}
            label="Passkeys"
            value={`${passkeysCount} cadastrada${passkeysCount === 1 ? "" : "s"}`}
            active={passkeysCount > 0}
          />
          <InfoTile
            icon={CalendarDays}
            label="Conta criada"
            value={formatDate(user.createdAt)}
            active={Boolean(user.createdAt)}
          />
        </div>

        <p className="text-muted-foreground">
          {sessionsCount} sessão{sessionsCount === 1 ? "" : "es"} ativa
          {sessionsCount === 1 ? "" : "s"} no momento.
        </p>
      </CardContent>
    </Card>
  );
}

function InfoTile({
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
    <div className="rounded-md border p-3">
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
