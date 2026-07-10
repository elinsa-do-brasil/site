import {
  AiUserIcon,
  Alert01Icon,
  Building01Icon,
  GoogleDocIcon,
  InstagramIcon,
  LayoutGridIcon,
  LegalDocument01Icon,
  LighthouseIcon,
  Linkedin01Icon,
  Megaphone01Icon,
  Menu01Icon,
  NotificationSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getDocsUrl } from "@/lib/docs-url";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ui/theme-toggle";

export function Header() {
  const pathname = usePathname();

  if (pathname?.startsWith("/mapas")) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-3 pointer-events-none sm:p-4">
      <header className="pointer-events-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/90 px-3 shadow-sm backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
              {/** biome-ignore lint/performance/noImgElement: <usado para renderizar o svg do logo diretamente> */}
              <img src="/svg/e.svg" alt="Logo" width={18} height={18} />
            </div>
            <span className="truncate text-sm font-semibold tracking-tight text-foreground hover:text-elinsa-primary sm:text-base">
              Elinsa do Brasil
            </span>
          </Link>

          <div className="hidden md:block">
            <NavigationMenu aria-label="Principal">
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
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
                            href="/marca"
                            icon={LayoutGridIcon}
                            title="Kit de marca"
                            description="Cores e logos oficiais"
                          />
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Apoio
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-4 w-150 grid-cols-2 p-4">
                      {/* Left Column */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground px-2">
                          Documentação
                        </h4>
                        <ul className="flex flex-col gap-2">
                          <DropdownItem
                            href={getDocsUrl()}
                            icon={LighthouseIcon}
                            title="Ajuda ao colaborador"
                            description="Orientações e materiais úteis"
                          />
                          <DropdownItem
                            href={getDocsUrl()}
                            icon={GoogleDocIcon}
                            title="Documentação"
                            description="Guias, políticas institucionais"
                          />
                        </ul>
                      </div>

                      {/* Right Column */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground px-2">
                          Ética
                        </h4>
                        <ul className="flex flex-col gap-2">
                          <DropdownItem
                            href={getDocsUrl("/etica/codigo-de-conduta")}
                            icon={LegalDocument01Icon}
                            title="Código de conduta"
                            description="As diretrizes da nossa atuação"
                          />
                          <DropdownItem
                            href="/denunciar"
                            icon={Alert01Icon}
                            title="Canal de denúncias"
                            description="Denuncie de forma segura"
                          />
                          <DropdownItem
                            href="/acompanhar-denuncia"
                            icon={NotificationSquareIcon}
                            title="Acompanhar denúncia"
                            description="Verifique o status de sua denúncia"
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center md:flex">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://www.instagram.com/elinsadobrasil/"
                aria-label="Instagram da Elinsa do Brasil"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={InstagramIcon}
                  strokeWidth={2}
                />
              </a>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://www.linkedin.com/in/elinsadobrasil/"
                aria-label="LinkedIn da Elinsa do Brasil"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={Linkedin01Icon}
                  strokeWidth={2}
                />
              </a>
            </Button>
          </div>

          <MobileMenu />
          <ThemeToggle />

          <Button asChild size="lg">
            <Link href="/entrar" className="px-3 font-medium sm:px-4">
              Entrar
            </Link>
          </Button>
        </div>
      </header>
    </div>
  );
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label="Abrir menu"
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
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navegação principal da Elinsa.</SheetDescription>
        </SheetHeader>

        <nav
          aria-label="Menu principal"
          className="flex flex-1 flex-col gap-5 overflow-y-auto p-6"
        >
          <MobileNavSection title="Conteúdo">
            <MobileNavLink
              href="/quem-somos"
              icon={Building01Icon}
              title="Quem somos"
              description="Histórico, missão, visão e valores"
            />
            <MobileNavLink
              href="/imprensa"
              icon={Megaphone01Icon}
              title="Imprensa"
              description="Comunicados sobre a empresa"
            />
            <MobileNavLink
              href="/vagas"
              icon={AiUserIcon}
              title="Carreiras"
              description="Oportunidades de trabalho"
            />
            <MobileNavLink
              href="/marca"
              icon={LayoutGridIcon}
              title="Kit de marca"
              description="Cores e logos oficiais"
            />
          </MobileNavSection>

          <MobileNavSection title="Apoio">
            <MobileNavLink
              href={getDocsUrl()}
              icon={LighthouseIcon}
              title="Ajuda ao colaborador"
              description="Orientações e materiais úteis"
            />
            <MobileNavLink
              href={getDocsUrl("/etica/codigo-de-conduta")}
              icon={LegalDocument01Icon}
              title="Código de conduta"
              description="Diretrizes da nossa atuação"
            />
            <MobileNavLink
              href="/denunciar"
              icon={Alert01Icon}
              title="Canal de denúncias"
              description="Denuncie de forma segura"
            />
            <MobileNavLink
              href="/acompanhar-denuncia"
              icon={NotificationSquareIcon}
              title="Acompanhar denúncia"
              description="Verifique o status"
            />
          </MobileNavSection>

          <MobileNavSection title="Contato e redes">
            <MobileNavLink href="/contato" title="Contato" />
            <MobileNavLink
              href="https://www.instagram.com/elinsadobrasil/"
              icon={InstagramIcon}
              isExternal
              title="Instagram"
            />
            <MobileNavLink
              href="https://www.linkedin.com/in/elinsadobrasil/"
              icon={Linkedin01Icon}
              isExternal
              title="LinkedIn"
            />
          </MobileNavSection>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h2>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
}

function MobileNavLink({
  description,
  href,
  icon: Icon,
  isExternal,
  title,
}: {
  description?: string;
  href: string;
  // biome-ignore lint/suspicious/noExplicitAny: Os ícones podem vir de qualquer biblioteca
  icon?: any;
  isExternal?: boolean;
  title: string;
}) {
  const className =
    "flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";
  const content = (
    <>
      {Icon ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
          <HugeiconsIcon aria-hidden="true" icon={Icon} strokeWidth={2} />
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <SheetClose asChild>
      {isExternal ? (
        <a
          className={className}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        <Link className={className} href={href}>
          {content}
        </Link>
      )}
    </SheetClose>
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
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent focus:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {content}
          </a>
        ) : (
          <Link
            href={href}
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent focus:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {content}
          </Link>
        )}
      </NavigationMenuLink>
    </li>
  );
}
