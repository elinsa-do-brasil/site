import {
  Download02Icon,
  EyeIcon,
  FileAttachmentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ExpandableReportText } from "@/components/reports/expandable-report-text";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { ReportStatusSelect } from "@/components/reports/report-status-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  canReadReport,
  requireCommitteeAccess,
  requireUserId,
} from "@/lib/comite/access";
import { decryptAttachmentOriginalName } from "@/lib/reports/attachment-crypto";
import { formatAttachmentSize } from "@/lib/reports/attachment-limits";
import { listReportAttachments } from "@/lib/reports/attachments";
import {
  decryptReportRow,
  getReportById,
  openReportIfNew,
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

  let report = await getReportById(id);

  if (!report) {
    notFound();
  }

  const openedReport =
    report.status === "new"
      ? await openReportIfNew({ reportId: report.id, actorUserId: userId })
      : null;

  if (openedReport) {
    report = (await getReportById(id)) ?? report;
  } else {
    await recordReportEvent({
      reportId: report.id,
      actorUserId: userId,
      type: "report.viewed",
      message: "Denúncia consultada por pessoa autorizada.",
    });
  }

  const payload = decryptReportRow(report);

  if (!payload) {
    notFound();
  }

  const attachments = (await listReportAttachments(report.id)).map(
    (attachment) => ({
      ...attachment,
      originalName: decryptAttachmentOriginalName(attachment),
    }),
  );
  const reporterLabel =
    "reporterName" in payload && payload.reporterName
      ? `Identificado (${payload.reporterName})`
      : "Anônimo";
  const contactPreference = contactPreferenceLabel(payload.contactPreference);
  const receivedAt = formatDate(report.createdAt);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12">
      <header className="mb-6 border-b pb-5">
        <nav
          aria-label="Navegação da denúncia"
          className="mb-3 flex flex-wrap gap-2"
        >
          <Button variant="outline" size="sm" asChild>
            <Link href={`/portal/comite-de-etica/${report.id}/historico`}>
              Histórico
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/comite-de-etica">Voltar</Link>
          </Button>
        </nav>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <ReportStatusBadge status={report.status} />
          <span className="font-mono text-sm text-muted-foreground">
            {report.protocol}
          </span>
        </div>
        <h1 className="max-w-4xl text-2xl font-semibold tracking-tight">
          {payload.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{report.category}</p>
        <div className="mt-3">
          <ReportStatusSelect reportId={report.id} status={report.status} />
        </div>
        <nav
          aria-label="Seções da denúncia"
          className="mt-4 flex flex-wrap gap-2"
        >
          <Button variant="outline" size="sm" asChild>
            <a href="#dados-do-caso">Dados</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#relato">Relato</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#anexos">Anexos</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#tentativas-anteriores">Tentativas</a>
          </Button>
        </nav>
      </header>

      <section
        aria-label="Resumo operacional"
        className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <SummaryItem
          label="Status"
          value={<ReportStatusBadge status={report.status} />}
        />
        <SummaryItem label="Recebida em" value={receivedAt} />
        <SummaryItem label="Identificação" value={reporterLabel} />
        <SummaryItem
          label="Anexos"
          value={`${attachments.length} ${
            attachments.length === 1 ? "arquivo" : "arquivos"
          }`}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card
          id="dados-do-caso"
          className="order-1 scroll-mt-28 rounded-md border-border/80 py-0 shadow-sm lg:order-2"
        >
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Dados do caso</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <dl className="flex flex-col gap-3 text-sm">
              <DetailItem label="Identificação" value={reporterLabel} />
              <DetailItem label="Quando ocorreu" value={payload.occurredAt} />
              <DetailItem label="Onde ocorreu" value={payload.location} />
              <DetailItem
                label="Preferência de contato"
                value={contactPreference}
              />
              <DetailItem label="Contato" value={payload.contactInfo} />
              <DetailItem label="Recebida em" value={receivedAt} />
            </dl>
          </CardContent>
        </Card>

        <Card
          id="relato"
          className="order-2 scroll-mt-28 rounded-md border-border/80 py-0 shadow-sm lg:order-1"
        >
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Relato</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <ExpandableReportText text={payload.description} />
          </CardContent>
        </Card>

        <Card className="order-3 rounded-md border-border/80 py-0 shadow-sm">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Pessoas envolvidas</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {payload.involvedPeople || "Não informado."}
            </p>
          </CardContent>
        </Card>

        <Card className="order-4 rounded-md border-border/80 py-0 shadow-sm">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Testemunhas</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {payload.witnesses || "Não informado."}
            </p>
          </CardContent>
        </Card>

        <Card
          id="anexos"
          className="order-5 scroll-mt-28 rounded-md border-border/80 py-0 shadow-sm lg:col-span-2"
        >
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Anexos</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {attachments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col gap-3 rounded-md border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <HugeiconsIcon
                        icon={FileAttachmentIcon}
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        strokeWidth={2}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {attachment.originalName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline">
                            {formatAttachmentMime(attachment.mimeType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatAttachmentSize(attachment.sizeBytes)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`/api/committee/attachments/${attachment.id}/view`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <HugeiconsIcon
                            icon={EyeIcon}
                            data-icon="inline-start"
                            strokeWidth={2}
                          />
                          Abrir
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`/api/committee/attachments/${attachment.id}/download`}
                        >
                          <HugeiconsIcon
                            icon={Download02Icon}
                            data-icon="inline-start"
                            strokeWidth={2}
                          />
                          Baixar
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum anexo foi enviado nesta denúncia.
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          id="tentativas-anteriores"
          className="order-6 scroll-mt-28 rounded-md border-border/80 py-0 shadow-sm lg:col-span-2"
        >
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Tentativas anteriores</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {payload.previousAttempts || "Não informado."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
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

function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-md border border-border/80 bg-card px-4 py-3 shadow-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="min-w-0 break-words text-sm font-semibold">{value}</div>
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

function formatAttachmentMime(mimeType: string) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "Imagem";
  if (mimeType.startsWith("audio/")) return "Áudio";
  if (mimeType.startsWith("video/")) return "Vídeo";
  return mimeType;
}
