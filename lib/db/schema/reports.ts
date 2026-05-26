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

export const reportAttachments = pgTable(
  "report_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    encryptedFileKey: text("encrypted_file_key").notNull(),
    encryptedFileKeyIv: text("encrypted_file_key_iv").notNull(),
    encryptedFileKeyAuthTag: text("encrypted_file_key_auth_tag").notNull(),
    keyEncryptionEphemeralPublicKey: text(
      "key_encryption_ephemeral_public_key",
    ).notNull(),
    keyEncryptionSalt: text("key_encryption_salt").notNull(),
    fileIv: text("file_iv").notNull(),
    fileAuthTag: text("file_auth_tag").notNull(),
    encryptedOriginalName: text("encrypted_original_name").notNull(),
    originalNameIv: text("original_name_iv").notNull(),
    originalNameAuthTag: text("original_name_auth_tag").notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    encryptedSizeBytes: integer("encrypted_size_bytes").notNull(),
    ciphertextSha256: varchar("ciphertext_sha256", { length: 64 }).notNull(),
    keyId: varchar("key_id", { length: 80 })
      .notNull()
      .default("reports-ecdh-p384-v1"),
    uploadStatus: varchar("upload_status", { length: 40 })
      .notNull()
      .default("completed"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("report_attachments_report_id_idx").on(table.reportId),
    uniqueIndex("report_attachments_storage_key_idx").on(table.storageKey),
    index("report_attachments_created_at_idx").on(table.createdAt),
  ],
);

export const reportAttachmentAccessLogs = pgTable(
  "report_attachment_access_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    attachmentId: uuid("attachment_id")
      .notNull()
      .references(() => reportAttachments.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    action: varchar("action", { length: 40 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("report_attachment_access_logs_report_id_idx").on(table.reportId),
    index("report_attachment_access_logs_attachment_id_idx").on(
      table.attachmentId,
    ),
    index("report_attachment_access_logs_created_at_idx").on(table.createdAt),
  ],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ReportEvent = typeof reportEvents.$inferSelect;
export type ReportAssignment = typeof reportAssignments.$inferSelect;
export type ReportComment = typeof reportComments.$inferSelect;
export type ReportAttachment = typeof reportAttachments.$inferSelect;
export type NewReportAttachment = typeof reportAttachments.$inferInsert;
export type ReportAttachmentAccessLog =
  typeof reportAttachmentAccessLogs.$inferSelect;
