"use client";

// dependências:
import { useState } from "react";
import type { IconType } from "react-icons";
import { toast } from "sonner";

// componentes:
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// funções:
import { authClient } from "@/lib/auth-client";

type OAuthProvider = "github" | "google" | "microsoft"; // vai só expandindo aqui

interface OAuthButtonBaseProps {
  provider: OAuthProvider;
  icon: IconType;
  label: string;
  callbackURL?: string;
  className?: string;
  variant?: "default" | "outline";
}

export function OAuthButtonBase({
  provider,
  icon: Icon,
  label,
  callbackURL,
  className,
  variant = "outline",
}: OAuthButtonBaseProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const isMicrosoft = provider === "microsoft";
      const result = await authClient.signIn.social({
        provider,
        callbackURL,
        disableRedirect: isMicrosoft,
      });

      if (result.error) {
        setLoading(false);
        toast.error(
          result.error.message || "Não foi possível entrar com este provedor.",
        );
        return;
      }

      if (isMicrosoft && result.data?.url) {
        const authorizationUrl = new URL(result.data.url);
        authorizationUrl.searchParams.set(
          "domain_hint",
          "grupoamperelinsa.com",
        );
        window.location.assign(authorizationUrl);
      }
    } catch {
      setLoading(false);
      toast.error("Não foi possível iniciar o login agora.");
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={loading}
      size="xl"
      type="button"
    >
      {loading ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Icon data-icon="inline-start" />
      )}
      {label}
    </Button>
  );
}
