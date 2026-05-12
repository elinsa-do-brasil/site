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
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            {report.protocol}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/comite/denuncias/${report.id}`}>Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos de auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border-b pb-4 last:border-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{event.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                {event.message && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
