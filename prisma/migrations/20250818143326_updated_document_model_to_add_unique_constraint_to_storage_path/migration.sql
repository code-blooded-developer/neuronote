/*
  Warnings:

  - A unique constraint covering the columns `[userId,storagePath]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_userId_storagePath_key" ON "public"."Document"("userId", "storagePath");
