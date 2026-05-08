import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_vagas_job_status" AS ENUM('aberta', 'fechada');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_vagas_city" AS ENUM(
        'abaetetuba',
        'acara',
        'alenquer',
        'almeirim',
        'altamira',
        'anapu',
        'aurora-do-para',
        'aveiro',
        'baiao',
        'barcarena',
        'belem',
        'belterra',
        'brasil-novo',
        'bujaru',
        'cameta',
        'concordia-do-para',
        'curua',
        'faro',
        'gurupa',
        'igarape-miri',
        'ipixuna-do-para',
        'itaituba',
        'jacareacanga',
        'juruti',
        'limoreiro-do-ajuru',
        'mae-do-rio',
        'medicilandia',
        'mocajuba',
        'moju',
        'mojui-dos-campos',
        'monte-alegre',
        'novo-progresso',
        'obidos',
        'oriximina',
        'pacaja',
        'paragominas',
        'placas',
        'porto-de-moz',
        'prainha',
        'ruropolis',
        'santarem',
        'sao-domingos-do-capim',
        'sao-miguel-do-guama',
        'senador-jose-porfirio',
        'tailandia',
        'terra-santa',
        'tome-acu',
        'trairao',
        'ulianopolis',
        'uruara',
        'vitoria-do-xingu'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_vagas_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__vagas_v_version_job_status" AS ENUM('aberta', 'fechada');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__vagas_v_version_city" AS ENUM(
        'abaetetuba',
        'acara',
        'alenquer',
        'almeirim',
        'altamira',
        'anapu',
        'aurora-do-para',
        'aveiro',
        'baiao',
        'barcarena',
        'belem',
        'belterra',
        'brasil-novo',
        'bujaru',
        'cameta',
        'concordia-do-para',
        'curua',
        'faro',
        'gurupa',
        'igarape-miri',
        'ipixuna-do-para',
        'itaituba',
        'jacareacanga',
        'juruti',
        'limoreiro-do-ajuru',
        'mae-do-rio',
        'medicilandia',
        'mocajuba',
        'moju',
        'mojui-dos-campos',
        'monte-alegre',
        'novo-progresso',
        'obidos',
        'oriximina',
        'pacaja',
        'paragominas',
        'placas',
        'porto-de-moz',
        'prainha',
        'ruropolis',
        'santarem',
        'sao-domingos-do-capim',
        'sao-miguel-do-guama',
        'senador-jose-porfirio',
        'tailandia',
        'terra-santa',
        'tome-acu',
        'trairao',
        'ulianopolis',
        'uruara',
        'vitoria-do-xingu'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__vagas_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TYPE "public"."enum_payload_folders_folder_type" ADD VALUE IF NOT EXISTS 'vagas';

    CREATE TABLE IF NOT EXISTS "vagas" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "summary" varchar,
      "job_status" "enum_vagas_job_status" DEFAULT 'aberta',
      "sector" varchar,
      "city" "enum_vagas_city",
      "published_at" timestamp(3) with time zone,
      "slug" varchar,
      "content" jsonb,
      "folder_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "deleted_at" timestamp(3) with time zone,
      "_status" "enum_vagas_status" DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "_vagas_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_title" varchar,
      "version_summary" varchar,
      "version_job_status" "enum__vagas_v_version_job_status" DEFAULT 'aberta',
      "version_sector" varchar,
      "version_city" "enum__vagas_v_version_city",
      "version_published_at" timestamp(3) with time zone,
      "version_slug" varchar,
      "version_content" jsonb,
      "version_folder_id" integer,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version_deleted_at" timestamp(3) with time zone,
      "version__status" "enum__vagas_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "vagas_id" integer;

    DO $$ BEGIN
      ALTER TABLE "vagas"
        ADD CONSTRAINT "vagas_folder_id_payload_folders_id_fk"
        FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_vagas_v"
        ADD CONSTRAINT "_vagas_v_parent_id_vagas_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."vagas"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_vagas_v"
        ADD CONSTRAINT "_vagas_v_version_folder_id_payload_folders_id_fk"
        FOREIGN KEY ("version_folder_id") REFERENCES "public"."payload_folders"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_vagas_fk"
        FOREIGN KEY ("vagas_id") REFERENCES "public"."vagas"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "vagas_slug_idx" ON "vagas" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "vagas_folder_idx" ON "vagas" USING btree ("folder_id");
    CREATE INDEX IF NOT EXISTS "vagas_updated_at_idx" ON "vagas" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "vagas_created_at_idx" ON "vagas" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "vagas_deleted_at_idx" ON "vagas" USING btree ("deleted_at");
    CREATE INDEX IF NOT EXISTS "vagas__status_idx" ON "vagas" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "_vagas_v_parent_idx" ON "_vagas_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_vagas_v_version_version_slug_idx" ON "_vagas_v" USING btree ("version_slug");
    CREATE INDEX IF NOT EXISTS "_vagas_v_version_version_folder_idx" ON "_vagas_v" USING btree ("version_folder_id");
    CREATE INDEX IF NOT EXISTS "_vagas_v_version_version_updated_at_idx" ON "_vagas_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_vagas_v_version_version_created_at_idx" ON "_vagas_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_vagas_v_version_version_deleted_at_idx" ON "_vagas_v" USING btree ("version_deleted_at");
    CREATE INDEX IF NOT EXISTS "_vagas_v_version_version__status_idx" ON "_vagas_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_vagas_v_created_at_idx" ON "_vagas_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_vagas_v_updated_at_idx" ON "_vagas_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_vagas_v_latest_idx" ON "_vagas_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_vagas_id_idx" ON "payload_locked_documents_rels" USING btree ("vagas_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_vagas_id_idx";

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        DROP CONSTRAINT "payload_locked_documents_rels_vagas_fk";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "vagas_id";

    DROP TABLE IF EXISTS "_vagas_v" CASCADE;
    DROP TABLE IF EXISTS "vagas" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__vagas_v_version_status";
    DROP TYPE IF EXISTS "public"."enum__vagas_v_version_city";
    DROP TYPE IF EXISTS "public"."enum__vagas_v_version_job_status";
    DROP TYPE IF EXISTS "public"."enum_vagas_status";
    DROP TYPE IF EXISTS "public"."enum_vagas_city";
    DROP TYPE IF EXISTS "public"."enum_vagas_job_status";
  `);
}
