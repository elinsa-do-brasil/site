"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { SignOutDropdown } from "./auth/buttons/sign-out-dropdown";

export function AccountLogged() {
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={session.user.image || undefined} />
          <AvatarFallback>
            {session.user.name
              ? session.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "E"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Olá, {session?.user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracoes">
            <Settings />
            Configurações
          </Link>
        </DropdownMenuItem>
        <SignOutDropdown />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
