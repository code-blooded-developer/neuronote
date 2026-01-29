-- DropForeignKey
ALTER TABLE "public"."ChatDocument" DROP CONSTRAINT "ChatDocument_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DocumentChunk" DROP CONSTRAINT "DocumentChunk_documentId_fkey";

-- AddForeignKey
ALTER TABLE "public"."DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatDocument" ADD CONSTRAINT "ChatDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
