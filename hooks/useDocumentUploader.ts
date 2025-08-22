"use client";

import { useCallback, useRef } from "react";

import { DocumentStatus } from "@prisma/client";
import { useDropzone } from "react-dropzone";

import {
  createDocumentEntry,
  getSignedUploadUrl,
} from "@/app/(protected)/actions/document";

import { toast } from "@/components/ui/use-toast";

import { formatFileSize } from "@/lib/utils";

import { useDocumentStore } from "@/store/documents";

import { UploadStatus } from "@/types/document";

// Add retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

export function useDocumentUploader() {
  const {
    uploadQueue,
    setUploadQueue,
    updateUploadQueue,
    addToUploadQueue,
    removeFromUploadQueue,
    addDocument,
  } = useDocumentStore();
  // Track active uploads to prevent concurrent retries
  const activeUploadsRef = useRef<Set<string>>(new Set());

  const handleError = useCallback(
    (
      id: string,
      fileName: string,
      error: string,
      canRetry: boolean = false
    ) => {
      // Remove from active uploads on error
      activeUploadsRef.current.delete(id);

      updateUploadQueue(id, {
        status: "error",
        error,
        canRetry,
        isRetrying: false,
      });

      toast({
        title: "Upload failed",
        description: `${fileName}: ${error}${canRetry ? " (Retry available)" : ""}`,
        variant: "destructive",
      });
    },
    [updateUploadQueue]
  );

  // Exponential backoff delay calculation
  const calculateDelay = useCallback((attempt: number): number => {
    const delay = Math.min(
      RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
      RETRY_CONFIG.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, []);

  // Core upload function that can be retried
  const uploadFile = useCallback(
    async (
      file: File,
      uploadStatus: UploadStatus,
      attempt: number = 0
    ): Promise<void> => {
      // Check if upload is already active
      if (activeUploadsRef.current.has(uploadStatus.id)) {
        throw new Error("Upload already in progress");
      }

      // Mark as active
      activeUploadsRef.current.add(uploadStatus.id);

      try {
        // Get signed URL (may need refresh on retry)
        const { signedUrl, path, documentId } = await getSignedUploadUrl(
          file.name
        );

        // Update upload status with current attempt info
        updateUploadQueue(uploadStatus.id, {
          status: DocumentStatus.uploading,
          error: undefined,
          retryAttempt: attempt,
          isRetrying: attempt > 0,
        });

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedUrl, true);
          xhr.setRequestHeader("Content-Type", file.type);

          // Progress handler
          xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return;
            updateUploadQueue(uploadStatus.id, {
              progress: Math.round((e.loaded / e.total) * 100),
            });
          };

          // Success handler
          xhr.onload = async () => {
            if (xhr.status !== 200) {
              return reject(
                new Error(`Upload failed with status ${xhr.status}`)
              );
            }

            try {
              const uploadedDoc = await createDocumentEntry(documentId, path, {
                name: file.name,
                type: file.type,
                size: file.size,
              });

              addDocument(uploadedDoc);

              updateUploadQueue(uploadStatus.id, {
                status: DocumentStatus.ready,
                progress: 100,
                isRetrying: false,
              });

              // Remove from active uploads on success
              activeUploadsRef.current.delete(uploadStatus.id);

              toast({
                title: "Upload completed",
                description: `${file.name} has been successfully uploaded.`,
              });

              // Auto-cleanup successful uploads after delay
              setTimeout(() => {
                removeFromUploadQueue(uploadStatus.id);
              }, 2000);

              resolve();
            } catch (err) {
              console.error("Failed to create document entry:", err);
              reject(new Error("Failed to save document entry"));
            }
          };

          // Error handlers
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.onabort = () => reject(new Error("Upload aborted"));
          xhr.ontimeout = () => reject(new Error("Upload timeout"));

          // Set timeout (optional)
          xhr.timeout = 60000; // 60 seconds

          xhr.send(file);
        });
      } catch (error) {
        // Remove from active uploads on error
        activeUploadsRef.current.delete(uploadStatus.id);
        throw new Error(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    [updateUploadQueue, addDocument, removeFromUploadQueue]
  );

  // Retry mechanism with exponential backoff
  const uploadWithRetry = useCallback(
    async (file: File, uploadStatus: UploadStatus): Promise<void> => {
      let lastError: Error = new Error("Unknown error");

      for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
          await uploadFile(file, uploadStatus, attempt);
          return; // Success
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error("Unknown error");

          console.warn(
            `Upload attempt ${attempt + 1} failed:`,
            lastError.message
          );

          // Don't retry on the last attempt
          if (attempt === RETRY_CONFIG.maxRetries) {
            break;
          }

          // Show retry notification
          if (attempt > 0) {
            toast({
              title: "Retrying upload",
              description: `Attempt ${attempt + 1} failed, retrying in ${Math.round(calculateDelay(attempt) / 1000)}s...`,
            });
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, calculateDelay(attempt))
          );

          // Reset progress for retry
          updateUploadQueue(uploadStatus.id, { progress: 0 });
        }
      }

      // All retries exhausted
      handleError(
        uploadStatus.id,
        file.name,
        `Upload failed after ${RETRY_CONFIG.maxRetries + 1} attempts: ${lastError.message}`,
        true // Can still manually retry
      );
    },
    [uploadFile, calculateDelay, updateUploadQueue, handleError]
  );

  // Manual retry function
  const retryUpload = useCallback(
    (uploadId: string) => {
      // Check if upload is already in progress
      if (activeUploadsRef.current.has(uploadId)) {
        toast({
          title: "Upload in progress",
          description: "This file is already being uploaded. Please wait.",
        });
        return;
      }

      setUploadQueue(
        uploadQueue.map((item) => {
          if (
            item.id === uploadId &&
            item.status === "error" &&
            !item.isRetrying
          ) {
            // Reset status and start retry
            const resetItem = {
              ...item,
              status: DocumentStatus.uploading,
              progress: 0,
              error: undefined,
              retryAttempt: 0,
              isRetrying: true,
            };

            // Start upload in background
            uploadWithRetry(item.file, resetItem).catch(() => {
              // Error handling is done within uploadWithRetry
            });

            return resetItem;
          }
          return item;
        })
      );
    },
    [uploadQueue, setUploadQueue, uploadWithRetry]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      toast({
        title: "Upload started",
        description: `Started uploading ${file.name}.`,
      });

      try {
        // Get initial signed URL and document ID
        const { documentId } = await getSignedUploadUrl(file.name);

        // Create initial upload status
        const uploadStatus: UploadStatus = {
          id: documentId,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          progress: 0,
          status: DocumentStatus.uploading,
          retryAttempt: 0,
          canRetry: false,
        };

        addToUploadQueue(uploadStatus);

        // Start upload with retry logic
        await uploadWithRetry(file, uploadStatus);
      } catch (err) {
        console.error(err);
        toast({
          title: "Upload failed",
          description: `Failed to start upload for ${file.name}.`,
          variant: "destructive",
        });
      }
    },
    [uploadWithRetry, addToUploadQueue]
  );

  const dropzoneProps = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  return {
    ...dropzoneProps,
    retryUpload,
    isUploadActive: (uploadId: string) =>
      activeUploadsRef.current.has(uploadId),
  };
}
