CREATE TABLE "report_attachment_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"attachment_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"action" varchar(40) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"encrypted_file_key" text NOT NULL,
	"encrypted_file_key_iv" text NOT NULL,
	"encrypted_file_key_auth_tag" text NOT NULL,
	"key_encryption_ephemeral_public_key" text NOT NULL,
	"key_encryption_salt" text NOT NULL,
	"file_iv" text NOT NULL,
	"file_auth_tag" text NOT NULL,
	"encrypted_original_name" text NOT NULL,
	"original_name_iv" text NOT NULL,
	"original_name_auth_tag" text NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size_bytes" integer NOT NULL,
	"encrypted_size_bytes" integer NOT NULL,
	"ciphertext_sha256" varchar(64) NOT NULL,
	"key_id" varchar(80) DEFAULT 'reports-ecdh-p384-v1' NOT NULL,
	"upload_status" varchar(40) DEFAULT 'completed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_attachment_access_logs" ADD CONSTRAINT "report_attachment_access_logs_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_attachment_access_logs" ADD CONSTRAINT "report_attachment_access_logs_attachment_id_report_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."report_attachments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_attachments" ADD CONSTRAINT "report_attachments_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "report_attachment_access_logs_report_id_idx" ON "report_attachment_access_logs" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "report_attachment_access_logs_attachment_id_idx" ON "report_attachment_access_logs" USING btree ("attachment_id");--> statement-breakpoint
CREATE INDEX "report_attachment_access_logs_created_at_idx" ON "report_attachment_access_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "report_attachments_report_id_idx" ON "report_attachments" USING btree ("report_id");--> statement-breakpoint
CREATE UNIQUE INDEX "report_attachments_storage_key_idx" ON "report_attachments" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "report_attachments_created_at_idx" ON "report_attachments" USING btree ("created_at");