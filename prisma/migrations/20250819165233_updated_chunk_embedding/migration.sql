/*
  Warnings:

  - The `embedding` column on the `DocumentChunk` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."DocumentChunk" DROP COLUMN "embedding",
ADD COLUMN     "embedding" DOUBLE PRECISION[];
