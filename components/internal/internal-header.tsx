"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { AccountLogged } from "../account-logged";
import { FloatingHeader } from "../floating-header";
import { Button } from "../ui/button";
import { NavigationMenu, NavigationMenuList } from "../ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { ThemeToggle } from "../ui/theme-toggle";
import { NavigationMenuItem } from "./navigation-menu-item";

export function InternalHeader() {
  return (
    <FloatingHeader>
      <div className="flex min-w-0 items-center gap-4 sm:gap-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
            {/** biome-ignore lint/performance/noImgElement: <usado para renderizar o svg do logo diretamente> */}
            <img src="/svg/e.svg" alt="Logo" width={18} height={18} />
          </div>
          <span className="truncate text-sm font-semibold tracking-tight text-foreground hover:text-elinsa-primary sm:text-base">
            <span className="sm:hidden">Elinsa</span>
            <span className="hidden sm:inline">Elinsa do Brasil</span>
          </span>
        </Link>

        <NavigationMenu aria-label="Portal" className="hidden md:block">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem href="/portal/blog" text="Blog" />
            <NavigationMenuItem href="/portal" text="Portal" />
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <PortalMobileMenu />
        <ThemeToggle />
        <AccountLogged />
      </div>
    </FloatingHeader>
  );
}

function PortalMobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label="Abrir menu do portal"
          className="md:hidden"
          size="icon"
          type="button"
          variant="ghost"
        >
          <HugeiconsIcon aria-hidden="true" icon={Menu01Icon} strokeWidth={2} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[min(22rem,calc(100vw-2rem))]" side="right">
        <SheetHeader className="border-b">
          <SheetTitle>Portal interno</SheetTitle>
          <SheetDescription>
            Acesse as áreas disponíveis para a sua conta.
          </SheetDescription>
        </SheetHeader>
        <nav
          aria-label="Navegação do portal"
          className="flex flex-1 flex-col gap-1 p-4"
        >
          <PortalMobileLink href="/portal" label="Visão geral" />
          <PortalMobileLink href="/portal/blog" label="Blog interno" />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function PortalMobileLink({ href, label }: { href: string; label: string }) {
  return (
    <SheetClose asChild>
      <Link
        className="rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        href={href}
      >
        {label}
      </Link>
    </SheetClose>
  );
}
