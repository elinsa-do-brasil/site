import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "email" text NOT NULL UNIQUE,
      "email_verified" boolean NOT NULL DEFAULT false,
      "image" text,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "user_email_idx" ON "user" ("email");

    CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY,
      "expires_at" timestamp with time zone NOT NULL,
      "token" text NOT NULL UNIQUE,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
      "ip_address" text,
      "user_agent" text,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "active_organization_id" text,
      "active_team_id" text
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "session_token_idx" ON "session" ("token");
    CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("user_id");

    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY,
      "account_id" text NOT NULL,
      "provider_id" text NOT NULL,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "access_token" text,
      "refresh_token" text,
      "id_token" text,
      "access_token_expires_at" timestamp with time zone,
      "refresh_token_expires_at" timestamp with time zone,
      "scope" text,
      "password" text,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" ("user_id");

    CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expires_at" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");

    CREATE TABLE IF NOT EXISTS "organization" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "logo" text,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "organization_slug_idx" ON "organization" ("slug");

    CREATE TABLE IF NOT EXISTS "member" (
      "id" text PRIMARY KEY,
      "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "role" text NOT NULL DEFAULT 'member',
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "member_organization_id_idx" ON "member" ("organization_id");
    CREATE INDEX IF NOT EXISTS "member_user_id_idx" ON "member" ("user_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "member_organization_user_idx" ON "member" ("organization_id", "user_id");

    CREATE TABLE IF NOT EXISTS "team" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "team_organization_id_idx" ON "team" ("organization_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "team_organization_name_idx" ON "team" ("organization_id", "name");

    CREATE TABLE IF NOT EXISTS "team_member" (
      "id" text PRIMARY KEY,
      "team_id" text NOT NULL REFERENCES "team"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "team_member_team_id_idx" ON "team_member" ("team_id");
    CREATE INDEX IF NOT EXISTS "team_member_user_id_idx" ON "team_member" ("user_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "team_member_team_user_idx" ON "team_member" ("team_id", "user_id");

    CREATE TABLE IF NOT EXISTS "invitation" (
      "id" text PRIMARY KEY,
      "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
      "email" text NOT NULL,
      "role" text NOT NULL,
      "status" text NOT NULL DEFAULT 'pending',
      "expires_at" timestamp with time zone,
      "inviter_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "team_id" text,
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "invitation_organization_id_idx" ON "invitation" ("organization_id");
    CREATE INDEX IF NOT EXISTS "invitation_email_idx" ON "invitation" ("email");
    CREATE INDEX IF NOT EXISTS "invitation_team_id_idx" ON "invitation" ("team_id");

    CREATE TABLE IF NOT EXISTS "organization_role" (
      "id" text PRIMARY KEY,
      "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
      "role" text NOT NULL,
      "permission" text NOT NULL,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "organization_role_organization_id_idx" ON "organization_role" ("organization_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "organization_role_organization_role_idx" ON "organization_role" ("organization_id", "role");

    CREATE TABLE IF NOT EXISTS "reports" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "protocol" varchar(40) NOT NULL UNIQUE,
      "category" varchar(100) NOT NULL,
      "status" varchar(40) NOT NULL DEFAULT 'new',
      "encrypted_payload" text NOT NULL,
      "payload_iv" text NOT NULL,
      "payload_auth_tag" text NOT NULL,
      "encrypted_report_key" text NOT NULL,
      "report_key_iv" text NOT NULL,
      "report_key_auth_tag" text NOT NULL,
      "encryption_version" integer NOT NULL DEFAULT 1,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "reports_protocol_idx" ON "reports" ("protocol");
    CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" ("status");
    CREATE INDEX IF NOT EXISTS "reports_category_idx" ON "reports" ("category");
    CREATE INDEX IF NOT EXISTS "reports_created_at_idx" ON "reports" ("created_at");

    CREATE TABLE IF NOT EXISTS "report_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "report_id" uuid NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
      "actor_user_id" text,
      "type" varchar(80) NOT NULL,
      "message" text,
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "report_events_report_id_idx" ON "report_events" ("report_id");
    CREATE INDEX IF NOT EXISTS "report_events_created_at_idx" ON "report_events" ("created_at");

    CREATE TABLE IF NOT EXISTS "report_assignments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "report_id" uuid NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL,
      "role" varchar(40) NOT NULL DEFAULT 'consultant',
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "report_assignments_report_id_idx" ON "report_assignments" ("report_id");
    CREATE INDEX IF NOT EXISTS "report_assignments_user_id_idx" ON "report_assignments" ("user_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "report_assignments_report_user_idx" ON "report_assignments" ("report_id", "user_id");

    CREATE TABLE IF NOT EXISTS "report_comments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "report_id" uuid NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
      "author_user_id" text NOT NULL,
      "encrypted_comment" text NOT NULL,
      "comment_iv" text NOT NULL,
      "comment_auth_tag" text NOT NULL,
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "report_comments_report_id_idx" ON "report_comments" ("report_id");
    CREATE INDEX IF NOT EXISTS "report_comments_created_at_idx" ON "report_comments" ("created_at");

    INSERT INTO "organization" ("id", "name", "slug")
    VALUES ('org_elinsa', 'Elinsa', 'elinsa')
    ON CONFLICT ("slug") DO NOTHING;

    INSERT INTO "team" ("id", "name", "organization_id")
    VALUES
      ('team_elinsa_ti', 'ti', 'org_elinsa'),
      ('team_elinsa_comite_etica', 'comite_etica', 'org_elinsa'),
      ('team_elinsa_rh', 'rh', 'org_elinsa'),
      ('team_elinsa_administrativo', 'administrativo', 'org_elinsa'),
      ('team_elinsa_operacional', 'operacional', 'org_elinsa'),
      ('team_elinsa_diretoria', 'diretoria', 'org_elinsa')
    ON CONFLICT ("organization_id", "name") DO NOTHING;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "report_comments";
    DROP TABLE IF EXISTS "report_assignments";
    DROP TABLE IF EXISTS "report_events";
    DROP TABLE IF EXISTS "reports";
    DROP TABLE IF EXISTS "organization_role";
    DROP TABLE IF EXISTS "invitation";
    DROP TABLE IF EXISTS "team_member";
    DROP TABLE IF EXISTS "team";
    DROP TABLE IF EXISTS "member";
    DROP TABLE IF EXISTS "organization";
    DROP TABLE IF EXISTS "verification";
    DROP TABLE IF EXISTS "account";
    DROP TABLE IF EXISTS "session";
    DROP TABLE IF EXISTS "user";
  `);
}
