"use client";

import { Plus, UserPlus } from "lucide-react";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
  adicionarMembroExistente,
  atualizarFuncaoMembro,
  excluirRoleOrganizacao,
  excluirUsuarioDoPortal,
  removerMembroDaOrganizacao,
  salvarRoleOrganizacao,
} from "@/lib/organization/actions";
import { formatOrganizationRole } from "@/lib/organization/constants";
import { cn } from "@/lib/utils";

type TeamOption = {
  id: string;
  name: string;
};

type MemberRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  teams: string[];
  createdAt: string;
};

type RoleRow = {
  id: string;
  role: string;
  permission: string;
};

type OrganizacaoAdminProps = {
  members: MemberRow[];
  pendingInvitationCount: number;
  roleOptions: string[];
  roles: RoleRow[];
  teams: TeamOption[];
};

export function OrganizacaoAdmin({
  members,
  pendingInvitationCount,
  roleOptions,
  roles,
  teams,
}: OrganizacaoAdminProps) {
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const normalizedMemberSearch = normalizeSearch(memberSearch);
  const visibleMembers = members.filter(
    (member) =>
      matchesMemberSearch(member, normalizedMemberSearch) &&
      matchesMemberRole(member, roleFilter) &&
      matchesMemberTeam(member, teamFilter),
  );
  const ownerCount = members.filter((member) =>
    member.role
      .split(",")
      .map((role) => role.trim())
      .includes("owner"),
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Membros" value={members.length} />
        <MetricCard label="Equipes" value={teams.length} />
        <MetricCard label="Convites pendentes" value={pendingInvitationCount} />
        <MetricCard label="Proprietários" value={ownerCount} />
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Membros da organização</CardTitle>
          <CardDescription>
            Controle o vínculo institucional, as funções e a conta de acesso ao
            portal.
          </CardDescription>
          <CardAction className="flex gap-2">
            <AddExistingMemberDialog
              roleOptions={roleOptions}
              teams={teams}
              trigger={
                <Button type="button" size="sm">
                  <UserPlus data-icon="inline-start" />
                  Adicionar membro
                </Button>
              }
            />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
            <Input
              aria-label="Buscar membros por nome ou e-mail"
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Buscar por nome ou e-mail"
              type="search"
              value={memberSearch}
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger aria-label="Filtrar membros por função">
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
              <SelectTrigger aria-label="Filtrar membros por equipe">
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
          <div className="divide-y rounded-md border">
            {visibleMembers.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                roleOptions={roleOptions}
              />
            ))}
            {members.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Nenhum membro vinculado à organização.
              </div>
            )}
            {members.length > 0 && visibleMembers.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Nenhum membro encontrado para esta busca.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Funções customizadas</CardTitle>
          <CardDescription>
            Nomeie funções em português claro e use o identificador apenas para
            controle interno.
          </CardDescription>
          <CardAction>
            <RoleDialog
              trigger={
                <Button type="button" variant="outline" size="sm">
                  <Plus data-icon="inline-start" />
                  Nova função
                </Button>
              }
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {roles.map((role) => (
              <RoleItem key={role.id} role={role} />
            ))}
            {roles.length === 0 && (
              <div className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground md:col-span-2">
                Nenhuma função customizada criada.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-md" size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function matchesMemberSearch(member: MemberRow, normalizedSearch: string) {
  if (!normalizedSearch) {
    return true;
  }

  return normalizeSearch([member.name, member.email].join(" ")).includes(
    normalizedSearch,
  );
}

function matchesMemberRole(member: MemberRow, roleFilter: string) {
  if (roleFilter === "all") {
    return true;
  }

  return member.role
    .split(",")
    .map((role) => role.trim())
    .includes(roleFilter);
}

function matchesMemberTeam(member: MemberRow, teamFilter: string) {
  if (teamFilter === "all") {
    return true;
  }

  if (teamFilter === "none") {
    return member.teams.length === 0;
  }

  return member.teams.includes(teamFilter);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function MemberItem({
  member,
  roleOptions,
}: {
  member: MemberRow;
  roleOptions: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRoleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await atualizarFuncaoMembro(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Função atualizada.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{member.name}</p>
          <Badge variant="outline">{formatOrganizationRole(member.role)}</Badge>
        </div>
        <p className="truncate text-sm text-muted-foreground">{member.email}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {member.teams.length > 0 ? (
            member.teams.map((team) => (
              <Badge key={team} variant="secondary">
                {formatAdminName(team)}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Sem equipe</span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:items-end">
        <form
          onSubmit={handleRoleSubmit}
          className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <input
            name="memberId"
            type="hidden"
            defaultValue={member.id}
            style={{ caretColor: "transparent" }}
            suppressHydrationWarning
          />
          <RoleSelect
            currentRole={member.role}
            label={`Função de ${member.email}`}
            roles={roleOptions}
          />
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? <Spinner /> : "Salvar"}
          </Button>
        </form>

        <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
          <ConfirmActionDialog
            action={() => removerMembroDaOrganizacao(member.id)}
            confirmLabel="Remover vínculo"
            description={
              <>
                {member.name} perderá o acesso às áreas internas desta
                organização, mas a conta de login continuará existindo.
              </>
            }
            onSuccess={() => router.refresh()}
            successMessage="Membro removido da organização."
            title="Remover da organização?"
            trigger={
              <Button type="button" variant="outline">
                Remover vínculo
              </Button>
            }
          />
          <ConfirmActionDialog
            action={() => excluirUsuarioDoPortal(member.userId)}
            confirmLabel="Excluir conta"
            description={
              <>
                Esta ação apaga a conta de {member.email} do portal, incluindo
                sessões e vínculos internos relacionados.
              </>
            }
            onSuccess={() => router.refresh()}
            successMessage="Conta excluída do portal."
            title="Excluir usuário do portal?"
            trigger={
              <Button type="button" variant="destructive">
                Excluir conta
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}

function AddExistingMemberDialog({
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
      const result = await adicionarMembroExistente(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Membro adicionado.");
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
          <DialogTitle>Adicionar conta existente</DialogTitle>
          <DialogDescription>
            Use esta opção para vincular uma conta que já foi criada no portal.
            Para novas pessoas, envie um convite.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="member-email">E-mail</FieldLabel>
              <Input
                id="member-email"
                name="email"
                placeholder="nome@empresa.com"
                type="email"
                required
              />
            </Field>
            <RoleSelect id="member-role" roles={roleOptions} />
            <TeamSelect id="member-team" teams={teams} />
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : "Adicionar membro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleDialog({ trigger }: { trigger: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await salvarRoleOrganizacao(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Função salva.");
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
          <DialogTitle>Nova função</DialogTitle>
          <DialogDescription>
            Crie um identificador curto e uma descrição de uso compreensível
            para administradores.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="role-name">Identificador</FieldLabel>
              <Input
                id="role-name"
                name="role"
                placeholder="aprovador_financeiro"
                required
              />
              <FieldDescription>
                Use letras, números e sublinhado. O sistema transforma o nome
                automaticamente.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="role-permission">Descrição</FieldLabel>
              <Textarea
                id="role-permission"
                name="permission"
                placeholder="Quando esta função deve ser usada?"
                rows={3}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : "Salvar função"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleItem({ role }: { role: RoleRow }) {
  const router = useRouter();

  return (
    <div className="rounded-md border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{formatOrganizationRole(role.role)}</p>
          <p className="text-xs text-muted-foreground">{role.role}</p>
        </div>
        <ConfirmActionDialog
          action={() => excluirRoleOrganizacao(role.id)}
          confirmLabel="Excluir função"
          description="A função só pode ser excluída se não estiver atribuída a nenhum membro."
          onSuccess={() => router.refresh()}
          successMessage="Função excluída."
          title="Excluir função?"
          trigger={
            <Button type="button" variant="ghost">
              Excluir
            </Button>
          }
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {role.permission || "Sem descrição registrada."}
      </p>
    </div>
  );
}

function RoleSelect({
  className,
  currentRole = "member",
  id,
  label = "Função",
  roles,
}: {
  className?: string;
  currentRole?: string;
  id?: string;
  label?: string;
  roles: string[];
}) {
  const options = Array.from(new Set([currentRole, ...roles]));

  return (
    <Select name="role" defaultValue={currentRole}>
      <SelectTrigger
        id={id}
        aria-label={label}
        className={cn("w-full min-w-0", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((role) => (
          <SelectItem key={role} value={role}>
            {formatOrganizationRole(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TeamSelect({ id, teams }: { id: string; teams: TeamOption[] }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Equipe inicial</FieldLabel>
      <Select name="teamId" defaultValue="none">
        <SelectTrigger id={id} className="w-full">
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
  );
}
