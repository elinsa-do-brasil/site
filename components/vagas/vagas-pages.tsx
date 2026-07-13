import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EditorialRichText } from "@/components/editorial/editorial-rich-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { Separator } from "@/components/ui/separator";
import {
  formatVagaDate,
  getVagaBySlug,
  getVagaLocationLabel,
  getVagasAbertas,
  type Vaga,
} from "@/lib/vagas";

export async function VagasIndexPage() {
  const vagas = await getVagasAbertas();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-24 text-foreground">
        <section className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
          <div className="mb-6 max-w-3xl border-l-2 border-elinsa-primary pl-4 sm:pl-5">
            <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-elinsa-primary uppercase">
              Carreiras
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-normal text-elinsa-dark md:text-5xl dark:text-elinsa-sky">
              Vagas
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
              Oportunidades abertas para trabalhar com a Elinsa do Brasil nas
              nossas frentes regionais.
            </p>
          </div>

          {vagas.length === 0 ? (
            <EmptyJobs />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vagas.map((vaga) => (
                <VagaCard key={vaga.id} vaga={vaga} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}

export async function VagaPage({ slug }: { slug: string }) {
  const { isEnabled: isDraftMode } = await draftMode();
  const vaga = await getVagaBySlug({
    draft: isDraftMode,
    slug,
  });

  if (!vaga) {
    return notFound();
  }

  const publishedDate = formatVagaDate(vaga.publishedAt ?? vaga.createdAt);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-24 text-foreground">
        {isDraftMode && (
          <div className="border-y border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
            Pré-visualização ativa
          </div>
        )}

        <section className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
          <Button
            asChild
            className="-ml-2 h-8 gap-2 px-2 text-sm font-semibold text-muted-foreground hover:text-elinsa-primary"
            variant="ghost"
          >
            <Link href="/vagas" transitionTypes={["nav-back"]}>
              <ArrowLeft className="size-4" />
              Voltar para vagas
            </Link>
          </Button>

          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <article className="min-w-0 pb-12 lg:pr-8">
              <div className="mb-8 max-w-4xl border-l-2 border-elinsa-primary pl-4 sm:pl-5">
                <Badge className="rounded-md bg-elinsa-light px-2.5 py-1 text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky">
                  Vaga aberta
                </Badge>
                <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal text-elinsa-dark md:text-4xl dark:text-elinsa-sky">
                  {vaga.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                  {vaga.summary}
                </p>
              </div>

              <EditorialRichText data={vaga.content} />
            </article>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Card className="rounded-md">
                <CardHeader>
                  <CardTitle>Resumo da vaga</CardTitle>
                  <CardDescription>
                    Informações principais cadastradas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <JobMeta
                    icon={<Building2 />}
                    label="Setor"
                    value={vaga.sector}
                  />
                  <Separator />
                  <JobMeta
                    icon={<MapPin />}
                    label="Cidade"
                    value={getVagaLocationLabel(vaga)}
                  />
                  {publishedDate && (
                    <>
                      <Separator />
                      <JobMeta
                        icon={<CalendarDays />}
                        label="Publicada em"
                        value={publishedDate}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function VagaCard({ vaga }: { vaga: Vaga }) {
  const href = vaga.slug ? `/vagas/${vaga.slug}` : "/vagas";
  const publishedDate = formatVagaDate(vaga.publishedAt ?? vaga.createdAt);

  return (
    <Card className="rounded-md transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-elinsa-primary/55 hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge className="rounded-md bg-elinsa-light px-2.5 py-1 text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky">
            Aberta
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 text-elinsa-primary" />
            {getVagaLocationLabel(vaga)}
          </span>
        </div>
        <CardTitle className="line-clamp-2 text-2xl font-black leading-tight tracking-normal text-elinsa-dark dark:text-elinsa-sky">
          {vaga.title}
        </CardTitle>
        <CardDescription className="line-clamp-3 pt-2 text-sm leading-6">
          {vaga.summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2">
          <Building2 className="size-4 text-elinsa-primary" />
          <span className="font-semibold text-foreground">{vaga.sector}</span>
        </p>
        {publishedDate && (
          <p className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-elinsa-primary" />
            Publicada em {publishedDate}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="gap-2" variant="outline">
          <Link href={href} transitionTypes={["nav-forward"]}>
            Ver detalhes
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmptyJobs() {
  return (
    <Card className="min-h-80 justify-center rounded-md border-dashed bg-muted/35 py-14 text-center">
      <CardContent className="flex flex-col items-center px-6">
        <div className="mb-5 flex size-12 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky">
          <BriefcaseBusiness className="size-6" />
        </div>
        <h2 className="text-2xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
          Nenhuma vaga aberta
        </h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          As próximas oportunidades publicadas aparecerão aqui.
        </p>
      </CardContent>
    </Card>
  );
}

function JobMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-elinsa-primary [&_svg]:size-4">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
