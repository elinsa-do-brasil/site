import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-postgres";

const contentTables = [
  ["imprensa", "content"],
  ["_imprensa_v", "version_content"],
  ["blog", "content"],
  ["_blog_v", "version_content"],
  ["vagas", "content"],
  ["_vagas_v", "version_content"],
] as const;

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- O valor antigo "galeria" pertencia à coleção que já usa a tabela
    -- "media". Renomeá-lo primeiro atualiza os folders existentes sem usar
    -- um novo valor de enum dentro desta mesma transação.
    ALTER TYPE "public"."enum_payload_folders_folder_type"
      RENAME VALUE 'galeria' TO 'media';
    ALTER TYPE "public"."enum_payload_folders_folder_type"
      ADD VALUE 'galeria' AFTER 'media';

    CREATE TABLE "galeria" (
      "id" serial PRIMARY KEY NOT NULL,
      "alt" varchar NOT NULL,
      "description" varchar NOT NULL,
      "prefix" varchar DEFAULT 'galeria-publica',
      "blurhash" varchar,
      "blur_data_url" varchar,
      "folder_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "deleted_at" timestamp(3) with time zone,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric
    );

    CREATE TABLE "galeria_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "users_id" integer
    );

    ALTER TABLE "galeria"
      ADD CONSTRAINT "galeria_folder_id_payload_folders_id_fk"
      FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id")
      ON DELETE set null ON UPDATE no action;
    ALTER TABLE "galeria_rels"
      ADD CONSTRAINT "galeria_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."galeria"("id")
      ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "galeria_rels"
      ADD CONSTRAINT "galeria_rels_users_fk"
      FOREIGN KEY ("users_id") REFERENCES "public"."users"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "galeria_folder_idx" ON "galeria" USING btree ("folder_id");
    CREATE INDEX "galeria_updated_at_idx" ON "galeria" USING btree ("updated_at");
    CREATE INDEX "galeria_created_at_idx" ON "galeria" USING btree ("created_at");
    CREATE INDEX "galeria_deleted_at_idx" ON "galeria" USING btree ("deleted_at");
    CREATE UNIQUE INDEX "galeria_filename_idx" ON "galeria" USING btree ("filename");
    CREATE INDEX "galeria_rels_order_idx" ON "galeria_rels" USING btree ("order");
    CREATE INDEX "galeria_rels_parent_idx" ON "galeria_rels" USING btree ("parent_id");
    CREATE INDEX "galeria_rels_path_idx" ON "galeria_rels" USING btree ("path");
    CREATE INDEX "galeria_rels_users_id_idx" ON "galeria_rels" USING btree ("users_id");

    -- A coluna media_id já existia, mas a constraint ainda carregava o nome
    -- da coleção antiga. Liberamos esse nome para a nova galeria.
    ALTER TABLE "payload_locked_documents_rels"
      RENAME CONSTRAINT "payload_locked_documents_rels_galeria_fk"
      TO "payload_locked_documents_rels_media_fk";
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN "galeria_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_galeria_fk"
      FOREIGN KEY ("galeria_id") REFERENCES "public"."galeria"("id")
      ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_galeria_id_idx"
      ON "payload_locked_documents_rels" USING btree ("galeria_id");

    -- O endpoint público da coleção existente muda de /api/galeria para
    -- /api/media. O prefixo físico dos blobs continua sendo "galeria".
    UPDATE "media"
    SET
      "url" = replace("url", '/api/galeria/file/', '/api/media/file/'),
      "thumbnail_u_r_l" = replace("thumbnail_u_r_l", '/api/galeria/file/', '/api/media/file/'),
      "sizes_thumbnail_url" = replace("sizes_thumbnail_url", '/api/galeria/file/', '/api/media/file/'),
      "sizes_card_url" = replace("sizes_card_url", '/api/galeria/file/', '/api/media/file/'),
      "sizes_hero_url" = replace("sizes_hero_url", '/api/galeria/file/', '/api/media/file/')
    WHERE
      coalesce("url", '') LIKE '%/api/galeria/file/%'
      OR coalesce("thumbnail_u_r_l", '') LIKE '%/api/galeria/file/%'
      OR coalesce("sizes_thumbnail_url", '') LIKE '%/api/galeria/file/%'
      OR coalesce("sizes_card_url", '') LIKE '%/api/galeria/file/%'
      OR coalesce("sizes_hero_url", '') LIKE '%/api/galeria/file/%';

    UPDATE "activity_log"
    SET
      "resource" = 'media',
      "data" = CASE
        WHEN "data"::text LIKE '%/api/galeria/file/%'
          THEN replace("data"::text, '/api/galeria/file/', '/api/media/file/')::jsonb
        ELSE "data"
      END
    WHERE "resource" = 'galeria';

    UPDATE "imports"
    SET "collection_slug" = 'media'
    WHERE "collection_slug" = 'galeria';
    UPDATE "exports"
    SET "collection_slug" = 'media'
    WHERE "collection_slug" = 'galeria';
  `);

  for (const [table, column] of contentTables) {
    await db.execute(
      sql.raw(`
      UPDATE "${table}"
      SET "${column}" = replace(
        replace("${column}"::text, '"relationTo": "galeria"', '"relationTo": "media"'),
        '/api/galeria/file/',
        '/api/media/file/'
      )::jsonb
      WHERE "${column}" IS NOT NULL
        AND (
          "${column}"::text LIKE '%"relationTo": "galeria"%'
          OR "${column}"::text LIKE '%/api/galeria/file/%'
        );
    `),
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [table, column] of contentTables) {
    await db.execute(
      sql.raw(`
      UPDATE "${table}"
      SET "${column}" = replace(
        replace("${column}"::text, '"relationTo": "media"', '"relationTo": "galeria"'),
        '/api/media/file/',
        '/api/galeria/file/'
      )::jsonb
      WHERE "${column}" IS NOT NULL
        AND (
          "${column}"::text LIKE '%"relationTo": "media"%'
          OR "${column}"::text LIKE '%/api/media/file/%'
        );
    `),
    );
  }

  await db.execute(sql`
    -- Logs da coleção nova não têm equivalente no esquema anterior.
    DELETE FROM "activity_log" WHERE "resource" = 'galeria';
    UPDATE "activity_log"
    SET
      "resource" = 'galeria',
      "data" = CASE
        WHEN "data"::text LIKE '%/api/media/file/%'
          THEN replace("data"::text, '/api/media/file/', '/api/galeria/file/')::jsonb
        ELSE "data"
      END
    WHERE "resource" = 'media';

    UPDATE "imports"
    SET "collection_slug" = 'galeria'
    WHERE "collection_slug" = 'media';
    UPDATE "exports"
    SET "collection_slug" = 'galeria'
    WHERE "collection_slug" = 'media';

    UPDATE "media"
    SET
      "url" = replace("url", '/api/media/file/', '/api/galeria/file/'),
      "thumbnail_u_r_l" = replace("thumbnail_u_r_l", '/api/media/file/', '/api/galeria/file/'),
      "sizes_thumbnail_url" = replace("sizes_thumbnail_url", '/api/media/file/', '/api/galeria/file/'),
      "sizes_card_url" = replace("sizes_card_url", '/api/media/file/', '/api/galeria/file/'),
      "sizes_hero_url" = replace("sizes_hero_url", '/api/media/file/', '/api/galeria/file/')
    WHERE
      coalesce("url", '') LIKE '%/api/media/file/%'
      OR coalesce("thumbnail_u_r_l", '') LIKE '%/api/media/file/%'
      OR coalesce("sizes_thumbnail_url", '') LIKE '%/api/media/file/%'
      OR coalesce("sizes_card_url", '') LIKE '%/api/media/file/%'
      OR coalesce("sizes_hero_url", '') LIKE '%/api/media/file/%';

    DELETE FROM "payload_locked_documents"
    WHERE "id" IN (
      SELECT DISTINCT "parent_id"
      FROM "payload_locked_documents_rels"
      WHERE "galeria_id" IS NOT NULL
    );

    DROP INDEX "payload_locked_documents_rels_galeria_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_galeria_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN "galeria_id";
    ALTER TABLE "payload_locked_documents_rels"
      RENAME CONSTRAINT "payload_locked_documents_rels_media_fk"
      TO "payload_locked_documents_rels_galeria_fk";

    DROP TABLE "galeria_rels";
    DROP TABLE "galeria";

    -- PostgreSQL não remove valores isolados de enum. Voltamos a coluna para
    -- texto, unificamos ambos os tipos de folder e recriamos o enum anterior.
    ALTER TABLE "payload_folders_folder_type"
      ALTER COLUMN "value" TYPE text USING "value"::text;
    UPDATE "payload_folders_folder_type"
      SET "value" = 'galeria'
      WHERE "value" IN ('media', 'galeria');
    DROP TYPE "public"."enum_payload_folders_folder_type";
    CREATE TYPE "public"."enum_payload_folders_folder_type"
      AS ENUM('imprensa', 'blog', 'vagas', 'galeria');
    ALTER TABLE "payload_folders_folder_type"
      ALTER COLUMN "value"
      TYPE "public"."enum_payload_folders_folder_type"
      USING "value"::"public"."enum_payload_folders_folder_type";
  `);
}
