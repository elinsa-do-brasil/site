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
  const skipLink = (
    <a className="skip-link" data-skip-link href="#conteudo-principal">
      Pular para o conteúdo
    </a>
  );

  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    return (
      <div className="min-h-screen bg-muted/30" data-frontend-shell="portal">
        {skipLink}
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
        {skipLink}
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
        {skipLink}
        {children}
        <Toaster />
      </div>
    );
  }

  if (isMapRoute) {
    return (
      <>
        {skipLink}
        <div data-frontend-shell-main id="conteudo-principal">
          {children}
        </div>
        <Toaster />
      </>
    );
  }

  return (
    <>
      {skipLink}
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
