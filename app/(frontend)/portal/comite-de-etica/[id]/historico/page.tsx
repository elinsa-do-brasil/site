import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  canReadReport,
  requireCommitteeAccess,
  requireUserId,
} from "@/lib/comite/access";
import { getReportById, listReportEvents } from "@/lib/reports/repository";
import { getPublicReportEventLabel } from "@/lib/reports/status";

export const dynamic = "force-dynamic";

type ReportHistoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportHistoryPage({
  params,
}: ReportHistoryPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = requireUserId(session?.user.id);
  await requireCommitteeAccess(userId);

  if (!(await canReadReport({ userId, reportId: id }))) {
    notFound();
  }

  const [report, events] = await Promise.all([
    getReportById(id),
    listReportEvents(id),
  ]);

  if (!report) {
    notFound();
  }
  const historyEntries = groupReportEvents(events);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12">
      <header className="mb-6 border-b pb-5">
        <nav
          aria-label="Navegação do histórico"
          className="mb-3 flex flex-wrap gap-2"
        >
          <Button variant="outline" size="sm" asChild>
            <Link href={`/portal/comite-de-etica/${report.id}`}>Voltar</Link>
          </Button>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {report.protocol}
        </p>
      </header>

      <Card className="rounded-md border-border/80 py-0 shadow-sm">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Movimentações registradas</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4">
            {historyEntries.map((entry) => (
              <HistoryEntryView key={entry.id} entry={entry} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ReportEvent = Awaited<ReturnType<typeof listReportEvents>>[number];

type HistoryEntry =
  | {
      event: ReportEvent;
      id: string;
      kind: "single";
    }
  | {
      actorName: string | null;
      actorUserId: string | null;
      dateKey: string;
      events: ReportEvent[];
      id: string;
      kind: "viewed-group";
    };

function groupReportEvents(events: ReportEvent[]): HistoryEntry[] {
  const entries: HistoryEntry[] = [];

  for (const event of events) {
    if (event.type !== "report.viewed") {
      entries.push({
        event,
        id: event.id,
        kind: "single",
      });
      continue;
    }

    const dateKey = formatDateKey(event.createdAt);
    const lastEntry = entries.at(-1);

    if (
      lastEntry?.kind === "viewed-group" &&
      lastEntry.actorUserId === event.actorUserId &&
      lastEntry.actorName === event.actorName &&
      lastEntry.dateKey === dateKey
    ) {
      lastEntry.events.push(event);
      continue;
    }

    entries.push({
      actorName: event.actorName,
      actorUserId: event.actorUserId,
      dateKey,
      events: [event],
      id: `viewed-${event.actorUserId ?? "public"}-${dateKey}-${event.id}`,
      kind: "viewed-group",
    });
  }

  return entries;
}

function HistoryEntryView({ entry }: { entry: HistoryEntry }) {
  if (entry.kind === "single") {
    return <SingleEvent event={entry.event} />;
  }

  const latestEvent = entry.events[0];

  if (!latestEvent) return null;

  const oldestEvent = entry.events.at(-1) ?? latestEvent;

  return (
    <div className="border-b pb-4 last:border-0">
      <EventHeader
        date={formatViewedGroupDate(
          latestEvent.createdAt,
          oldestEvent.createdAt,
        )}
        title={`Denúncia consultada ${entry.events.length} ${
          entry.events.length === 1 ? "vez" : "vezes"
        }`}
      />
      <p className="mt-1 text-sm text-muted-foreground">
        Acessos autorizados agrupados para reduzir ruído no histórico.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatActor(entry.actorUserId, entry.actorName)}
      </p>

      {entry.events.length > 1 && (
        <details className="mt-3 rounded-md border bg-muted/20 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium">
            Ver acessos individuais
          </summary>
          <div className="mt-3 flex flex-col gap-2">
            {entry.events.map((event) => (
              <p
                key={event.id}
                className="font-mono text-xs text-muted-foreground"
              >
                {formatDate(event.createdAt)}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function SingleEvent({ event }: { event: ReportEvent }) {
  return (
    <div className="border-b pb-4 last:border-0">
      <EventHeader
        date={formatDate(event.createdAt)}
        title={formatEventType(event.type)}
      />
      {event.message && (
        <p className="mt-1 text-sm text-muted-foreground">{event.message}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {formatActor(event.actorUserId, event.actorName)}
      </p>
    </div>
  );
}

function EventHeader({ date, title }: { date: ReactNode; title: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-medium">{title}</span>
      <span className="text-xs text-muted-foreground">{date}</span>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatDateKey(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
}

function formatViewedGroupDate(latest: Date, oldest: Date) {
  if (latest.getTime() === oldest.getTime()) {
    return formatDate(latest);
  }

  return `${formatDate(oldest)} até ${formatDate(latest)}`;
}

function formatEventType(type: string) {
  const labels: Record<string, string> = {
    "report.created": "Denúncia recebida",
    "report.viewed": "Denúncia consultada",
    "report.attachment_uploaded": "Anexo recebido",
  };

  return labels[type] ?? getPublicReportEventLabel(type);
}

function formatActor(actorUserId: string | null, actorName: string | null) {
  if (!actorUserId) return "Origem: canal público";
  if (actorName) return `Por ${actorName}`;
  return "Por usuário autenticado";
}
