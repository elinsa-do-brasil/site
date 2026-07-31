CREATE TABLE "psychological_care_request_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"actor_user_id" text,
	"type" varchar(100) NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psychological_care_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"protocol" varchar(40) NOT NULL,
	"submission_id" uuid NOT NULL,
	"requester_user_id" text NOT NULL,
	"status" varchar(40) DEFAULT 'new' NOT NULL,
	"encrypted_payload" text NOT NULL,
	"payload_iv" text NOT NULL,
	"payload_auth_tag" text NOT NULL,
	"encrypted_request_key" text NOT NULL,
	"request_key_iv" text NOT NULL,
	"request_key_auth_tag" text NOT NULL,
	"encryption_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "psychological_care_request_events" ADD CONSTRAINT "psychological_care_request_events_request_id_psychological_care_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."psychological_care_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "psychological_care_request_events_request_id_idx" ON "psychological_care_request_events" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "psychological_care_request_events_created_at_idx" ON "psychological_care_request_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "psychological_care_requests_protocol_idx" ON "psychological_care_requests" USING btree ("protocol");--> statement-breakpoint
CREATE UNIQUE INDEX "psychological_care_requests_submission_id_idx" ON "psychological_care_requests" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "psychological_care_requests_status_created_at_idx" ON "psychological_care_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "psychological_care_requests_requester_user_id_idx" ON "psychological_care_requests" USING btree ("requester_user_id");--> statement-breakpoint
CREATE INDEX "psychological_care_requests_created_at_idx" ON "psychological_care_requests" USING btree ("created_at");--> statement-breakpoint
INSERT INTO "team" ("id", "name", "organization_id")
SELECT
	'team_elinsa_atendimento_psicologico',
	'atendimento_psicologico',
	"id"
FROM "organization"
WHERE "slug" = 'elinsa'
ON CONFLICT DO NOTHING;
