"use client";

import { Fingerprint, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { deletePasskeyAction } from "../actions";

type PasskeyRecord = {
  id: string;
  name: string | null;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Data não registrada";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não registrada";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(date);
}

function getPasskeyError(error: { code?: string; message?: string } | null) {
  if (!error) return "Não foi possível concluir a ação.";
  if (error.code === "PREVIOUSLY_REGISTERED") {
    return "Essa passkey já está cadastrada nesta conta.";
  }
  if (error.code === "REGISTRATION_CANCELLED") {
    return "Cadastro de passkey cancelado.";
  }
  return error.message || "Não foi possível concluir a ação.";
}

export function PasskeysCard({
  initialPasskeys,
}: {
  initialPasskeys: PasskeyRecord[];
}) {
  const router = useRouter();
  const [passkeys, setPasskeys] = useState(initialPasskeys);
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAddPasskey() {
    setIsAdding(true);
    const result = await authClient.passkey.addPasskey({
      name: name.trim() || undefined,
    });
    setIsAdding(false);

    if (result.error) {
      toast.error(getPasskeyError(result.error));
      return;
    }

    toast.success("Passkey cadastrada.");
    setName("");
    router.refresh();
  }

  async function handleDeletePasskey(id: string) {
    setDeletingId(id);
    const result = await deletePasskeyAction(id);
    setDeletingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setPasskeys((current) => current.filter((passkey) => passkey.id !== id));
    toast.success("Passkey removida.");
    router.refresh();
  }

  return (
    <Card id="passkeys">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="size-4" />
          Passkeys
        </CardTitle>
        <CardDescription>
          Cadastre chaves de acesso para entrar sem senha em dispositivos
          confiáveis.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Field>
          <FieldLabel htmlFor="passkey-name">Nome da nova passkey</FieldLabel>
          <Input
            id="passkey-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Notebook pessoal"
            maxLength={80}
          />
          <FieldDescription>
            O navegador abrirá o fluxo nativo de passkeys ao adicionar.
          </FieldDescription>
        </Field>

        {passkeys.length === 0 ? (
          <div className="rounded-md border bg-muted/20 p-4 text-muted-foreground">
            Nenhuma passkey cadastrada.
          </div>
        ) : (
          <div className="space-y-3">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">
                    {passkey.name || "Passkey sem nome"}
                  </p>
                  <p className="text-muted-foreground">
                    Criada em {formatDate(passkey.createdAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {passkey.deviceType || "dispositivo"}
                    </Badge>
                    {passkey.backedUp && (
                      <Badge variant="secondary">Sincronizada</Badge>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover passkey"
                  onClick={() => handleDeletePasskey(passkey.id)}
                  disabled={deletingId === passkey.id}
                >
                  {deletingId === passkey.id ? (
                    <Spinner />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button type="button" onClick={handleAddPasskey} disabled={isAdding}>
          {isAdding ? <Spinner /> : <Plus className="size-4" />}
          Adicionar passkey
        </Button>
      </CardFooter>
    </Card>
  );
}
