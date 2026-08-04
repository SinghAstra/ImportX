/*
  Warnings:

  - The values [WARN] on the enum `LogLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogLevel_new" AS ENUM ('INFO', 'ERROR');
ALTER TABLE "public"."job_logs" ALTER COLUMN "level" DROP DEFAULT;
ALTER TABLE "job_logs" ALTER COLUMN "level" TYPE "LogLevel_new" USING ("level"::text::"LogLevel_new");
ALTER TYPE "LogLevel" RENAME TO "LogLevel_old";
ALTER TYPE "LogLevel_new" RENAME TO "LogLevel";
DROP TYPE "public"."LogLevel_old";
ALTER TABLE "job_logs" ALTER COLUMN "level" SET DEFAULT 'INFO';
COMMIT;
