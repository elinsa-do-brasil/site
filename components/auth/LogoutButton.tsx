"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

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
