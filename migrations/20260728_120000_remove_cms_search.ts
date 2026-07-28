import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- O índice continha somente dados derivados pelo plugin de busca.
    -- Remove locks relacionados antes de retirar a referência da coleção.
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payload_locked_documents_rels'
          AND column_name = 'cms_search_id'
      ) THEN
        DELETE FROM "payload_locked_documents"
        WHERE "id" IN (
          SELECT DISTINCT "parent_id"
          FROM "payload_locked_documents_rels"
          WHERE "cms_search_id" IS NOT NULL
        );
      END IF;
    END $$;

    DROP INDEX IF EXISTS "payload_locked_documents_rels_cms_search_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_cms_search_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "cms_search_id";

    DROP TABLE IF EXISTS "cms_search_rels" CASCADE;
    DROP TABLE IF EXISTS "cms_search" CASCADE;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "cms_search" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "priority" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "cms_search_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "imprensa_id" integer,
      "blog_id" integer,
      "vagas_id" integer
    );

    DO $$ BEGIN
      ALTER TABLE "cms_search_rels"
        ADD CONSTRAINT "cms_search_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."cms_search"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_search_rels"
        ADD CONSTRAINT "cms_search_rels_imprensa_fk"
        FOREIGN KEY ("imprensa_id") REFERENCES "public"."imprensa"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_search_rels"
        ADD CONSTRAINT "cms_search_rels_blog_fk"
        FOREIGN KEY ("blog_id") REFERENCES "public"."blog"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_search_rels"
        ADD CONSTRAINT "cms_search_rels_vagas_fk"
        FOREIGN KEY ("vagas_id") REFERENCES "public"."vagas"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "cms_search_updated_at_idx"
      ON "cms_search" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "cms_search_created_at_idx"
      ON "cms_search" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "cms_search_rels_order_idx"
      ON "cms_search_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "cms_search_rels_parent_idx"
      ON "cms_search_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "cms_search_rels_path_idx"
      ON "cms_search_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "cms_search_rels_imprensa_id_idx"
      ON "cms_search_rels" USING btree ("imprensa_id");
    CREATE INDEX IF NOT EXISTS "cms_search_rels_blog_id_idx"
      ON "cms_search_rels" USING btree ("blog_id");
    CREATE INDEX IF NOT EXISTS "cms_search_rels_vagas_id_idx"
      ON "cms_search_rels" USING btree ("vagas_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "cms_search_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_cms_search_fk"
        FOREIGN KEY ("cms_search_id") REFERENCES "public"."cms_search"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_cms_search_id_idx"
      ON "payload_locked_documents_rels" USING btree ("cms_search_id");
  `);
}
