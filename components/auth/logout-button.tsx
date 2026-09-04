"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";

// Encerra a sessão do Better Auth (lib/authClient.ts) e só redireciona depois do signOut confirmar — evita navegar para uma página protegida que ainda vê a sessão antiga por uma fração de segundo.
export function BotaoSair({
  label = "Sair",
  redirectTo = "/entrar",
}: {
  label?: string;
  redirectTo?: string;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(redirectTo);
        },
      },
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      {label}
    </Button>
  );
}
