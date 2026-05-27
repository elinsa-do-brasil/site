import {
  AiSearch02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  FileSearchIcon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getPublicReportTrackingByProtocol } from "@/lib/reports/repository";
import {
  getPublicReportEventLabel,
  normalizeReportStatus,
  reportStatusPublicDescriptions,
} from "@/lib/reports/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acompanhar denúncia",
  description: "Consulta pública de status de denúncia por protocolo.",
  robots: {
    index: false,
    follow: false,
  },
};

type FollowReportPageProps = {
  searchParams: Promise<{
    protocolo?: string | string[];
  }>;
};

type Tracking = NonNullable<
  Awaited<ReturnType<typeof getPublicReportTrackingByProtocol>>
>;
type TrackingEvent = Tracking["events"][number];

const reportStatusPublicTitles: Record<
  ReturnType<typeof normalizeReportStatus>,
  string
> = {
  new: "Denúncia recebida",
  opened: "Denúncia aberta",
  triage: "Triagem inicial",
  review: "Em análise",
  investigation: "Em investigação",
  waiting_information: "Aguardando informações",
  completed: "Concluída",
  archived: "Arquivada",
};

export default async function FollowReportPage({
  searchParams,
}: FollowReportPageProps) {
  const params = await searchParams;
  const protocol = normalizeProtocol(getSingleParam(params.protocolo));
  const tracking = protocol
    ? await getPublicReportTrackingByProtocol(protocol)
    : null;
  const wasSearched = protocol.length > 0;

  return (
    <main className="mx-auto min-w-0 max-w-[min(64rem,100vw)] overflow-x-hidden px-4 pt-28 pb-16">
      <div className="mb-8 flex max-w-2xl flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Consulta pública
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Acompanhar denúncia
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Informe o protocolo recebido ao enviar a denúncia para consultar o
            andamento público do caso.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="min-w-0 rounded-md border-border/80 py-0 shadow-sm">
          <CardHeader className="border-b py-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <HugeiconsIcon icon={FileSearchIcon} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <CardTitle className="text-base">
                  Consulta por protocolo
                </CardTitle>
                <CardDescription className="mt-1">
                  Use exatamente o código exibido na confirmação do envio.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form
              action="/acompanhar-denuncia"
              className="flex min-w-0 flex-col gap-3 sm:flex-row"
            >
              <Input
                aria-label="Protocolo da denúncia"
                autoComplete="off"
                className="h-10 min-w-0 flex-1 font-mono text-sm uppercase"
                defaultValue={protocol}
                name="protocolo"
                placeholder="DEN-20260527-XXXXXXXX"
              />
              <Button type="submit" className="h-10 sm:w-fit">
                <HugeiconsIcon
                  icon={AiSearch02Icon}
                  data-icon="inline-start"
                  strokeWidth={2}
                />
                Consultar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="min-w-0 rounded-md border-border/80 py-0 shadow-sm">
          <CardHeader className="gap-3 py-4">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <HugeiconsIcon icon={ShieldKeyIcon} strokeWidth={2} />
            </span>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Consulta preservada</CardTitle>
              <CardDescription className="break-words leading-relaxed">
                Esta página mostra apenas marcos públicos do andamento, sem
                nomes, responsáveis internos ou dados do relato.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-4">
        {tracking ? (
          <ReportTrackingCard tracking={tracking} />
        ) : (
          <EmptyTrackingState wasSearched={wasSearched} />
        )}
      </div>
    </main>
  );
}

function ReportTrackingCard({ tracking }: { tracking: Tracking }) {
  const status = normalizeReportStatus(tracking.status);
  const timelineEvents = getDisplayTimelineEvents(tracking.events);
  const latestEventId = timelineEvents.at(-1)?.id;

  return (
    <Card className="min-w-0 rounded-md border-border/80 py-0 shadow-sm">
      <CardHeader className="border-b py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">Andamento da denúncia</CardTitle>
              <ReportStatusBadge status={tracking.status} />
            </div>
            <CardDescription className="font-mono text-xs uppercase">
              {tracking.protocol}
            </CardDescription>
          </div>
          <div className="flex w-full min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground md:w-fit">
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
            <span className="min-w-0">
              Atualizado em {formatDate(tracking.updatedAt)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <section className="flex flex-col gap-4 rounded-md bg-muted/40 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Status atual
            </p>
            <p className="text-xl font-semibold">
              {reportStatusPublicTitles[status]}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {reportStatusPublicDescriptions[status]}
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Recebida em</span>
            <span className="font-medium">
              {formatDate(tracking.createdAt)}
            </span>
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="font-semibold">Linha do tempo pública</h2>
            <p className="text-sm text-muted-foreground">
              Marcos principais exibidos sem identificação de quem movimentou o
              caso.
            </p>
          </div>

          <ol className="flex flex-col">
            {timelineEvents.map((event, index) => (
              <li
                key={event.id}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3"
              >
                <div className="flex flex-col items-center">
                  <span
                    className={
                      event.id === latestEventId
                        ? "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        : "flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary"
                    }
                  >
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      strokeWidth={2}
                    />
                  </span>
                  {index < timelineEvents.length - 1 ? (
                    <span className="my-2 h-8 w-px bg-border" />
                  ) : null}
                </div>
                <div className="min-w-0 pb-5">
                  <div className="flex flex-col gap-1 rounded-md border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {getPublicReportEventLabel(event.type)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(event.createdAt)}
                      </p>
                    </div>
                    {event.id === latestEventId ? (
                      <span className="text-xs font-medium text-primary">
                        Atual
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </CardContent>
    </Card>
  );
}

function EmptyTrackingState({ wasSearched }: { wasSearched: boolean }) {
  return (
    <Card className="rounded-md border-dashed py-0 shadow-none">
      <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <HugeiconsIcon icon={AiSearch02Icon} strokeWidth={2} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            {wasSearched ? "Protocolo não encontrado" : "Faça uma consulta"}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {wasSearched
              ? "Não encontramos uma denúncia com esse protocolo. Verifique o código e tente novamente."
              : "O protocolo fica disponível na tela de confirmação após o envio da denúncia."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getDisplayTimelineEvents(events: TrackingEvent[]) {
  const eventsByType = new Map<string, TrackingEvent>();

  for (const event of events) {
    eventsByType.set(event.type, event);
  }

  return Array.from(eventsByType.values()).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalizeProtocol(value: string) {
  return value.trim().toUpperCase();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
