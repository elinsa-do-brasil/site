// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import {
  SENTRY_DATA_COLLECTION,
  shouldDiscardSensitiveSentryBreadcrumb,
  shouldDiscardSensitiveSentryEvent,
} from "./lib/telemetry-privacy";

Sentry.init({
  dsn: "https://f6bb2a7b535808afd235b6f15c8e96d8@o4511542556360704.ingest.us.sentry.io/4511542560948224",
  dataCollection: SENTRY_DATA_COLLECTION,
  sendClientReports: false,
  beforeBreadcrumb(breadcrumb) {
    return shouldDiscardSensitiveSentryBreadcrumb(breadcrumb)
      ? null
      : breadcrumb;
  },
  beforeSend(event) {
    return shouldDiscardSensitiveSentryEvent(event) ? null : event;
  },
  beforeSendTransaction(event) {
    return shouldDiscardSensitiveSentryEvent(event) ? null : event;
  },
});
