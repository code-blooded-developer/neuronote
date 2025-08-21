"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "@/components/ui/use-toast";
import { DocumentStatus } from "@prisma/client";
import { UploadStatus, DocumentWithUrl } from "@/types/document";
import {
  getSignedUploadUrl,
  createDocumentEntry,
} from "@/app/(protected)/actions/document";
import { formatFileSize } from "@/lib/utils";

export function useDocumentUploader({
  setDocuments,
  setUploadQueue,
  updateQueue,
  handleError,
}: {
  setDocuments: React.Dispatch<React.SetStateAction<DocumentWithUrl[]>>;
  setUploadQueue: React.Dispatch<React.SetStateAction<UploadStatus[]>>;
  updateQueue: (id: string, updates: Partial<UploadStatus>) => void;
  handleError: (id: string, fileName: string, message: string) => void;
}) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      toast({
        title: "Upload started",
        description: `Started uploading ${file.name}.`,
      });

      let uploadStatus!: UploadStatus;

      try {
        // 1. Get signed URL
        const { signedUrl, path, documentId } = await getSignedUploadUrl(
          file.name
        );

        // 2. Init queue entry
        uploadStatus = {
          id: documentId,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          progress: 0,
          status: DocumentStatus.uploading,
        };
        setUploadQueue((prev) => [...prev, uploadStatus]);

        // 3. Start upload
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        // Progress handler
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          updateQueue(uploadStatus.id, {
            progress: Math.round((e.loaded / e.total) * 100),
          });
        };

        // Success / failure handler
        xhr.onload = async () => {
          if (xhr.status !== 200) {
            return handleError(
              uploadStatus.id,
              file.name,
              "Failed to upload document"
            );
          }

          try {
            const uploadedDoc = await createDocumentEntry(documentId, path, {
              name: file.name,
              type: file.type,
              size: file.size,
            });

            setDocuments((prev) => [...prev, uploadedDoc]);

            updateQueue(uploadStatus.id, {
              status: DocumentStatus.ready,
            });

            toast({
              title: "Upload completed",
              description: `${file.name} has been successfully uploaded.`,
            });
          } catch {
            handleError(
              uploadStatus.id,
              file.name,
              "Failed to save document entry"
            );
          }
        };

        xhr.onerror = () => {
          handleError(
            uploadStatus.id,
            file.name,
            "Network error while uploading"
          );
        };

        xhr.send(file);
      } catch (err) {
        console.error(err);
        toast({
          title: "Upload failed",
          description: `Failed to start upload for ${file.name}.`,
          variant: "destructive",
        });
      } finally {
        if (uploadStatus) {
          setTimeout(() => {
            setUploadQueue((prev) =>
              prev.filter((i) => i.id !== uploadStatus.id)
            );
          }, 5000);
        }
      }
    },
    [setDocuments, setUploadQueue, updateQueue, handleError]
  );

  return useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });
}
