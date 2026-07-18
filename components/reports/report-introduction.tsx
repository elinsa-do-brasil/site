import {
  AlertTriangle,
  ArrowRight,
  BookOpenText,
  CircleHelp,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ReportFlowSteps } from "@/components/reports/report-flow-steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDocsUrl } from "@/lib/docs-url";

const faqItems = [
  {
    question: "Quem pode usar este canal?",
    answer:
      "Qualquer pessoa que conheça uma situação ligada à Elinsa: colaboradores, parceiros, fornecedores, clientes ou alguém do público externo.",
  },
  {
    question: "Que situações podem ser denunciadas?",
    answer:
      "Assédio, discriminação, fraude, corrupção, conflito de interesse, descumprimento de normas, conduta inadequada, riscos à segurança ou danos ao meio ambiente.",
  },
  {
    question: "E se eu não souber qual categoria escolher?",
    answer:
      "Tudo bem. Escolha a opção que mais se aproxima ou marque “Outro”. Se for necessário, o Comitê de Ética ajustará a categoria durante a análise.",
  },
  {
    question: "Preciso ter certeza de que algo está errado?",
    answer:
      "Não. Se uma situação parece errada ou preocupa você, faça o relato. A informação pode ajudar a identificar riscos, corrigir falhas e evitar que o problema se repita.",
  },
] as const;

export function ReportIntroduction() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <ReportFlowSteps currentStep={1} />

      <header className="relative mt-5 overflow-hidden rounded-xl bg-elinsa-dark px-5 py-8 text-white shadow-panel sm:px-8 sm:py-9 lg:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-16 size-56 rounded-full border border-white/20 sm:size-72"
        />

        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-10">
          <div className="max-w-3xl">
            <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-white/10 text-elinsa-sky ring-1 ring-white/15">
              <ShieldCheck aria-hidden="true" className="size-6" />
            </div>
            <h1 className="mt-3 max-w-3xl text-pretty text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              Vai fazer uma denúncia? Veja o que é importante saber.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Em um minuto, você confere quando usar o canal, como escolher a
              categoria e o que fazer se ainda estiver em dúvida.
            </p>
          </div>

          <div className="lg:pb-1">
            <p className="mb-2 text-sm leading-6 text-white/60">
              Já conhece o processo?
            </p>
            <Button
              variant="outline"
              size="xl2"
              className="h-auto w-full justify-between border-white/25 bg-white/10 text-left text-white whitespace-normal hover:bg-white/15 hover:text-white focus-visible:border-white/50 focus-visible:ring-white/25 dark:bg-white/10 dark:hover:bg-white/15"
              asChild
            >
              <Link href="/denunciar/formulario">
                Ir para o formulário
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section aria-labelledby="report-faq-title" className="mt-12">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-elinsa-primary/10 text-elinsa-primary">
            <CircleHelp aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2
              id="report-faq-title"
              className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Dúvidas comuns sobre o canal
            </h2>
          </div>
        </div>

        <dl className="mt-6 grid gap-x-12 gap-y-0 border-y border-border/80 lg:grid-cols-2">
          {faqItems.map((item, index) => (
            <div
              key={item.question}
              className="group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-b border-border/80 py-6 last:border-b-0 lg:nth-[3]:border-b-0 lg:py-7"
            >
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-md bg-muted text-sm font-bold text-elinsa-dark transition-colors group-hover:bg-elinsa-primary/10 group-hover:text-elinsa-primary dark:text-elinsa-sky"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <dt className="text-lg font-bold tracking-tight">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {item.answer}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <aside className="mt-6 flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-4 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div className="text-sm leading-6">
          <p className="font-bold">Existe risco imediato à vida?</p>
          <p className="mt-1 text-amber-900/80 dark:text-amber-100/75">
            Primeiro, procure ajuda: ligue para o SAMU (192), para os Bombeiros
            (193) ou acione a supervisão de campo. 
            <br/>
            Depois, registre a denúncia para que o caso também possa ser acompanhado internamente.
          </p>
        </div>
      </aside>

      <Card className="mt-8 rounded-xl border-elinsa-primary/25 bg-elinsa-light/35 py-0 shadow-panel dark:bg-elinsa-primary/10">
        <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-elinsa-primary">
              Escolha como seguir
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Quer mais detalhes ou prefere começar?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Consulte os guias completos ou vá direto ao formulário. Você
              decide se quer se identificar ao fazer o relato.
            </p>
          </div>

          <nav
            aria-label="Documentação e acesso ao formulário de denúncia"
            className="grid gap-2"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                size="xl2"
                className="h-auto justify-between bg-card text-left whitespace-normal"
                asChild
              >
                <Link
                  href={getDocsUrl(
                    "/pt/etica/denuncias/o-que-pode-ser-denunciado",
                  )}
                >
                  O que pode ser denunciado
                  <BookOpenText aria-hidden="true" data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl2"
                className="h-auto justify-between bg-card text-left whitespace-normal"
                asChild
              >
                <Link href={getDocsUrl("/pt/etica/denuncias/como-denunciar")}>
                  Como denunciar
                  <ListChecks aria-hidden="true" data-icon="inline-end" />
                </Link>
              </Button>
            </div>

            <Button
              size="xl2"
              className="h-auto w-full justify-between bg-elinsa-primary text-left text-base whitespace-normal hover:bg-elinsa-dark"
              asChild
            >
              <Link href="/denunciar/formulario">
                Ir para o formulário de denúncia
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Link>
            </Button>
          </nav>
        </CardContent>
      </Card>
    </main>
  );
}
