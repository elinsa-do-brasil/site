import { type NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/get-client-ip";
import { createReportUploadToken } from "@/lib/reports/attachment-token";
import { maybeSendReportNotificationEmail } from "@/lib/reports/email";
import {
  assertReportsPublicRateLimit,
  ReportsPublicRateLimitError,
} from "@/lib/reports/rate-limit";
import { createReport } from "@/lib/reports/repository";
import { createReportSchema } from "@/lib/reports/validation";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CONTENT_LENGTH = 64 * 1024;

function jsonResponse(
  status: number,
  body: {
    ok: boolean;
    message?: string;
    protocol?: string;
    reportId?: string;
    uploadToken?: string;
  },
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_CONTENT_LENGTH) {
      return jsonResponse(413, {
        ok: false,
        message: "Nao foi possivel enviar a denuncia.",
      });
    }

    const body = await request.json();
    const { report: reportInput, turnstileToken, website } = body ?? {};

    if (typeof website === "string" && website.trim().length > 0) {
      return jsonResponse(400, {
        ok: false,
        message: "Nao foi possivel enviar a denuncia.",
      });
    }

    if (typeof turnstileToken !== "string" || turnstileToken.length === 0) {
      return jsonResponse(400, {
        ok: false,
        message: "Nao foi possivel enviar a denuncia.",
      });
    }

    const parsed = createReportSchema.safeParse(reportInput);

    if (!parsed.success) {
      return jsonResponse(400, {
        ok: false,
        message: "Nao foi possivel enviar a denuncia.",
      });
    }

    try {
      await assertReportsPublicRateLimit(request.headers);
    } catch (error) {
      if (
        error instanceof ReportsPublicRateLimitError &&
        error.reason === "limit_exceeded"
      ) {
        return jsonResponse(429, {
          ok: false,
          message: "Muitas tentativas. Tente novamente mais tarde.",
        });
      }

      return jsonResponse(400, {
        ok: false,
        message: "Nao foi possivel enviar a denuncia.",
      });
    }

    // O IP é usado apenas de forma efêmera aqui (digest de rate limit e
    // parâmetro do siteverify) — nunca gravado no banco, em logs ou no
    // Sentry, mantendo o desenho de não-registro de dados desta rota.
    const verified = await verifyTurnstileToken({
      token: turnstileToken,
      remoteIp: getClientIp(request.headers),
    });

    if (!verified) {
      return jsonResponse(403, {
        ok: false,
        message: "Nao foi possivel enviar a denuncia.",
      });
    }

    const report = await createReport(parsed.data);
    const notification = await maybeSendReportNotificationEmail(report);

    if (!notification.sent && !notification.skipped) {
      console.error(
        "Nao foi possivel enviar o aviso de nova denuncia.",
        notification.error,
      );
    }

    return jsonResponse(201, {
      ok: true,
      protocol: report.protocol,
      reportId: report.id,
      uploadToken: createReportUploadToken(report.id),
    });
  } catch {
    // Nao registrar body, IP, user-agent, cookies ou qualquer dado tecnico.
    return jsonResponse(500, {
      ok: false,
      message: "Nao foi possivel enviar a denuncia.",
    });
  }
}
