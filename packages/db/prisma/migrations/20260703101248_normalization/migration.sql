/*
  Warnings:

  - You are about to drop the column `userId` on the `jobs` table. All the data in the column will be lost.
  - Added the required column `repositoryId` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_userId_fkey";

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "userId",
ADD COLUMN     "repositoryId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "jobs_repositoryId_idx" ON "jobs"("repositoryId");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
