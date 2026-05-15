import { Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function PasskeySignInButton() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size={"lg"}
      type="button"
      disabled={isPending}
      onClick={async () =>
        await authClient.signIn.passkey({
          fetchOptions: {
            onRequest: () => setIsPending(true),
            onSuccess(context) {
              setIsPending(false);
              toast.success(`Bem-vindo(a), ${context.data.user.name}!`);
              router.push("/portal");
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
        <Spinner />
      ) : (
        <>
          <Key /> Entrar com Passkey
        </>
      )}
    </Button>
  );
}
