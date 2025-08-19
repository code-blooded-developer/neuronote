/*
  Warnings:

  - The `status` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('uploading', 'processing', 'ready', 'error');

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "status",
ADD COLUMN     "status" "public"."DocumentStatus" NOT NULL DEFAULT 'uploading';
