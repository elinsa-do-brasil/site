"use client";

import { CgMicrosoft } from "react-icons/cg";
import { OAuthButtonBase } from "@/components/auth/buttons/oauth-button-base";

interface ProviderButtonProps {
  callbackURL?: string;
  className?: string;
}

// cada botão desses só vai pro bundle se você importar ele em alguma página
export function MicrosoftOauthButton(props: ProviderButtonProps) {
  return (
    <OAuthButtonBase
      provider="microsoft"
      icon={CgMicrosoft}
      label="Entrar com a Microsoft"
      {...props}
    />
  );
}
