/*
  Warnings:

  - A unique constraint covering the columns `[userId,githubUrl]` on the table `Repository` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `avatar` to the `Repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "avatar" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Repository_userId_githubUrl_key" ON "Repository"("userId", "githubUrl");
