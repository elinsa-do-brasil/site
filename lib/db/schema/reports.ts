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

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    protocol: varchar("protocol", { length: 40 }).notNull().unique(),
    category: varchar("category", { length: 100 }).notNull(),
    status: varchar("status", { length: 40 }).notNull().default("new"),
    encryptedPayload: text("encrypted_payload").notNull(),
    payloadIv: text("payload_iv").notNull(),
    payloadAuthTag: text("payload_auth_tag").notNull(),
    encryptedReportKey: text("encrypted_report_key").notNull(),
    reportKeyIv: text("report_key_iv").notNull(),
    reportKeyAuthTag: text("report_key_auth_tag").notNull(),
    encryptionVersion: integer("encryption_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("reports_protocol_idx").on(table.protocol),
    index("reports_status_idx").on(table.status),
    index("reports_category_idx").on(table.category),
    index("reports_created_at_idx").on(table.createdAt),
  ],
);

export const reportEvents = pgTable(
  "report_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id"),
    type: varchar("type", { length: 80 }).notNull(),
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("report_events_report_id_idx").on(table.reportId),
    index("report_events_created_at_idx").on(table.createdAt),
  ],
);

export const reportAssignments = pgTable(
  "report_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: varchar("role", { length: 40 }).notNull().default("consultant"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("report_assignments_report_id_idx").on(table.reportId),
    index("report_assignments_user_id_idx").on(table.userId),
    uniqueIndex("report_assignments_report_user_idx").on(
      table.reportId,
      table.userId,
    ),
  ],
);

export const reportComments = pgTable(
  "report_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id").notNull(),
    encryptedComment: text("encrypted_comment").notNull(),
    commentIv: text("comment_iv").notNull(),
    commentAuthTag: text("comment_auth_tag").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("report_comments_report_id_idx").on(table.reportId),
    index("report_comments_created_at_idx").on(table.createdAt),
  ],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ReportEvent = typeof reportEvents.$inferSelect;
export type ReportAssignment = typeof reportAssignments.$inferSelect;
export type ReportComment = typeof reportComments.$inferSelect;
