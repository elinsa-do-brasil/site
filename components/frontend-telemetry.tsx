"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";
import { isSensitiveTelemetryPath } from "@/lib/telemetry-privacy";

type SpeedInsightEvent = {
  route?: string;
  type: "vital";
  url: string;
};

function isCurrentBrowserPathSensitive() {
  return (
    typeof window !== "undefined" &&
    isSensitiveTelemetryPath(window.location.pathname)
  );
}

function filterAnalyticsEvent(event: BeforeSendEvent) {
  return isCurrentBrowserPathSensitive() || isSensitiveTelemetryPath(event.url)
    ? null
    : event;
}

function filterSpeedInsightEvent(event: SpeedInsightEvent) {
  return isCurrentBrowserPathSensitive() ||
    isSensitiveTelemetryPath(event.url) ||
    isSensitiveTelemetryPath(event.route)
    ? null
    : event;
}

export function FrontendTelemetry() {
  const pathname = usePathname();

  if (isSensitiveTelemetryPath(pathname)) {
    return null;
  }

  return (
    <>
      <SpeedInsights beforeSend={filterSpeedInsightEvent} />
      <Analytics beforeSend={filterAnalyticsEvent} />
    </>
  );
}
