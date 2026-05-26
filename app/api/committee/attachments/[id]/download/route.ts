import type { NextRequest } from "next/server";
import { createCommitteeAttachmentResponse } from "@/lib/reports/attachment-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttachmentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: AttachmentRouteContext,
) {
  const { id } = await params;

  return createCommitteeAttachmentResponse({
    request,
    attachmentId: id,
    action: "download",
  });
}
