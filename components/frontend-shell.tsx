"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { InternalHeader } from "@/components/internal/internal-header";
import { Toaster } from "@/components/ui/sonner";

const accountRoutes = ["/configuracoes", "/convite", "/criar", "/entrar"];

function isAccountRoute(pathname: string) {
  return accountRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

// Escolhe o "chrome" da página (header público vs. InternalHeader do portal, com ou sem footer) por padrão de rota, já que app/(frontend)/layout.tsx é compartilhado entre grupos de rota bem diferentes (site público, portal autenticado, telas de conta, mapas em tela cheia).
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
        <main
          className="pt-24"
          data-frontend-shell-main
          id="conteudo-principal"
        >
          {children}
        </main>
        <Toaster />
      </div>
    );
  }

  if (pathname === "/configuracoes") {
    return (
      <div className="min-h-screen bg-muted/30" data-frontend-shell="account">
        <div data-frontend-shell-header>
          <InternalHeader />
        </div>
        <main
          className="pt-24"
          data-frontend-shell-main
          id="conteudo-principal"
        >
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

  // /mapas roda em tela cheia, sem o header institucional por cima do mapa interativo.
  if (isMapRoute) {
    return (
      <>
        <div data-frontend-shell-main id="conteudo-principal">
          {children}
        </div>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div data-frontend-shell-header>
        <Header />
      </div>
      <main data-frontend-shell-main id="conteudo-principal">
        {children}
      </main>
      {footer && <div data-frontend-shell-footer>{footer}</div>}
      <Toaster />
    </>
  );
}
