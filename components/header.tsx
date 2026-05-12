"use client";

import {
  AiUserIcon,
  Alert01Icon,
  Building01Icon,
  DashboardSquareEditIcon,
  Globe02Icon,
  LayoutGridIcon,
  Megaphone01Icon,
  News01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import LogoIcon from "@/public/images/logo-icon.webp";
import { ThemeToggle } from "./ui/theme-toggle";

export function Header() {
  const pathname = usePathname();

  if (pathname?.startsWith("/mapas")) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-4 pointer-events-none">
      <header className="pointer-events-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl border border-border/80 bg-card/90 px-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
              <Image src={LogoIcon} alt="Logo" width={18} height={18} />
            </div>
            <span className="font-semibold text-foreground tracking-tight hover:text-elinsa-dark">
              Elinsa do Brasil
            </span>
          </Link>

          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem className="">
                  <NavigationMenuTrigger className="bg-transparent">
                    Conteúdo
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-4 w-150 grid-cols-2 p-4">
                      {/* Left Column */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground px-2">
                          Institucional
                        </h4>
                        <ul className="flex flex-col gap-2">
                          <DropdownItem
                            href="/quem-somos"
                            icon={Building01Icon}
                            title="Quem somos"
                            description="Histórico, missão, visão e valores"
                          />
                          <DropdownItem
                            href="/vagas"
                            icon={AiUserIcon}
                            title="Carreiras"
                            description="Oportunidades de trabalho e vagas"
                          />
                        </ul>
                      </div>

                      {/* Right Column */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground px-2">
                          Comunicação
                        </h4>
                        <ul className="flex flex-col gap-2">
                          <DropdownItem
                            href="/imprensa"
                            icon={Megaphone01Icon}
                            title="Imprensa"
                            description="Comunicados sobre a empresa"
                          />
                          <DropdownItem
                            href="/kit-de-marca"
                            icon={LayoutGridIcon}
                            title="Kit de marca"
                            description="Logo, cores, fontes e mais"
                          />
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Social
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-4 w-64 grid-cols-1 p-4">
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground px-2">
                          Social
                        </h4>
                        <ul className="flex flex-col gap-2">
                          <DropdownItem
                            href="https://www.instagram.com/elinsadobrasil/"
                            icon={FaInstagram}
                            title="Instagram"
                            description="Acompanhe as novidades"
                            isExternal
                            isReactIcon
                          />
                          <DropdownItem
                            href="https://www.linkedin.com/in/elinsadobrasil/"
                            icon={FaLinkedin}
                            title="LinkedIn"
                            description="Conecte-se conosco"
                            isExternal
                            isReactIcon
                          />
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/contato"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent",
                    )}
                  >
                    Contato
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button className="hidden h-9 rounded-md px-4 font-medium sm:inline-flex">
                Portal Interno
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Ferramentas internas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/ferramentas" className="cursor-pointer w-full">
                  <HugeiconsIcon icon={Globe02Icon} /> Ferramentas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/blog" className="cursor-pointer w-full">
                  <HugeiconsIcon icon={News01Icon} /> Blog interno
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/denunciar" className="cursor-pointer w-full">
                  <HugeiconsIcon icon={Alert01Icon} /> Canal de denúncias
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/payload" className="cursor-pointer w-full">
                  <HugeiconsIcon icon={DashboardSquareEditIcon} />
                  Painel de controle
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}

function DropdownItem({
  href,
  icon: Icon,
  title,
  description,
  isExternal,
  isReactIcon,
}: {
  href: string;
  // biome-ignore lint/suspicious/noExplicitAny: Os ícones podem vir de qualquer biblioteca
  icon: any;
  title: string;
  description: string;
  isExternal?: boolean;
  isReactIcon?: boolean;
}) {
  const content = (
    <>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted border border-border">
        {isReactIcon ? (
          <Icon className="size-4 text-muted-foreground" />
        ) : (
          <HugeiconsIcon icon={Icon} className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {description && (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </span>
        )}
      </div>
    </>
  );

  return (
    <li>
      <NavigationMenuLink asChild>
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent focus:bg-accent outline-none"
          >
            {content}
          </a>
        ) : (
          <Link
            href={href}
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent focus:bg-accent outline-none"
          >
            {content}
          </Link>
        )}
      </NavigationMenuLink>
    </li>
  );
}
