"use client"

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DropdownMenuItem } from "../../ui/dropdown-menu";

export function SignOutDropdown() {
  const router = useRouter();

  return (
    <DropdownMenuItem 
      variant="destructive"
      onClick={async () => await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/entrar"); // redirect to login page
          },
        },
      })}
    >
      <LogOut /> Sair
    </DropdownMenuItem>
  );
}