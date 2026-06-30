"use client";

import { MailPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { formatAdminName } from "@/components/admin/GestaoPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  cancelarConviteAdmin,
  enviarConviteAdmin,
} from "@/lib/organization/actions";
import {
  formatInvitationStatus,
  formatOrganizationRole,
} from "@/lib/organization/constants";

type TeamOption = {
  id: string;
  name: string;
};

type PendingInvite = {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date | null;
  teamName: string | null;
};

type GerenciarConvitesProps = {
  pendingInvitations: PendingInvite[];
  roleOptions: string[];
  teams: TeamOption[];
};

export function GerenciarConvites({
  pendingInvitations,
  roleOptions,
  teams,
}: GerenciarConvitesProps) {
  const [inviteSearch, setInviteSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const normalizedInviteSearch = normalizeSearch(inviteSearch);
  const visibleInvitations = pendingInvitations.filter(
    (invite) =>
      matchesInvitationSearch(invite, normalizedInviteSearch) &&
      matchesInvitationRole(invite, roleFilter) &&
      matchesInvitationTeam(invite, teamFilter),
  );

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Convites pendentes</CardTitle>
        <CardDescription>
          Envie convites de acesso e acompanhe os links ainda não aceitos.
        </CardDescription>
        <CardAction>
          <InviteDialog
            roleOptions={roleOptions}
            teams={teams}
            trigger={
              <Button type="button" size="sm">
                <MailPlus data-icon="inline-start" />
                Novo convite
              </Button>
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
          <Input
            aria-label="Buscar convites por e-mail"
            onChange={(event) => setInviteSearch(event.target.value)}
            placeholder="Buscar por e-mail"
            type="search"
            value={inviteSearch}
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger aria-label="Filtrar convites por função">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas as funções</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {formatOrganizationRole(role)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger aria-label="Filtrar convites por equipe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas as equipes</SelectItem>
                <SelectItem value="none">Sem equipe</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.name}>
                    {formatAdminName(team.name)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {pendingInvitations.length > 0 ? (
          <div className="divide-y rounded-md border">
            {visibleInvitations.map((invite) => (
              <InvitationItem invite={invite} key={invite.id} />
            ))}
            {visibleInvitations.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Nenhum convite encontrado para esta busca.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
            Nenhum convite pendente.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function matchesInvitationSearch(
  invite: PendingInvite,
  normalizedSearch: string,
) {
  if (!normalizedSearch) {
    return true;
  }

  return normalizeSearch(invite.email).includes(normalizedSearch);
}

function matchesInvitationRole(invite: PendingInvite, roleFilter: string) {
  if (roleFilter === "all") {
    return true;
  }

  return invite.role === roleFilter;
}

function matchesInvitationTeam(invite: PendingInvite, teamFilter: string) {
  if (teamFilter === "all") {
    return true;
  }

  if (teamFilter === "none") {
    return !invite.teamName;
  }

  return invite.teamName === teamFilter;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function InvitationItem({ invite }: { invite: PendingInvite }) {
  const router = useRouter();
  const isExpired = invite.expiresAt
    ? new Date(invite.expiresAt) < new Date()
    : false;

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_16rem_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{invite.email}</p>
          <Badge variant={isExpired ? "destructive" : "secondary"}>
            {isExpired ? "Expirado" : formatInvitationStatus("pending")}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Criado em {formatDate(invite.createdAt)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{formatOrganizationRole(invite.role)}</Badge>
        <Badge variant="outline">
          {invite.teamName ? formatAdminName(invite.teamName) : "Sem equipe"}
        </Badge>
      </div>

      <div className="flex items-center justify-start gap-3 lg:justify-end">
        <span className="text-sm text-muted-foreground">
          Expira {formatDate(invite.expiresAt)}
        </span>
        <ConfirmActionDialog
          action={() => cancelarConviteAdmin(invite.id)}
          confirmLabel="Revogar convite"
          description={`O convite enviado para ${invite.email} deixará de funcionar imediatamente.`}
          onSuccess={() => router.refresh()}
          successMessage="Convite revogado."
          title="Revogar convite?"
          trigger={
            <Button type="button" variant="destructive">
              Revogar
            </Button>
          }
        />
      </div>
    </div>
  );
}

function InviteDialog({
  roleOptions,
  teams,
  trigger,
}: {
  roleOptions: string[];
  teams: TeamOption[];
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("teamId") === "none") {
      formData.delete("teamId");
    }

    startTransition(async () => {
      const result = await enviarConviteAdmin(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Convite enviado.");
      form.reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo convite</DialogTitle>
          <DialogDescription>
            O link enviado abre a criação de conta com o e-mail já fixado.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="invite-email">
                E-mail do destinatário
              </FieldLabel>
              <Input
                id="invite-email"
                name="email"
                placeholder="nome@empresa.com"
                required
                type="email"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="invite-role">Função</FieldLabel>
              <Select name="role" defaultValue="member">
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatOrganizationRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="invite-team">Equipe inicial</FieldLabel>
              <Select name="teamId" defaultValue="none">
                <SelectTrigger id="invite-team" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma equipe inicial</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {formatAdminName(team.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="invite-msg">Mensagem</FieldLabel>
              <Textarea id="invite-msg" name="mensagem" rows={3} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: Date | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}
