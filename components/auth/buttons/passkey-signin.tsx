"use client";

import { FingerprintPatternIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function PasskeySignInButton({
  onAuthenticated,
  redirectTo = "/portal",
}: {
  onAuthenticated?: () => void;
  redirectTo?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="xl"
      type="button"
      disabled={isPending}
      onClick={async () =>
        await authClient.signIn.passkey({
          fetchOptions: {
            onRequest: () => setIsPending(true),
            onSuccess(context) {
              onAuthenticated?.();
              toast.success(`Bem-vindo(a), ${context.data.user.name}!`);
              router.replace(redirectTo);
            },
            onError(context) {
              setIsPending(false);
              toast.error(
                `Erro ao entrar com Passkey: ${context.error.message}`,
              );
            },
          },
        })
      }
    >
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <>
          <HugeiconsIcon
            data-icon="inline-start"
            icon={FingerprintPatternIcon}
            strokeWidth={2}
          />
          Entrar com Passkey
        </>
      )}
    </Button>
  );
}
