import { DocumentStatus } from "@prisma/client";

export interface Document {
  url: string;
  id: string;
  status: DocumentStatus;
  createdAt: Date;
  userId: string;
  fileName: string;
  description: string | null;
  storagePath: string;
  mimeType: string;
  size: number;
  isStarred: boolean;
  deletedAt: Date | null;
}

export type DocumentWithoutUrl = Omit<Document, "url">;

export interface UploadStatus {
  id: string;
  file: File;
  name: string;
  size: string;
  progress: number;
  status: DocumentStatus;
  error?: string;
}
