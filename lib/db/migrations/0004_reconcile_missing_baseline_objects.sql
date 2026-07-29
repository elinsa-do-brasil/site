DO $$
BEGIN
	CREATE TYPE "public"."contact_status" AS ENUM('new', 'read', 'in_progress', 'answered', 'archived', 'spam');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END
$$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" varchar(128) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(40),
	"company" varchar(180),
	"subject" varchar(180),
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'new' NOT NULL,
	"ip_hash" varchar(128),
	"user_agent" text,
	"email_notification_sent" boolean DEFAULT false NOT NULL,
	"email_notification_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "contact_rate_limits_ip_window_idx" ON "contact_rate_limits" USING btree ("ip_hash","window_start");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_rate_limits_ip_hash_idx" ON "contact_rate_limits" USING btree ("ip_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contacts_status_created_at_idx" ON "contacts" USING btree ("status","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contacts_email_idx" ON "contacts" USING btree ("email");
