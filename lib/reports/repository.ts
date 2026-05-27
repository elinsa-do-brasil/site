import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportEvents, reports, user } from "@/lib/db/schema";
import {
  decryptReportPayload,
  encryptReportPayload,
  type ReportEncryptedPayload,
} from "./crypto";
import { createReportProtocol } from "./protocol";
import {
  getReportStatusEventType,
  getReportStatusLabel,
  REPORT_PUBLIC_EVENT_TYPES,
  type ReportStatus,
} from "./status";
import type { CreateReportInput } from "./validation";
import { toEncryptedPayload } from "./validation";

export async function createReport(input: CreateReportInput) {
  const encrypted = encryptReportPayload(toEncryptedPayload(input));

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const protocol = createReportProtocol();

    try {
      return await db.transaction(async (tx) => {
        const [report] = await tx
          .insert(reports)
          .values({
            protocol,
            category: input.category,
            encryptedPayload: encrypted.encryptedPayload.ciphertext,
            payloadIv: encrypted.encryptedPayload.iv,
            payloadAuthTag: encrypted.encryptedPayload.authTag,
            encryptedReportKey: encrypted.encryptedReportKey.ciphertext,
            reportKeyIv: encrypted.encryptedReportKey.iv,
            reportKeyAuthTag: encrypted.encryptedReportKey.authTag,
          })
          .returning({
            id: reports.id,
            protocol: reports.protocol,
          });

        if (!report) {
          throw new Error("REPORT_NOT_CREATED");
        }

        await tx.insert(reportEvents).values({
          reportId: report.id,
          type: "report.created",
          message: "Denúncia recebida pelo canal público.",
        });

        return report;
      });
    } catch (error) {
      if (attempt === 2 || !isUniqueViolation(error)) {
        throw error;
      }
    }
  }

  throw new Error("REPORT_PROTOCOL_GENERATION_FAILED");
}

export async function listReportSummaries(limit = 20) {
  return db
    .select({
      id: reports.id,
      protocol: reports.protocol,
      category: reports.category,
      status: reports.status,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(limit);
}

export async function getReportCountsByStatus() {
  const rows = await db
    .select({
      status: reports.status,
      total: count(),
    })
    .from(reports)
    .groupBy(reports.status);

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = Number(row.total);
    return acc;
  }, {});
}

export async function getReportById(id: string) {
  const [report] = await db.select().from(reports).where(eq(reports.id, id));
  return report ?? null;
}

export async function getPublicReportTrackingByProtocol(protocol: string) {
  const [report] = await db
    .select({
      id: reports.id,
      protocol: reports.protocol,
      status: reports.status,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .where(eq(reports.protocol, protocol));

  if (!report) {
    return null;
  }

  const events = await db
    .select({
      id: reportEvents.id,
      type: reportEvents.type,
      createdAt: reportEvents.createdAt,
    })
    .from(reportEvents)
    .where(
      and(
        eq(reportEvents.reportId, report.id),
        inArray(reportEvents.type, [...REPORT_PUBLIC_EVENT_TYPES]),
      ),
    )
    .orderBy(asc(reportEvents.createdAt));

  return {
    protocol: report.protocol,
    status: report.status,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    events,
  };
}

export async function listReportEvents(reportId: string) {
  return db
    .select({
      id: reportEvents.id,
      actorUserId: reportEvents.actorUserId,
      actorName: user.name,
      type: reportEvents.type,
      message: reportEvents.message,
      createdAt: reportEvents.createdAt,
    })
    .from(reportEvents)
    .leftJoin(user, eq(reportEvents.actorUserId, user.id))
    .where(eq(reportEvents.reportId, reportId))
    .orderBy(desc(reportEvents.createdAt));
}

export function decryptReportRow(
  report: Awaited<ReturnType<typeof getReportById>>,
) {
  if (!report) return null;

  return decryptReportPayload({
    encryptedPayload: {
      ciphertext: report.encryptedPayload,
      iv: report.payloadIv,
      authTag: report.payloadAuthTag,
    },
    encryptedReportKey: {
      ciphertext: report.encryptedReportKey,
      iv: report.reportKeyIv,
      authTag: report.reportKeyAuthTag,
    },
  });
}

export async function recordReportEvent(input: {
  reportId: string;
  actorUserId?: string | null;
  type: string;
  message?: string | null;
}) {
  await db.insert(reportEvents).values({
    reportId: input.reportId,
    actorUserId: input.actorUserId,
    type: input.type,
    message: input.message,
  });
}

export async function updateReportStatus(input: {
  reportId: string;
  status: ReportStatus;
  actorUserId: string;
}) {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({
        id: reports.id,
        protocol: reports.protocol,
        status: reports.status,
        updatedAt: reports.updatedAt,
      })
      .from(reports)
      .where(eq(reports.id, input.reportId));

    if (!current) return null;

    if (current.status === input.status) {
      return current;
    }

    const [report] = await tx
      .update(reports)
      .set({
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, input.reportId))
      .returning({
        id: reports.id,
        protocol: reports.protocol,
        status: reports.status,
        updatedAt: reports.updatedAt,
      });

    if (!report) return null;

    await tx.insert(reportEvents).values({
      reportId: report.id,
      actorUserId: input.actorUserId,
      type: getReportStatusEventType(input.status),
      message: `Status alterado para ${getReportStatusLabel(input.status)}.`,
    });

    return report;
  });
}

export async function openReportIfNew(input: {
  reportId: string;
  actorUserId: string;
}) {
  return db.transaction(async (tx) => {
    const [report] = await tx
      .update(reports)
      .set({
        status: "opened",
        updatedAt: new Date(),
      })
      .where(and(eq(reports.id, input.reportId), eq(reports.status, "new")))
      .returning({
        id: reports.id,
        protocol: reports.protocol,
        status: reports.status,
        updatedAt: reports.updatedAt,
      });

    if (!report) return null;

    await tx.insert(reportEvents).values({
      reportId: report.id,
      actorUserId: input.actorUserId,
      type: getReportStatusEventType("opened"),
      message: "Denúncia aberta para acompanhamento do Comitê de Ética.",
    });

    return report;
  });
}

export type DecryptedReportPayload = ReportEncryptedPayload;

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
