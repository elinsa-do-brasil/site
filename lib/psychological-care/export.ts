import "server-only";

import type { PsychologicalCareRequest } from "@/lib/db/schema/psychological-care";
import { decryptPsychologicalCareRequestRow } from "./repository";
import { getPsychologicalCareStatusLabel } from "./status";

const EXPORT_TIME_ZONE = "America/Sao_Paulo";
const CSV_DELIMITER = ";";
const CSV_LINE_BREAK = "\r\n";

const CSV_HEADERS = [
  "Protocolo",
  "Status",
  "Origem",
  "Data de recebimento",
  "Última atualização",
  "Nome do colaborador",
  "Matrícula",
  "Cargo",
  "Gerência",
  "Base",
  "Cidade",
  "Telefone",
  "Motivo",
  "Nome de quem solicitou",
  "E-mail de quem solicitou",
] as const;

const SUBMISSION_SOURCE_LABELS: Record<string, string> = {
  portal_leader: "Líder (portal interno)",
  ampercuida: "Formulário público (Amper Cuida)",
};

export type PsychologicalCareMonthlyCsvResult = {
  buffer: Buffer;
  rowCount: number;
  failedCount: number;
};

export function getSaoPauloYearMonth(instant: Date): {
  year: number;
  month: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EXPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(instant);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return { year: Number(map.year), month: Number(map.month) };
}

export function getSaoPauloMonthRange(
  year: number,
  month: number,
): { start: Date; end: Date } {
  const start = zonedMonthStartToUtc(year, month);
  const end =
    month === 12
      ? zonedMonthStartToUtc(year + 1, 1)
      : zonedMonthStartToUtc(year, month + 1);

  return { start, end };
}

export function buildPsychologicalCareMonthlyCsv(
  requests: PsychologicalCareRequest[],
): PsychologicalCareMonthlyCsvResult {
  const lines = [CSV_HEADERS.map(escapeCsvField).join(CSV_DELIMITER)];
  let failedCount = 0;

  for (const request of requests) {
    let payload: ReturnType<typeof decryptPsychologicalCareRequestRow>;

    try {
      payload = decryptPsychologicalCareRequestRow(request);
    } catch (error) {
      failedCount += 1;
      console.error(
        `[psychological-care/export] Falha ao descriptografar solicitação ${request.id}`,
        error,
      );
      lines.push(buildErrorRow(request));
      continue;
    }

    if (!payload) {
      failedCount += 1;
      lines.push(buildErrorRow(request));
      continue;
    }

    lines.push(
      [
        request.protocol,
        getPsychologicalCareStatusLabel(request.status),
        SUBMISSION_SOURCE_LABELS[request.submissionSource] ??
          request.submissionSource,
        formatCsvDate(request.createdAt),
        formatCsvDate(request.updatedAt),
        payload.employeeName,
        payload.registration,
        payload.jobTitle ?? "",
        payload.management,
        payload.base,
        payload.city,
        payload.phone,
        payload.reason,
        payload.requesterName ?? "",
        payload.requesterEmail ?? "",
      ]
        .map(escapeCsvField)
        .join(CSV_DELIMITER),
    );
  }

  const csvBody = lines.join(CSV_LINE_BREAK) + CSV_LINE_BREAK;
  const buffer = Buffer.from(`﻿${csvBody}`, "utf8");

  return {
    buffer,
    rowCount: requests.length - failedCount,
    failedCount,
  };
}

function buildErrorRow(request: PsychologicalCareRequest) {
  return [
    request.protocol,
    getPsychologicalCareStatusLabel(request.status),
    SUBMISSION_SOURCE_LABELS[request.submissionSource] ??
      request.submissionSource,
    formatCsvDate(request.createdAt),
    formatCsvDate(request.updatedAt),
    "[ERRO AO DESCRIPTOGRAFAR]",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]
    .map(escapeCsvField)
    .join(CSV_DELIMITER);
}

function escapeCsvField(value: string | number): string {
  const stringValue = String(value);

  if (!/[";\r\n]/.test(stringValue)) return stringValue;

  return `"${stringValue.replace(/"/g, '""')}"`;
}

function formatCsvDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: EXPORT_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function zonedMonthStartToUtc(year: number, month: number): Date {
  const utcGuess = Date.UTC(year, month - 1, 1, 0, 0, 0, 0);
  const offsetMinutes = getTimeZoneOffsetMinutesAt(
    new Date(utcGuess),
    EXPORT_TIME_ZONE,
  );

  return new Date(utcGuess - offsetMinutes * 60_000);
}

function getTimeZoneOffsetMinutesAt(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );

  return (asUtc - instant.getTime()) / 60_000;
}
