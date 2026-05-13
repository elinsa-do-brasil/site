import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { requireCommitteeAccess, requireUserId } from "@/lib/comite/access";
import {
  getReportCountsByStatus,
  listReportSummaries,
} from "@/lib/reports/repository";

export const dynamic = "force-dynamic";

export default async function ComitePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = requireUserId(session?.user.id);
  const context = await requireCommitteeAccess(userId);
  const [counts, latestReports] = await Promise.all([
    getReportCountsByStatus(),
    listReportSummaries(6),
  ]);
  const canSeeList =
    context.hasFullAccess ||
    (context.isCommitteeTeamMember &&
      (context.isCommitteeMember || context.isConsultant));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comitê de Ética</h1>
          <p className="mt-2 text-muted-foreground">
            Painel interno para triagem e acompanhamento de denúncias.
          </p>
        </div>
        {canSeeList && (
          <Button asChild>
            <Link href="/portal/comite-de-etica/denuncias">Ver denúncias</Link>
          </Button>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Novas" value={counts.new ?? 0} />
        <MetricCard label="Em análise" value={counts.in_review ?? 0} />
        <MetricCard label="Encerradas" value={counts.closed ?? 0} />
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Últimas denúncias</CardTitle>
          </CardHeader>
          <CardContent>
            {canSeeList ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Protocolo</th>
                      <th className="py-2 pr-4 font-medium">Categoria</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-4 font-medium">Recebida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestReports.map((report) => (
                      <tr key={report.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono">
                          <Link
                            href={`/portal/comite-de-etica/denuncias/${report.id}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {report.protocol}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">{report.category}</td>
                        <td className="py-3 pr-4">{report.status}</td>
                        <td className="py-3 pr-4">
                          {formatDate(report.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Seu perfil tem acesso técnico ao canal, mas não ao acervo de
                denúncias.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
