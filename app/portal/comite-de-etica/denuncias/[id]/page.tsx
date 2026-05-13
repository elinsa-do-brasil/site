import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  canReadReport,
  requireCommitteeAccess,
  requireUserId,
} from "@/lib/comite/access";
import {
  decryptReportRow,
  getReportById,
  recordReportEvent,
} from "@/lib/reports/repository";

export const dynamic = "force-dynamic";

type ReportDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = requireUserId(session?.user.id);
  await requireCommitteeAccess(userId);

  if (!(await canReadReport({ userId, reportId: id }))) {
    notFound();
  }

  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  const payload = decryptReportRow(report);

  if (!payload) {
    notFound();
  }

  await recordReportEvent({
    reportId: report.id,
    actorUserId: userId,
    type: "report.viewed",
    message: "Denúncia consultada por pessoa autorizada.",
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{report.status}</Badge>
            <span className="font-mono text-sm text-muted-foreground">
              {report.protocol}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{payload.title}</h1>
          <p className="mt-2 text-muted-foreground">{report.category}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href={`/portal/comite-de-etica/denuncias/${report.id}/historico`}
            >
              Histórico
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/portal/comite-de-etica/denuncias">Voltar</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Relato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {payload.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do caso</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <DetailItem
                label="Identificação"
                value={
                  "reporterName" in payload && payload.reporterName
                    ? `Identificado (${payload.reporterName})`
                    : "Anônimo"
                }
              />
              <DetailItem label="Quando ocorreu" value={payload.occurredAt} />
              <DetailItem label="Onde ocorreu" value={payload.location} />
              <DetailItem
                label="Preferência de contato"
                value={contactPreferenceLabel(payload.contactPreference)}
              />
              <DetailItem label="Contato" value={payload.contactInfo} />
              <DetailItem
                label="Recebida em"
                value={formatDate(report.createdAt)}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pessoas envolvidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {payload.involvedPeople || "Não informado."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testemunhas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {payload.witnesses || "Não informado."}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tentativas anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {payload.previousAttempts || "Não informado."}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words">{value || "Não informado."}</dd>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function contactPreferenceLabel(value: string) {
  const labels: Record<string, string> = {
    no_contact: "Sem contato",
    email: "E-mail",
    phone: "Telefone",
    whatsapp: "WhatsApp",
    other: "Outro",
  };

  return labels[value] ?? value;
}
