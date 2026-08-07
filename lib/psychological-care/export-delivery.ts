import "server-only";

import type { NextRequest } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { getPsychologicalCareAccessContext } from "@/lib/psychological-care/access";
import {
  buildPsychologicalCareMonthlyCsv,
  getSaoPauloMonthRange,
  getSaoPauloYearMonth,
} from "@/lib/psychological-care/export";
import {
  listPsychologicalCareRequestsCreatedBetween,
  recordPsychologicalCareRequestExportEvents,
} from "@/lib/psychological-care/repository";

const EARLIEST_EXPORT_YEAR = 2020;
const MAX_EXPORT_ROWS = 5_000;
const RATE_LIMIT_RETRY_AFTER_SECONDS = "10";
const activePsychologicalCareExports = new Set<string>();

const psychologicalCareExportInputSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

export async function createPsychologicalCareExportResponse(input: {
  request: NextRequest;
}) {
  const session = await auth.api.getSession({
    headers: input.request.headers,
  });
  const userId = session?.user.id;

  if (!userId) {
    return plainResponse(401);
  }

  const accessContext = await getPsychologicalCareAccessContext(userId);

  if (!accessContext?.hasPanelAccess) {
    return plainResponse(403);
  }

  const rawBody = await input.request.json().catch(() => null);
  const parsedInput = psychologicalCareExportInputSchema.safeParse(rawBody);

  if (!parsedInput.success) {
    return plainResponse(422);
  }

  const { year, month } = parsedInput.data;
  const { year: currentYear, month: currentMonth } = getSaoPauloYearMonth(
    new Date(),
  );
  const isFuturePeriod =
    year > currentYear || (year === currentYear && month > currentMonth);
  const isBeforeEarliest = year < EARLIEST_EXPORT_YEAR;

  if (isFuturePeriod || isBeforeEarliest) {
    return plainResponse(422);
  }

  let slotAcquired = false;

  try {
    if (activePsychologicalCareExports.has(userId)) {
      return plainResponse(429, {
        "Retry-After": RATE_LIMIT_RETRY_AFTER_SECONDS,
      });
    }

    activePsychologicalCareExports.add(userId);
    slotAcquired = true;

    const { start, end } = getSaoPauloMonthRange(year, month);
    const requests = await listPsychologicalCareRequestsCreatedBetween({
      start,
      end,
    });

    if (requests.length > MAX_EXPORT_ROWS) {
      return plainResponse(413);
    }

    const { buffer, rowCount, failedCount } =
      buildPsychologicalCareMonthlyCsv(requests);

    if (requests.length > 0) {
      await recordPsychologicalCareRequestExportEvents({
        requestIds: requests.map((request) => request.id),
        actorUserId: userId,
        year,
        month,
      });
    }

    const fileName = `atendimento-psicologico-${year}-${String(month).padStart(2, "0")}.csv`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": contentDisposition(fileName),
        "Content-Length": String(buffer.length),
        "Content-Type": "text/csv; charset=utf-8",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "X-Psychological-Care-Export-Row-Count": String(rowCount),
        "X-Psychological-Care-Export-Failed-Count": String(failedCount),
      },
    });
  } catch {
    return plainResponse(500);
  } finally {
    if (slotAcquired) {
      activePsychologicalCareExports.delete(userId);
    }
  }
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

function contentDisposition(fileName: string) {
  return `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
