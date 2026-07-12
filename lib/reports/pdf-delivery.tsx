import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canReadReport } from "@/lib/comite/access";
import { decryptAttachmentOriginalNameSafely } from "./attachment-crypto";
import { formatAttachmentSize } from "./attachment-limits";
import { listReportAttachments } from "./attachments";
import { sanitizePdfText } from "./pdf-text";
import { type ReportPdfData, ReportPdfDocument } from "./report-pdf-document";
import {
  countRecentReportPdfExports,
  decryptReportRow,
  getReportById,
  listReportPdfEvents,
  recordReportEvent,
} from "./repository";
import { getPublicReportEventLabel, getReportStatusLabel } from "./status";

const TIME_ZONE = "America/Sao_Paulo";
const MAX_PDF_EXPORTS_PER_MINUTE = 5;
const activePdfExports = new Set<string>();

type ReportRecord = NonNullable<Awaited<ReturnType<typeof getReportById>>>;

export async function createCommitteeReportPdfResponse(input: {
  request: NextRequest;
  reportId: string;
}) {
  const session = await auth.api.getSession({
    headers: input.request.headers,
  });
  const userId = session?.user.id;

  if (!userId) {
    return plainResponse(401);
  }

  let slotAcquired = false;

  try {
    if (!(await canReadReport({ userId, reportId: input.reportId }))) {
      return plainResponse(404);
    }

    const report = await getReportById(input.reportId);

    if (!report) {
      return plainResponse(404);
    }

    const recentExports = await countRecentReportPdfExports({
      actorUserId: userId,
      since: new Date(Date.now() - 60_000),
    });

    if (
      recentExports >= MAX_PDF_EXPORTS_PER_MINUTE ||
      activePdfExports.has(userId)
    ) {
      return plainResponse(429, { "Retry-After": "60" });
    }

    activePdfExports.add(userId);
    slotAcquired = true;

    const { fileName, pdfBuffer } = await renderReportPdfArtifact(report);

    await recordReportEvent({
      actorUserId: userId,
      message: "Relatório confidencial da denúncia gerado para download.",
      reportId: report.id,
      type: "report.pdf_generated",
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": contentDisposition(fileName),
        "Content-Length": String(pdfBuffer.length),
        "Content-Type": "application/pdf",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch {
    return plainResponse(500);
  } finally {
    if (slotAcquired) {
      activePdfExports.delete(userId);
    }
  }
}

/**
 * Monta o artefato sem alterar a denúncia. Mantê-lo separado da resposta HTTP
 * permite validar a geração com dados reais sem contornar a autorização da rota.
 */
export async function renderReportPdfArtifact(report: ReportRecord) {
  const payload = decryptReportRow(report);

  if (!payload) {
    throw new Error("REPORT_PAYLOAD_UNAVAILABLE");
  }

  const [attachments, eventResult] = await Promise.all([
    listReportAttachments(report.id),
    listReportPdfEvents(report.id),
  ]);
  const data: ReportPdfData = {
    attachments: attachments.map((attachment) => ({
      createdAt: formatDate(attachment.createdAt),
      key: attachment.id,
      mimeType: presentText(attachment.mimeType, "Tipo não informado"),
      name: presentText(
        decryptAttachmentOriginalNameSafely(attachment),
        "Nome do anexo indisponível",
        300,
      ),
      size: formatAttachmentSize(attachment.sizeBytes),
    })),
    category: presentText(report.category, "Categoria não informada", 120),
    contactInfo: presentText(payload.contactInfo, "Não informado.", 600),
    contactPreference: contactPreferenceLabel(payload.contactPreference),
    description: presentText(payload.description, "Não informado.", 10_000),
    events: eventResult.items.reverse().map((event) => ({
      createdAt: formatDate(event.createdAt),
      key: event.id,
      label: formatEventLabel(event.type),
      message: event.message ? sanitizePdfText(event.message, 800) : null,
    })),
    eventsOmitted: Math.max(eventResult.total - eventResult.items.length, 0),
    generatedAt: formatDate(new Date()),
    involvedPeople: presentText(
      payload.involvedPeople,
      "Não informado.",
      2_000,
    ),
    location: presentText(payload.location, "Não informado.", 600),
    occurredAt: presentText(payload.occurredAt, "Não informado.", 100),
    previousAttempts: presentText(
      payload.previousAttempts,
      "Não informado.",
      2_500,
    ),
    protocol: sanitizePdfText(report.protocol, 80),
    receivedAt: formatDate(report.createdAt),
    reporter: payload.reporterName
      ? `Identificado (${presentText(payload.reporterName, "nome indisponível", 600)})`
      : "Anônimo",
    status: getReportStatusLabel(report.status),
    title: presentText(payload.title, "Denúncia sem título", 240),
    witnesses: presentText(payload.witnesses, "Não informado.", 2_000),
  };
  const pdfBuffer = await renderToBuffer(<ReportPdfDocument data={data} />);

  return {
    fileName: `denuncia-${sanitizeFileName(report.protocol)}.pdf`,
    pdfBuffer,
  };
}

function plainResponse(
  status: number,
  extraHeaders: Record<string, string> = {},
) {
  return new Response(null, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(date);
}

function presentText(
  value: string | null | undefined,
  fallback = "Não informado.",
  maxCharacters = 10_000,
) {
  if (!value) return fallback;

  return sanitizePdfText(value, maxCharacters) || fallback;
}

function contactPreferenceLabel(value: string) {
  const labels: Record<string, string> = {
    email: "E-mail",
    no_contact: "Não deseja contato",
    other: "Outro meio",
    phone: "Telefone",
    whatsapp: "WhatsApp",
  };

  return labels[value] ?? "Não informado.";
}

function formatEventLabel(type: string) {
  if (type === "report.attachment_uploaded") return "Anexo recebido";
  return getPublicReportEventLabel(type);
}

function sanitizeFileName(value: string) {
  const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, "_");
  return sanitized || "relatorio";
}

function contentDisposition(fileName: string) {
  return `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
