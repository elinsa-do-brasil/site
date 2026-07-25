import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_users_role"
      AS ENUM('admin', 'publisher', 'editor', 'recruiter');

    ALTER TABLE "users"
      ADD COLUMN "role" "public"."enum_users_role";

    UPDATE "users"
    SET "role" = 'editor';

    DO $migration$
    BEGIN
      IF EXISTS (SELECT 1 FROM "users")
        AND NOT EXISTS (
          SELECT 1
          FROM "users"
          WHERE lower("email") = 'raave.aires@grupoamperelinsa.com'
        )
      THEN
        RAISE EXCEPTION
          'Migração RBAC abortada: a conta administrativa esperada raave.aires@grupoamperelinsa.com não existe.';
      END IF;
    END
    $migration$;

    UPDATE "users"
    SET "role" = 'admin'
    WHERE lower("email") = 'raave.aires@grupoamperelinsa.com';

    ALTER TABLE "users"
      ALTER COLUMN "role" SET NOT NULL;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN "role";
    DROP TYPE "public"."enum_users_role";
  `);
}
