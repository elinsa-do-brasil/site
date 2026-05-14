"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InternalHeader } from "@/components/internal/internal-header";
import { Toaster } from "@/components/ui/sonner";

const accountRoutes = [
  "/convite",
  "/criar",
  "/entrar",
  "/recuperar-senha",
  "/redefinir-senha",
  "/verificar-email",
];

function isAccountRoute(pathname: string) {
  return accountRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function FrontendShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";

  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    return (
      <div className="min-h-screen bg-muted/30">
        <InternalHeader />
        <main className="pt-24">{children}</main>
        <Toaster />
      </div>
    );
  }

  if (isAccountRoute(pathname)) {
    return (
      <div className="min-h-screen bg-muted/30">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </>
  );
}
