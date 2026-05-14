"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  adicionarMembroExistente,
  enviarConviteAdmin,
} from "@/lib/organization/actions";
import { formatOrganizationRole } from "@/lib/organization/constants";
import { cn } from "@/lib/utils";

type RegisteredUser = {
  id: string;
  name: string;
  email: string;
};

type ActionResult = {
  error?: string;
  success?: boolean;
};

type TeamInviteDialogProps = {
  isOrgAdmin: boolean;
  registeredUsers: RegisteredUser[];
  roleOptions: string[];
  team: {
    id: string;
    name: string;
  };
  trigger?: ReactNode;
};

export function TeamInviteDialog({
  isOrgAdmin,
  registeredUsers,
  roleOptions,
  team,
  trigger,
}: TeamInviteDialogProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const normalizedEmail = email.trim().toLowerCase();
  const selectedUser =
    registeredUsers.find((user) => user.id === selectedUserId) ??
    registeredUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail,
    );
  const matches = useMemo(() => {
    const query = normalizedEmail;
    if (query.length < 2) return [];

    return registeredUsers
      .filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.name.toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [normalizedEmail, registeredUsers]);

  function reset() {
    setEmail("");
    setSelectedUserId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const action: (formData: FormData) => Promise<ActionResult> = selectedUser
      ? adicionarMembroExistente
      : enviarConviteAdmin;
    const successMessage = selectedUser
      ? "Membro vinculado à equipe."
      : "Convite enviado.";

    startTransition(async () => {
      const result = await action(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(successMessage);
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="secondary">
            <UserPlus className="size-4" />
            Convidar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar para {formatTeamName(team.name)}</DialogTitle>
          <DialogDescription>
            Pesquise uma conta já cadastrada pelo e-mail ou envie um convite
            para alguém novo.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="teamId" type="hidden" value={team.id} />
          {!isOrgAdmin && <input name="role" type="hidden" value="member" />}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`invite-${team.id}-email`}>
                E-mail
              </FieldLabel>
              <Input
                autoComplete="email"
                id={`invite-${team.id}-email`}
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSelectedUserId(null);
                }}
                placeholder="nome@empresa.com"
                required
                type="email"
                value={email}
              />
            </Field>

            {matches.length > 0 && (
              <div className="rounded-md border bg-background p-1">
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  Usuários encontrados
                </p>
                <div className="grid gap-1">
                  {matches.map((user) => (
                    <button
                      className={cn(
                        "rounded-md px-2 py-2 text-left text-sm transition hover:bg-muted",
                        selectedUser?.id === user.id && "bg-muted",
                      )}
                      key={user.id}
                      onClick={() => {
                        setEmail(user.email);
                        setSelectedUserId(user.id);
                      }}
                      type="button"
                    >
                      <span className="block font-medium">{user.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="rounded-md border border-elinsa-primary/25 bg-elinsa-primary/5 px-3 py-2 text-sm">
                <span className="font-medium">{selectedUser.name}</span>
                <span className="ml-2 text-muted-foreground">
                  será vinculado diretamente à equipe.
                </span>
              </div>
            )}

            {isOrgAdmin && (
              <Field>
                <FieldLabel htmlFor={`invite-${team.id}-role`}>
                  Função na organização
                </FieldLabel>
                <Select name="role" defaultValue="member">
                  <SelectTrigger
                    className="w-full"
                    id={`invite-${team.id}-role`}
                  >
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
            )}

            {!selectedUser && (
              <Field>
                <FieldLabel htmlFor={`invite-${team.id}-message`}>
                  Mensagem
                </FieldLabel>
                <Textarea
                  id={`invite-${team.id}-message`}
                  name="mensagem"
                  rows={3}
                />
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button disabled={isPending} type="submit">
              <UserPlus className="size-4" />
              {selectedUser ? "Adicionar à equipe" : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatTeamName(value: string) {
  return value.replace(/_/g, " ");
}
