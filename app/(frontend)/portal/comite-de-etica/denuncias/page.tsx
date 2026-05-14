import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  canListReports,
  requireCommitteeAccess,
  requireUserId,
} from "@/lib/comite/access";
import { listReportSummaries } from "@/lib/reports/repository";

export const dynamic = "force-dynamic";

export default async function CommitteeReportsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = requireUserId(session?.user.id);
  await requireCommitteeAccess(userId);

  if (!(await canListReports(userId))) {
    notFound();
  }

  const reports = await listReportSummaries(50);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Denúncias</h1>
          <p className="mt-2 text-muted-foreground">
            Registros recebidos para análise do comitê.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/portal/comite-de-etica">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros recebidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Protocolo</th>
                  <th className="py-2 pr-4 font-medium">Categoria</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Recebida em</th>
                  <th className="py-2 pr-4 font-medium">Atualizada em</th>
                  <th className="py-2 pr-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono">{report.protocol}</td>
                    <td className="py-3 pr-4">{report.category}</td>
                    <td className="py-3 pr-4">{report.status}</td>
                    <td className="py-3 pr-4">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatDate(report.updatedAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/portal/comite-de-etica/denuncias/${report.id}`}
                        >
                          Abrir
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
