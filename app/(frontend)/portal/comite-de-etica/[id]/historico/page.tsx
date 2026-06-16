import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
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
            {events.map((event) => (
              <div key={event.id} className="border-b pb-4 last:border-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {formatEventType(event.type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                {event.message && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatActor(event.actorUserId, event.actorName)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
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
