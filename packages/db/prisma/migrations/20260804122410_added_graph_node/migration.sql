/*
  Warnings:

  - You are about to drop the column `ignoredFiles` on the `Repository` table. All the data in the column will be lost.
  - You are about to drop the column `supportedFiles` on the `Repository` table. All the data in the column will be lost.
  - You are about to drop the column `totalFiles` on the `Repository` table. All the data in the column will be lost.
  - You are about to drop the column `totalFolders` on the `Repository` table. All the data in the column will be lost.
  - You are about to drop the column `totalSize` on the `Repository` table. All the data in the column will be lost.
  - You are about to drop the column `lastError` on the `RepositoryFile` table. All the data in the column will be lost.
  - You are about to drop the column `retryCount` on the `RepositoryFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "ignoredFiles",
DROP COLUMN "supportedFiles",
DROP COLUMN "totalFiles",
DROP COLUMN "totalFolders",
DROP COLUMN "totalSize";

-- AlterTable
ALTER TABLE "RepositoryFile" DROP COLUMN "lastError",
DROP COLUMN "retryCount";

-- CreateTable
CREATE TABLE "GraphNode" (
    "id" TEXT NOT NULL,
    "repositoryId" UUID NOT NULL,
    "filePath" TEXT NOT NULL,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GraphNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraphEdge" (
    "id" TEXT NOT NULL,
    "repositoryId" UUID NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "GraphEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GraphNode_repositoryId_idx" ON "GraphNode"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "GraphNode_repositoryId_filePath_key" ON "GraphNode"("repositoryId", "filePath");

-- CreateIndex
CREATE INDEX "GraphEdge_repositoryId_idx" ON "GraphEdge"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "GraphEdge_repositoryId_sourceId_targetId_key" ON "GraphEdge"("repositoryId", "sourceId", "targetId");

-- AddForeignKey
ALTER TABLE "GraphNode" ADD CONSTRAINT "GraphNode_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphEdge" ADD CONSTRAINT "GraphEdge_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphEdge" ADD CONSTRAINT "GraphEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphEdge" ADD CONSTRAINT "GraphEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "GraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
