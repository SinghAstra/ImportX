/*
  Warnings:

  - You are about to drop the column `progress` on the `jobs` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RepositoryStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FileSummaryStatus" AS ENUM ('PENDING', 'PROCESSING', 'RETRYING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "progress";

-- CreateTable
CREATE TABLE "Repository" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "diskPath" TEXT NOT NULL,
    "status" "RepositoryStatus" NOT NULL DEFAULT 'PENDING',
    "readme" TEXT,
    "totalFiles" INTEGER NOT NULL DEFAULT 0,
    "supportedFiles" INTEGER NOT NULL DEFAULT 0,
    "ignoredFiles" INTEGER NOT NULL DEFAULT 0,
    "totalFolders" INTEGER NOT NULL DEFAULT 0,
    "totalSize" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryFile" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "relativePath" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "summaryStatus" "FileSummaryStatus" NOT NULL DEFAULT 'PENDING',
    "summary" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepositoryFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Repository_status_idx" ON "Repository"("status");

-- CreateIndex
CREATE INDEX "RepositoryFile_summaryStatus_idx" ON "RepositoryFile"("summaryStatus");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryFile_repositoryId_relativePath_key" ON "RepositoryFile"("repositoryId", "relativePath");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryFile" ADD CONSTRAINT "RepositoryFile_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
