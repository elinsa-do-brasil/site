"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateAccountProfileAction } from "../actions";

type ProfileUser = {
  name?: string | null;
  image?: string | null;
};

function getInitial(name: string) {
  return (name.trim()[0] || "E").toUpperCase();
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [image, setImage] = useState(user.image ?? "");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const result = await updateAccountProfileAction({ name, image });
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Perfil atualizado.");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 rounded-md border bg-muted/20 p-3">
        <Avatar size="lg">
          <AvatarImage src={image.trim() || undefined} />
          <AvatarFallback>{getInitial(name || user.name || "")}</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground">
          A imagem precisa estar disponível por uma URL pública.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="account-name">Nome</FieldLabel>
          <Input
            id="account-name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="account-image">Foto de perfil</FieldLabel>
          <Input
            id="account-image"
            autoComplete="url"
            placeholder="https://exemplo.com/foto.jpg"
            value={image}
            onChange={(event) => setImage(event.target.value)}
          />
          <FieldDescription>
            Deixe em branco para remover a foto.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Spinner /> : "Salvar perfil"}
      </Button>
    </form>
  );
}
