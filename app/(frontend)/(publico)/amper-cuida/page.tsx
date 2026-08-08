import {
  AlertTriangle,
  ArrowRight,
  HeartHandshake,
  LockKeyhole,
  MessageCircleHeart,
  Phone,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { createPageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Conheça o Amper Cuida, canal da Elinsa para solicitar acolhimento psicológico a colaboradores, com acesso restrito e encaminhamento responsável.";

export const metadata = createPageMetadata({
  description: DESCRIPTION,
  path: "/amper-cuida",
  title: "Amper Cuida: apoio psicológico aos colaboradores",
});

const steps = [
  {
    description:
      "Você informa os dados necessários para que a equipe identifique e contate o colaborador que precisa de apoio.",
    title: "Envie a solicitação",
  },
  {
    description:
      "A equipe responsável recebe os dados em ambiente protegido e faz a análise inicial do pedido.",
    title: "A equipe acolhe o pedido",
  },
  {
    description:
      "O colaborador é contatado para receber orientação e o encaminhamento adequado à situação relatada.",
    title: "O contato é realizado",
  },
] as const;

export default function AmperCuidaAboutPage() {
  return (
    <PageTransition>
      <main className="bg-background pb-16 text-foreground">
        <section className="relative overflow-hidden bg-elinsa-dark pt-28 pb-14 text-white sm:pb-18">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-15 [background-image:linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:36px_36px]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 -bottom-28 size-80 rounded-full border border-elinsa-sky/30"
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-9 px-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-white/10 text-elinsa-sky ring-1 ring-white/15">
                <HeartHandshake aria-hidden="true" className="size-7" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-elinsa-sky">
                Cuidado com as pessoas
              </p>
              <h1 className="mt-3 text-pretty text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.08]">
                Amper Cuida: apoio psicológico para colaboradores
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                Um canal para pedir acolhimento e orientação quando um
                colaborador da Elinsa precisa de apoio psicológico. A
                solicitação pode ser feita pelo próprio colaborador ou por outra
                pessoa.
              </p>
            </div>

            <Card className="rounded-xl border-white/15 bg-white/8 py-0 text-white shadow-xl backdrop-blur-sm">
              <CardContent className="p-5 sm:p-6">
                <p className="text-sm leading-6 text-white/65">
                  Já sabe que este é o canal certo?
                </p>
                <Button
                  asChild
                  className="mt-4 h-auto w-full justify-between bg-elinsa-primary py-3 text-left whitespace-normal hover:bg-elinsa-sky hover:text-elinsa-dark"
                  size="lg"
                >
                  <Link href="/acolhimento/hjvx6e" rel="nofollow">
                    Solicitar atendimento
                    <ArrowRight aria-hidden="true" data-icon="inline-end" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          aria-labelledby="como-funciona"
          className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-elinsa-primary">
              Do pedido ao contato
            </p>
            <h2
              className="mt-2 text-3xl font-bold tracking-tight"
              id="como-funciona"
            >
              Como o Amper Cuida funciona
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              O fluxo foi pensado para coletar apenas as informações necessárias
              e permitir um encaminhamento responsável.
            </p>
          </div>

          <ol className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <li
                className="relative rounded-xl border bg-card p-6 shadow-sm"
                key={step.title}
              >
                <span className="text-sm font-bold text-elinsa-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2 lg:py-16">
            <div>
              <div className="flex size-11 items-center justify-center rounded-lg bg-elinsa-primary/10 text-elinsa-primary">
                <LockKeyhole aria-hidden="true" className="size-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight">
                Privacidade e acesso restrito
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Os dados enviados são criptografados, não ficam expostos
                publicamente e são disponibilizados somente à equipe responsável
                pelo atendimento. Evite incluir informações além das necessárias
                para o contato e o acolhimento inicial.
              </p>
              <ul className="mt-5 grid gap-3 text-sm leading-6">
                <li className="flex gap-3">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-elinsa-primary"
                  />
                  O formulário não aparece em mecanismos de busca.
                </li>
                <li className="flex gap-3">
                  <UserRoundCheck
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-elinsa-primary"
                  />
                  O uso do canal é destinado ao apoio de colaboradores da
                  Elinsa.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex size-11 items-center justify-center rounded-lg bg-elinsa-primary/10 text-elinsa-primary">
                <MessageCircleHeart aria-hidden="true" className="size-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight">
                O que este canal não substitui
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                O Amper Cuida organiza pedidos de apoio e encaminhamento. Ele
                não substitui serviços de emergência nem o Canal de Denúncias
                para relatos de ética, assédio, discriminação ou outras condutas
                inadequadas.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href="/denunciar">Conhecer o Canal de Denúncias</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-5 rounded-xl border border-amber-300/60 bg-amber-50 p-5 text-amber-950 sm:p-7 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex size-11 items-center justify-center rounded-lg bg-amber-200/65 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              <AlertTriangle aria-hidden="true" className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Precisa de ajuda imediata?
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
                O CVV oferece apoio emocional gratuito pelo 188. Em situação de
                emergência, acione o SAMU (192), os Bombeiros (193) ou a Polícia
                (190), conforme a necessidade.
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-amber-700 text-white hover:bg-amber-800 lg:w-auto dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300"
            >
              <a aria-label="Ligar para o CVV no número 188" href="tel:188">
                <Phone aria-hidden="true" data-icon="inline-start" />
                Ligar para 188
              </a>
            </Button>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t pt-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Pronto para fazer uma solicitação?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Acesse o formulário protegido e informe os dados para contato.
              </p>
            </div>
            <Button asChild className="shrink-0" size="lg">
              <Link href="/acolhimento/hjvx6e" rel="nofollow">
                Acessar o Amper Cuida
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
