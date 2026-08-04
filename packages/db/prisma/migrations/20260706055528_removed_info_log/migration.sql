/*
  Warnings:

  - You are about to drop the column `level` on the `job_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job_logs" DROP COLUMN "level";

-- DropEnum
DROP TYPE "LogLevel";
