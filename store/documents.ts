import { create } from "zustand";

import { DocumentWithUrl, UploadStatus } from "@/types/document";

interface DocumentState {
  documents: DocumentWithUrl[];
  searchQuery: string;
  selectedFilter: "all" | "starred";
  viewMode: "grid" | "list";
  sortBy: "recent" | "name" | "size";
  uploadQueue: UploadStatus[];

  setDocuments: (documents: DocumentWithUrl[]) => void;
  addDocument: (document: DocumentWithUrl) => void;
  updateDocument: (updatedDoc: Partial<DocumentWithUrl>) => void;
  toggleFavorite: (documentId: string) => void;
  removeDocument: (id: string) => void;

  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: "all" | "starred") => void;
  setViewMode: (mode: "grid" | "list") => void;
  setSortBy: (sort: "recent" | "name" | "size") => void;

  setUploadQueue: (queue: UploadStatus[]) => void;
  addToUploadQueue: (uploadStatus: UploadStatus) => void;
  updateUploadQueue: (id: string, updates: Partial<UploadStatus>) => void;
  removeFromUploadQueue: (id: string) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  searchQuery: "",
  selectedFilter: "all",
  viewMode: "grid",
  sortBy: "recent",
  uploadQueue: [],

  setDocuments: (documents: DocumentWithUrl[]) => set({ documents }),
  addDocument: (document: DocumentWithUrl) =>
    set((state) => ({ documents: [document, ...state.documents] })),
  updateDocument: (updatedDoc) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === updatedDoc.id ? { ...doc, ...updatedDoc } : doc,
      ),
    })),
  toggleFavorite: (documentId: string) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === documentId ? { ...doc, isStarred: !doc.isStarred } : doc,
      ),
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),

  setUploadQueue: (queue) => set({ uploadQueue: queue }),
  addToUploadQueue: (uploadStatus) =>
    set((state) => ({
      uploadQueue: [...state.uploadQueue, uploadStatus],
    })),
  updateUploadQueue: (id, updates) =>
    set((state) => ({
      uploadQueue: state.uploadQueue.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    })),
  removeFromUploadQueue: (id) =>
    set((state) => ({
      uploadQueue: state.uploadQueue.filter((item) => item.id !== id),
    })),
}));
