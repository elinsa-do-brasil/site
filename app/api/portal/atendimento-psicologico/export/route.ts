import type { NextRequest } from "next/server";
import { createPsychologicalCareExportResponse } from "@/lib/psychological-care/export-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return new Response(null, {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return createPsychologicalCareExportResponse({ request });
}

function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  return (
    origin === request.nextUrl.origin &&
    (!fetchSite || fetchSite === "same-origin")
  );
}
