import {
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  HouseIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const helpfulLinks = [
  {
    href: "/vagas",
    label: "Ver oportunidades",
    icon: BriefcaseBusinessIcon,
  },
  {
    href: "/contato",
    label: "Falar com a Elinsa",
    icon: MessageCircleIcon,
  },
  {
    href: "/denunciar",
    label: "Canal de denúncias",
    icon: ShieldCheckIcon,
  },
] as const;

export function NotFoundView({ as = "main" }: { as?: "main" | "div" }) {
  const Root = as;

  return (
    <Root
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden px-4 py-10 text-foreground sm:px-6 sm:py-16",
        as === "main" ? "min-h-dvh" : "min-h-[calc(100dvh-6rem)]",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_srgb,var(--elinsa-primary)_14%,transparent),transparent_30%),radial-gradient(circle_at_85%_80%,color-mix(in_srgb,var(--elinsa-dark)_10%,transparent),transparent_34%)]"
      />

      <section
        aria-labelledby="not-found-title"
        className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-panel md:grid-cols-[minmax(16rem,0.75fr)_minmax(0,1.25fr)]"
      >
        <div className="relative flex min-h-60 flex-col justify-between overflow-hidden bg-elinsa-dark p-6 text-white sm:p-8 md:min-h-[31rem]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 size-64 rounded-full border border-white/20"
          />

          <Link
            href="/"
            aria-label="Elinsa do Brasil — voltar à página inicial"
            className="relative w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            {/** biome-ignore lint/performance/noImgElement: o logotipo é um SVG local e precisa preservar suas cores originais. */}
            <img
              src="/svg/logo-branco.svg"
              alt="Elinsa do Brasil"
              className="h-14 w-auto"
            />
          </Link>

          <div className="relative mt-12 md:mt-0">
            <p className="font-mono text-[5.5rem] font-bold leading-none tracking-[-0.08em] text-white sm:text-8xl">
              404
            </p>
            <p className="mt-3 max-w-48 text-sm leading-6 text-white/65">
              Você saiu da rota, mas ainda está no caminho certo.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-9 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-elinsa-primary">
            Página não encontrada
          </p>
          <h1
            className="mt-3 text-pretty text-3xl font-bold tracking-tight sm:text-4xl"
            id="not-found-title"
          >
            Essa página saiu da rota.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            O endereço pode ter mudado, estar incompleto ou não existir mais.
            Você pode voltar ao início ou escolher um dos caminhos abaixo.
          </p>

          <Button className="mt-7 w-full sm:w-fit" size="xl2" asChild>
            <Link href="/">
              <HouseIcon aria-hidden="true" data-icon="inline-start" />
              Voltar à página inicial
              <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
            </Link>
          </Button>

          <nav
            aria-label="Atalhos para continuar navegando"
            className="mt-8 border-t border-border/80 pt-6"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Talvez você esteja procurando
            </p>
            <ul className="grid gap-2">
              {helpfulLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex min-h-10 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          aria-hidden="true"
                          className="size-4 text-elinsa-primary"
                        />
                        {item.label}
                      </span>
                      <ArrowRightIcon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>
    </Root>
  );
}
