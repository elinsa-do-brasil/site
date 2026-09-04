import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const psychologicalCareRequests = pgTable(
  "psychological_care_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    protocol: varchar("protocol", { length: 40 }).notNull(),
    submissionId: uuid("submission_id").notNull(),
    submissionSource: varchar("submission_source", { length: 40 })
      .notNull()
      .default("portal_leader"),
    requesterUserId: text("requester_user_id"),
    status: varchar("status", { length: 40 }).notNull().default("new"),
    encryptedPayload: text("encrypted_payload").notNull(),
    payloadIv: text("payload_iv").notNull(),
    payloadAuthTag: text("payload_auth_tag").notNull(),
    encryptedRequestKey: text("encrypted_request_key").notNull(),
    requestKeyIv: text("request_key_iv").notNull(),
    requestKeyAuthTag: text("request_key_auth_tag").notNull(),
    encryptionVersion: integer("encryption_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("psychological_care_requests_protocol_idx").on(table.protocol),
    uniqueIndex("psychological_care_requests_submission_id_idx").on(
      table.submissionId,
    ),
    index("psychological_care_requests_status_created_at_idx").on(
      table.status,
      table.createdAt,
    ),
    index("psychological_care_requests_requester_user_id_idx").on(
      table.requesterUserId,
    ),
    index("psychological_care_requests_created_at_idx").on(table.createdAt),
  ],
);

export const psychologicalCareRequestEvents = pgTable(
  "psychological_care_request_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => psychologicalCareRequests.id, {
        onDelete: "cascade",
      }),
    actorUserId: text("actor_user_id"),
    type: varchar("type", { length: 100 }).notNull(),
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("psychological_care_request_events_request_id_idx").on(
      table.requestId,
    ),
    index("psychological_care_request_events_created_at_idx").on(
      table.createdAt,
    ),
  ],
);

export type PsychologicalCareRequest =
  typeof psychologicalCareRequests.$inferSelect;
export type NewPsychologicalCareRequest =
  typeof psychologicalCareRequests.$inferInsert;
export type PsychologicalCareRequestEvent =
  typeof psychologicalCareRequestEvents.$inferSelect;
