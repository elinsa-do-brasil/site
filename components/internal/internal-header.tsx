"use client";

import Link from "next/link";
import { AccountLogged } from "../account-logged";
import { NavigationMenu, NavigationMenuList } from "../ui/navigation-menu";
import { ThemeToggle } from "../ui/theme-toggle";
import { NavigationMenuItem } from "./navigation-menu-item";

export function InternalHeader() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-4 pointer-events-none">
      <header className="pointer-events-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl border border-border/80 bg-card/90 px-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
              {/** biome-ignore lint/performance/noImgElement: <usado para renderizar o svg do logo diretamente> */}
              <img src="/svg/e.svg" alt="Logo" width={18} height={18} />
            </div>
            <span className="font-semibold text-foreground tracking-tight hover:text-elinsa-dark">
              Elinsa do Brasil
            </span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem href="/portal/blog" text="Blog" />
              <NavigationMenuItem href="/portal" text="Portal" />
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AccountLogged />
        </div>
      </header>
    </div>
  );
}
