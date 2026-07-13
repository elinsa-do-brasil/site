import type { NextRequest } from "next/server";
import { createCommitteeReportPdfResponse } from "@/lib/reports/pdf-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReportPdfRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: ReportPdfRouteContext,
) {
  if (!isSameOriginRequest(request)) {
    return new Response(null, {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const { id } = await params;

  return createCommitteeReportPdfResponse({
    request,
    reportId: id,
  });
}

function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  return (
    origin === request.nextUrl.origin &&
    (!fetchSite || fetchSite === "same-origin")
  );
}
