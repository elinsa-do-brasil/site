import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import {
  type PsychologicalCareRequest,
  psychologicalCareRequestEvents,
  psychologicalCareRequests,
} from "@/lib/db/schema/psychological-care";
import {
  arePsychologicalCarePayloadsEqual,
  decryptPsychologicalCarePayload,
  encryptPsychologicalCarePayload,
  type PsychologicalCareEncryptedPayload,
} from "./crypto";
import { createPsychologicalCareProtocol } from "./protocol";
import {
  getPsychologicalCareStatusEventType,
  getPsychologicalCareStatusLabel,
  normalizePsychologicalCareStatus,
  PSYCHOLOGICAL_CARE_STATUS_GROUPS,
  PSYCHOLOGICAL_CARE_STATUS_VALUES,
  type PsychologicalCareStatus,
  type PsychologicalCareSummaryStatusFilter,
} from "./status";
import type { PsychologicalCareRequestFormInput } from "./validation";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PSYCHOLOGICAL_CARE_PAGE_SIZE = 20;
export const PSYCHOLOGICAL_CARE_SUBMISSION_PAYLOAD_CONFLICT =
  "PSYCHOLOGICAL_CARE_SUBMISSION_PAYLOAD_CONFLICT";

type PortalPsychologicalCareRequester = {
  submissionSource: "portal_leader";
  requesterUserId: string;
  requesterName: string;
  requesterEmail: string;
};

type PublicPsychologicalCareRequester = {
  submissionSource: "ampercuida";
  requesterUserId: null;
  requesterName: null;
  requesterEmail: null;
};

export type CreatePsychologicalCareRequestInput =
  PsychologicalCareRequestFormInput &
    (PortalPsychologicalCareRequester | PublicPsychologicalCareRequester);

export type ListPsychologicalCareRequestSummariesOptions = {
  page?: number;
  pageSize?: number;
  protocolSearch?: string;
  statusFilter?: PsychologicalCareSummaryStatusFilter;
};

export async function createPsychologicalCareRequest(
  input: CreatePsychologicalCareRequestInput,
) {
  const payload = toPsychologicalCareEncryptedPayload(input);
  const encrypted = encryptPsychologicalCarePayload(payload);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const protocol = createPsychologicalCareProtocol();

    try {
      return await db.transaction(async (tx) => {
        const [request] = await tx
          .insert(psychologicalCareRequests)
          .values({
            protocol,
            submissionId: input.submissionId,
            submissionSource: input.submissionSource,
            requesterUserId: input.requesterUserId,
            encryptedPayload: encrypted.encryptedPayload.ciphertext,
            payloadIv: encrypted.encryptedPayload.iv,
            payloadAuthTag: encrypted.encryptedPayload.authTag,
            encryptedRequestKey: encrypted.encryptedRequestKey.ciphertext,
            requestKeyIv: encrypted.encryptedRequestKey.iv,
            requestKeyAuthTag: encrypted.encryptedRequestKey.authTag,
          })
          .onConflictDoNothing({
            target: psychologicalCareRequests.submissionId,
          })
          .returning({
            id: psychologicalCareRequests.id,
            protocol: psychologicalCareRequests.protocol,
            status: psychologicalCareRequests.status,
            createdAt: psychologicalCareRequests.createdAt,
          });

        if (request) {
          const isPublicSubmission = input.submissionSource === "ampercuida";

          await tx.insert(psychologicalCareRequestEvents).values({
            requestId: request.id,
            actorUserId: input.requesterUserId,
            type: isPublicSubmission
              ? "psychological_care.created_public"
              : "psychological_care.created",
            message: isPublicSubmission
              ? "Solicitação recebida pelo formulário público AmperCuida."
              : "Solicitação de atendimento psicológico recebida.",
          });

          return { ...request, wasCreated: true };
        }

        const [existing] = await tx
          .select({
            id: psychologicalCareRequests.id,
            protocol: psychologicalCareRequests.protocol,
            submissionSource: psychologicalCareRequests.submissionSource,
            requesterUserId: psychologicalCareRequests.requesterUserId,
            status: psychologicalCareRequests.status,
            encryptedPayload: psychologicalCareRequests.encryptedPayload,
            payloadIv: psychologicalCareRequests.payloadIv,
            payloadAuthTag: psychologicalCareRequests.payloadAuthTag,
            encryptedRequestKey: psychologicalCareRequests.encryptedRequestKey,
            requestKeyIv: psychologicalCareRequests.requestKeyIv,
            requestKeyAuthTag: psychologicalCareRequests.requestKeyAuthTag,
            createdAt: psychologicalCareRequests.createdAt,
          })
          .from(psychologicalCareRequests)
          .where(
            eq(psychologicalCareRequests.submissionId, input.submissionId),
          );

        if (!existing) {
          throw new Error("PSYCHOLOGICAL_CARE_REQUEST_NOT_CREATED");
        }

        if (existing.requesterUserId !== input.requesterUserId) {
          throw new Error("PSYCHOLOGICAL_CARE_SUBMISSION_ID_CONFLICT");
        }

        if (existing.submissionSource !== input.submissionSource) {
          throw new Error("PSYCHOLOGICAL_CARE_SUBMISSION_SOURCE_CONFLICT");
        }

        const existingPayload = decryptPsychologicalCareRequestRow(existing);

        if (
          !existingPayload ||
          !arePsychologicalCarePayloadsEqual(existingPayload, payload)
        ) {
          throw new Error(PSYCHOLOGICAL_CARE_SUBMISSION_PAYLOAD_CONFLICT);
        }

        return {
          id: existing.id,
          protocol: existing.protocol,
          status: existing.status,
          createdAt: existing.createdAt,
          wasCreated: false,
        };
      });
    } catch (error) {
      if (attempt === 2 || !isUniqueViolation(error)) {
        throw error;
      }
    }
  }

  throw new Error("PSYCHOLOGICAL_CARE_PROTOCOL_GENERATION_FAILED");
}

export async function listPsychologicalCareRequestSummaries({
  page = 1,
  pageSize = PSYCHOLOGICAL_CARE_PAGE_SIZE,
  protocolSearch = "",
  statusFilter,
}: ListPsychologicalCareRequestSummariesOptions = {}) {
  const normalizedSearch = normalizeProtocolSearch(protocolSearch);
  const conditions = [
    normalizedSearch
      ? ilike(psychologicalCareRequests.protocol, `%${normalizedSearch}%`)
      : null,
    getStatusFilterWhere(statusFilter),
  ].filter((condition): condition is SQL => Boolean(condition));
  const where =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);
  const safePageSize = clampInteger(pageSize, 1, PSYCHOLOGICAL_CARE_PAGE_SIZE);

  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(psychologicalCareRequests)
    .where(where);
  const totalPages = Math.max(Math.ceil(Number(total) / safePageSize), 1);
  const currentPage = clampInteger(page, 1, totalPages);
  const rows = await db
    .select({
      id: psychologicalCareRequests.id,
      protocol: psychologicalCareRequests.protocol,
      status: psychologicalCareRequests.status,
      createdAt: psychologicalCareRequests.createdAt,
      updatedAt: psychologicalCareRequests.updatedAt,
    })
    .from(psychologicalCareRequests)
    .where(where)
    .orderBy(
      desc(psychologicalCareRequests.createdAt),
      desc(psychologicalCareRequests.id),
    )
    .limit(safePageSize)
    .offset((currentPage - 1) * safePageSize);

  const items = rows.map((row) => ({
    id: row.id,
    protocol: row.protocol,
    status: normalizePsychologicalCareStatus(row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return {
    items,
    page: currentPage,
    pageSize: safePageSize,
    protocolSearch,
    statusFilter,
    total: Number(total),
    totalPages,
  };
}

export async function listPsychologicalCareRequestsCreatedBetween(input: {
  start: Date;
  end: Date;
}) {
  return db
    .select()
    .from(psychologicalCareRequests)
    .where(
      and(
        gte(psychologicalCareRequests.createdAt, input.start),
        lt(psychologicalCareRequests.createdAt, input.end),
      ),
    )
    .orderBy(
      asc(psychologicalCareRequests.createdAt),
      asc(psychologicalCareRequests.id),
    );
}

export async function getPsychologicalCareRequestCountsByStatus() {
  const rows = await db
    .select({
      status: psychologicalCareRequests.status,
      total: count(),
    })
    .from(psychologicalCareRequests)
    .groupBy(psychologicalCareRequests.status);
  const counts = Object.fromEntries(
    PSYCHOLOGICAL_CARE_STATUS_VALUES.map((status) => [status, 0]),
  ) as Record<PsychologicalCareStatus, number>;

  for (const row of rows) {
    if (
      PSYCHOLOGICAL_CARE_STATUS_VALUES.includes(
        row.status as PsychologicalCareStatus,
      )
    ) {
      counts[row.status as PsychologicalCareStatus] = Number(row.total);
    }
  }

  return counts;
}

export async function getPsychologicalCareRequestCounts() {
  const byStatus = await getPsychologicalCareRequestCountsByStatus();

  return {
    byStatus,
    total: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
    new: sumStatusGroup(byStatus, "new"),
    inProgress: sumStatusGroup(byStatus, "in_progress"),
    finished: sumStatusGroup(byStatus, "finished"),
  };
}

export async function getPsychologicalCareRequestById(id: string) {
  if (!isUuid(id)) return null;

  const [request] = await db
    .select()
    .from(psychologicalCareRequests)
    .where(eq(psychologicalCareRequests.id, id));

  return request ?? null;
}

export async function getDecryptedPsychologicalCareRequestById(id: string) {
  const request = await getPsychologicalCareRequestById(id);

  if (!request) return null;

  return {
    id: request.id,
    protocol: request.protocol,
    submissionId: request.submissionId,
    submissionSource: request.submissionSource,
    requesterUserId: request.requesterUserId,
    status: normalizePsychologicalCareStatus(request.status),
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    payload: decryptPsychologicalCareRequestRow(request),
  };
}

export function decryptPsychologicalCareRequestRow(
  request: Pick<
    PsychologicalCareRequest,
    | "encryptedPayload"
    | "payloadIv"
    | "payloadAuthTag"
    | "encryptedRequestKey"
    | "requestKeyIv"
    | "requestKeyAuthTag"
  > | null,
) {
  if (!request) return null;

  return decryptPsychologicalCarePayload({
    encryptedPayload: {
      ciphertext: request.encryptedPayload,
      iv: request.payloadIv,
      authTag: request.payloadAuthTag,
    },
    encryptedRequestKey: {
      ciphertext: request.encryptedRequestKey,
      iv: request.requestKeyIv,
      authTag: request.requestKeyAuthTag,
    },
  });
}

export async function listPsychologicalCareRequestEvents(requestId: string) {
  if (!isUuid(requestId)) return [];

  return db
    .select({
      id: psychologicalCareRequestEvents.id,
      actorUserId: psychologicalCareRequestEvents.actorUserId,
      actorName: user.name,
      type: psychologicalCareRequestEvents.type,
      message: psychologicalCareRequestEvents.message,
      createdAt: psychologicalCareRequestEvents.createdAt,
    })
    .from(psychologicalCareRequestEvents)
    .leftJoin(user, eq(psychologicalCareRequestEvents.actorUserId, user.id))
    .where(eq(psychologicalCareRequestEvents.requestId, requestId))
    .orderBy(desc(psychologicalCareRequestEvents.createdAt));
}

export async function recordPsychologicalCareRequestEvent(input: {
  requestId: string;
  actorUserId?: string | null;
  type: string;
  message?: string | null;
}) {
  if (!isUuid(input.requestId)) return null;

  const [event] = await db
    .insert(psychologicalCareRequestEvents)
    .values({
      requestId: input.requestId,
      actorUserId: input.actorUserId,
      type: input.type,
      message: input.message,
    })
    .returning({ id: psychologicalCareRequestEvents.id });

  return event ?? null;
}

export async function recordPsychologicalCareRequestExportEvents(input: {
  requestIds: string[];
  actorUserId: string;
  year: number;
  month: number;
}) {
  const ids = input.requestIds.filter(isUuid);

  if (ids.length === 0) return;

  const monthLabel = `${String(input.month).padStart(2, "0")}/${input.year}`;

  await db.insert(psychologicalCareRequestEvents).values(
    ids.map((requestId) => ({
      requestId,
      actorUserId: input.actorUserId,
      type: "psychological_care.exported",
      message: `Solicitação incluída na exportação mensal de ${monthLabel}.`,
    })),
  );
}

export async function recordPsychologicalCareRequestView(input: {
  requestId: string;
  actorUserId: string;
}) {
  if (!isUuid(input.requestId)) return null;

  const [request] = await db
    .select({ id: psychologicalCareRequests.id })
    .from(psychologicalCareRequests)
    .where(eq(psychologicalCareRequests.id, input.requestId));

  if (!request) return null;

  return recordPsychologicalCareRequestEvent({
    ...input,
    type: "psychological_care.viewed",
    message: "Solicitação consultada no painel.",
  });
}

export async function updatePsychologicalCareRequestStatus(input: {
  requestId: string;
  status: PsychologicalCareStatus;
  actorUserId: string;
}) {
  if (!isUuid(input.requestId)) return null;

  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({
        id: psychologicalCareRequests.id,
        protocol: psychologicalCareRequests.protocol,
        status: psychologicalCareRequests.status,
        updatedAt: psychologicalCareRequests.updatedAt,
      })
      .from(psychologicalCareRequests)
      .where(eq(psychologicalCareRequests.id, input.requestId));

    if (!current) return null;

    if (current.status === input.status) {
      return {
        ...current,
        status: normalizePsychologicalCareStatus(current.status),
      };
    }

    const [request] = await tx
      .update(psychologicalCareRequests)
      .set({
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(psychologicalCareRequests.id, input.requestId))
      .returning({
        id: psychologicalCareRequests.id,
        protocol: psychologicalCareRequests.protocol,
        status: psychologicalCareRequests.status,
        updatedAt: psychologicalCareRequests.updatedAt,
      });

    if (!request) return null;

    await tx.insert(psychologicalCareRequestEvents).values({
      requestId: request.id,
      actorUserId: input.actorUserId,
      type: getPsychologicalCareStatusEventType(input.status),
      message: `Status alterado para ${getPsychologicalCareStatusLabel(input.status)}.`,
    });

    return {
      ...request,
      status: input.status,
    };
  });
}

export type DecryptedPsychologicalCarePayload =
  PsychologicalCareEncryptedPayload;

function toPsychologicalCareEncryptedPayload(
  input: CreatePsychologicalCareRequestInput,
): PsychologicalCareEncryptedPayload {
  return {
    base: input.base,
    city: input.city,
    employeeName: input.employeeName,
    phone: input.phone,
    registration: input.registration,
    jobTitle: input.jobTitle || null,
    management: input.management,
    reason: input.reason,
    requesterName: input.requesterName,
    requesterEmail: input.requesterEmail,
  };
}

function getStatusFilterWhere(
  filter: PsychologicalCareSummaryStatusFilter | undefined,
) {
  if (!filter) return null;

  return inArray(psychologicalCareRequests.status, [
    ...PSYCHOLOGICAL_CARE_STATUS_GROUPS[filter],
  ]);
}

function sumStatusGroup(
  counts: Record<PsychologicalCareStatus, number>,
  group: PsychologicalCareSummaryStatusFilter,
) {
  return PSYCHOLOGICAL_CARE_STATUS_GROUPS[group].reduce(
    (sum, status) => sum + counts[status],
    0,
  );
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  if ("code" in error && error.code === "23505") return true;

  return "cause" in error && isUniqueViolation(error.cause);
}

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function clampInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;

  return Math.min(Math.max(Math.trunc(value), min), max);
}

function normalizeProtocolSearch(value: string) {
  return value.trim().toUpperCase();
}
