"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { InternalHeader } from "@/components/internal/internal-header";
import { Toaster } from "@/components/ui/sonner";

const accountRoutes = [
  "/configuracoes",
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

export function FrontendShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const isMapRoute = pathname === "/mapas" || pathname.startsWith("/mapas/");

  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    return (
      <div className="min-h-screen bg-muted/30" data-frontend-shell="portal">
        <div data-frontend-shell-header>
          <InternalHeader />
        </div>
        <main className="pt-24" data-frontend-shell-main>
          {children}
        </main>
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

  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    return (
      <div className="min-h-screen bg-background" data-frontend-shell="docs">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <>
      {!isMapRoute && (
        <div data-frontend-shell-header>
          <Header />
        </div>
      )}
      <main data-frontend-shell-main>{children}</main>
      {!isMapRoute && footer && <div data-frontend-shell-footer>{footer}</div>}
      <Toaster />
    </>
  );
}
