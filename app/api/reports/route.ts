import { type NextRequest, NextResponse } from "next/server";
import { createReport } from "@/lib/reports/repository";
import { createReportSchema } from "@/lib/reports/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CONTENT_LENGTH = 64 * 1024;

function jsonResponse(
  status: number,
  body: { ok: boolean; message?: string; protocol?: string },
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
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(400, {
        ok: false,
        message: "Nao foi possivel enviar a denuncia.",
      });
    }

    const report = await createReport(parsed.data);

    return jsonResponse(201, {
      ok: true,
      protocol: report.protocol,
    });
  } catch {
    // Nao registrar body, IP, user-agent, cookies ou qualquer dado tecnico.
    return jsonResponse(500, {
      ok: false,
      message: "Nao foi possivel enviar a denuncia.",
    });
  }
}
