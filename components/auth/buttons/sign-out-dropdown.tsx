"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { DropdownMenuItem } from "../../ui/dropdown-menu";

// Mesma chamada de signOut de components/auth/logout-button.tsx, só que como item de menu (para o dropdown do avatar no header) em vez de botão avulso.
export function SignOutDropdown() {
  const router = useRouter();

  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={async () =>
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/entrar"); // redirect to login page
            },
          },
        })
      }
    >
      <LogOut /> Sair
    </DropdownMenuItem>
  );
}
