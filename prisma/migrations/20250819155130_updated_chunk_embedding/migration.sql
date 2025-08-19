/*
  Warnings:

  - Changed the type of `embedding` on the `DocumentChunk` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."DocumentChunk" DROP COLUMN "embedding",
ADD COLUMN     "embedding" JSONB NOT NULL;
