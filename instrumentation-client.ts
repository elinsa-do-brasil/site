// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import {
  SENTRY_DATA_COLLECTION,
  shouldDiscardSensitiveSentryBreadcrumb,
  shouldDiscardSensitiveSentryEvent,
} from "./lib/telemetry-privacy";

function currentBrowserPath() {
  return typeof window === "undefined" ? undefined : window.location.pathname;
}

Sentry.init({
  dsn: "https://f6bb2a7b535808afd235b6f15c8e96d8@o4511542556360704.ingest.us.sentry.io/4511542560948224",
  dataCollection: SENTRY_DATA_COLLECTION,
  sendClientReports: false,
  beforeBreadcrumb(breadcrumb) {
    return shouldDiscardSensitiveSentryBreadcrumb(
      breadcrumb,
      currentBrowserPath(),
    )
      ? null
      : breadcrumb;
  },
  beforeSend(event) {
    return shouldDiscardSensitiveSentryEvent(event, currentBrowserPath())
      ? null
      : event;
  },
  beforeSendTransaction(event) {
    return shouldDiscardSensitiveSentryEvent(event, currentBrowserPath())
      ? null
      : event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
