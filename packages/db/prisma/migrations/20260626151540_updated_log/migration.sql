/*
  Warnings:

  - The values [DEBUG] on the enum `LogLevel` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogLevel_new" AS ENUM ('INFO', 'WARN', 'ERROR');
ALTER TABLE "public"."job_logs" ALTER COLUMN "level" DROP DEFAULT;
ALTER TABLE "job_logs" ALTER COLUMN "level" TYPE "LogLevel_new" USING ("level"::text::"LogLevel_new");
ALTER TYPE "LogLevel" RENAME TO "LogLevel_old";
ALTER TYPE "LogLevel_new" RENAME TO "LogLevel";
DROP TYPE "public"."LogLevel_old";
ALTER TABLE "job_logs" ALTER COLUMN "level" SET DEFAULT 'INFO';
COMMIT;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
