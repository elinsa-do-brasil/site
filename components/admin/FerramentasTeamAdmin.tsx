"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  excluirFerramentaTime,
  salvarFerramentaTime,
} from "@/lib/organization/actions";

type ToolRow = {
  id: string;
  slug: string;
  label: string;
  description: string;
  href: string;
  isActive: boolean;
};

type TeamToolsRow = {
  id: string;
  name: string;
  tools: ToolRow[];
};

type FerramentasTeamAdminProps = {
  teams: TeamToolsRow[];
};

type ActionResult = {
  error?: string;
  success?: boolean;
};

export function FerramentasTeamAdmin({ teams }: FerramentasTeamAdminProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitForm(
    action: (formData: FormData) => Promise<ActionResult>,
    successMessage: string,
    options?: { reset?: boolean },
  ) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);

      startTransition(async () => {
        const result = await action(formData);
        setMessage(result.error ?? successMessage);
        if (!result.error && options?.reset) {
          form.reset();
        }
      });
    };
  }

  function runAction(
    action: () => Promise<ActionResult>,
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.error ?? successMessage);
    });
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-md border bg-card px-4 py-3 text-sm">
          {message}
        </div>
      )}

      {teams.map((team) => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>
              Ferramentas adicionadas aqui aparecem nos cards do portal para
              membros deste time.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
            <form
              onSubmit={submitForm(salvarFerramentaTime, "Ferramenta criada.", {
                reset: true,
              })}
            >
              <FieldGroup>
                <input name="teamId" type="hidden" value={team.id} />
                <Field>
                  <FieldLabel htmlFor={`${team.id}-tool-slug`}>
                    Identificador
                  </FieldLabel>
                  <Input
                    id={`${team.id}-tool-slug`}
                    name="slug"
                    placeholder="painel_financeiro"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${team.id}-tool-label`}>
                    Título do card
                  </FieldLabel>
                  <Input
                    id={`${team.id}-tool-label`}
                    name="label"
                    placeholder="Painel financeiro"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${team.id}-tool-description`}>
                    Descrição
                  </FieldLabel>
                  <Textarea
                    id={`${team.id}-tool-description`}
                    name="description"
                    rows={3}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${team.id}-tool-href`}>Link</FieldLabel>
                  <Input
                    id={`${team.id}-tool-href`}
                    name="href"
                    placeholder="/portal/..."
                    required
                  />
                </Field>
                <label
                  className="flex items-center gap-2 text-sm"
                  htmlFor={`${team.id}-tool-active`}
                >
                  <Checkbox
                    id={`${team.id}-tool-active`}
                    name="isActive"
                    defaultChecked
                  />
                  Ativo no portal
                </label>
                <Button type="submit" disabled={isPending}>
                  Criar ferramenta
                </Button>
              </FieldGroup>
            </form>

            <div className="space-y-3">
              {team.tools.map((tool) => (
                <div key={tool.id} className="rounded-md border p-4">
                  <form
                    className="grid gap-3 lg:grid-cols-2"
                    onSubmit={submitForm(
                      salvarFerramentaTime,
                      "Ferramenta atualizada.",
                    )}
                  >
                    <input name="toolId" type="hidden" value={tool.id} />
                    <input name="teamId" type="hidden" value={team.id} />
                    <Field>
                      <FieldLabel htmlFor={`${tool.id}-slug`}>
                        Identificador
                      </FieldLabel>
                      <Input
                        id={`${tool.id}-slug`}
                        name="slug"
                        defaultValue={tool.slug}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${tool.id}-label`}>
                        Título
                      </FieldLabel>
                      <Input
                        id={`${tool.id}-label`}
                        name="label"
                        defaultValue={tool.label}
                        required
                      />
                    </Field>
                    <Field className="lg:col-span-2">
                      <FieldLabel htmlFor={`${tool.id}-description`}>
                        Descrição
                      </FieldLabel>
                      <Textarea
                        id={`${tool.id}-description`}
                        name="description"
                        defaultValue={tool.description}
                        rows={2}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${tool.id}-href`}>Link</FieldLabel>
                      <Input
                        id={`${tool.id}-href`}
                        name="href"
                        defaultValue={tool.href}
                        required
                      />
                    </Field>
                    <div className="flex items-end justify-between gap-3">
                      <label
                        className="flex items-center gap-2 pb-2 text-sm"
                        htmlFor={`${tool.id}-active`}
                      >
                        <Checkbox
                          id={`${tool.id}-active`}
                          name="isActive"
                          defaultChecked={tool.isActive}
                        />
                        Ativo
                      </label>
                      <Badge variant={tool.isActive ? "default" : "outline"}>
                        {tool.isActive ? "ativo" : "oculto"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 lg:col-span-2">
                      <Button
                        type="submit"
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                      >
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={isPending}
                        onClick={() =>
                          runAction(
                            () => excluirFerramentaTime(tool.id),
                            "Ferramenta excluída.",
                          )
                        }
                      >
                        Excluir
                      </Button>
                    </div>
                  </form>
                </div>
              ))}

              {team.tools.length === 0 && (
                <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
                  Nenhuma ferramenta configurada para este time.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {teams.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum time disponível para administração de ferramentas.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
