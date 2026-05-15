import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const contactStatusEnum = pgEnum("contact_status", [
  "new",
  "read",
  "in_progress",
  "answered",
  "archived",
  "spam",
]);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    company: varchar("company", { length: 180 }),
    subject: varchar("subject", { length: 180 }),
    message: text("message").notNull(),
    status: contactStatusEnum("status").notNull().default("new"),
    ipHash: varchar("ip_hash", { length: 128 }),
    userAgent: text("user_agent"),
    emailNotificationSent: boolean("email_notification_sent")
      .notNull()
      .default(false),
    emailNotificationError: text("email_notification_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("contacts_status_created_at_idx").on(table.status, table.createdAt),
    index("contacts_created_at_idx").on(table.createdAt),
    index("contacts_email_idx").on(table.email),
  ],
);

export const contactRateLimits = pgTable(
  "contact_rate_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ipHash: varchar("ip_hash", { length: 128 }).notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("contact_rate_limits_ip_window_idx").on(
      table.ipHash,
      table.windowStart,
    ),
    index("contact_rate_limits_ip_hash_idx").on(table.ipHash),
  ],
);

export type Contact = typeof contacts.$inferSelect;
