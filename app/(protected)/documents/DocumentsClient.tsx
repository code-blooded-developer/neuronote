"use client";

import { useEffect } from "react";

import { FileText, Plus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useDocumentUploader } from "@/hooks/useDocumentUploader";

import { useDocumentStore } from "@/store/documents";

import { DocumentWithUrl } from "@/types/document";

import DocumentFilters from "./DocumentFilters";
import DocumentsView from "./DocumentsView";
import UploadProgress from "./UploadProgress";

export default function DocumentsClient({
  initialDocuments,
}: {
  initialDocuments: DocumentWithUrl[];
}) {
  const { documents, searchQuery, selectedFilter, sortBy, setDocuments } =
    useDocumentStore();

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments, setDocuments]);

  const { getRootProps, getInputProps, isDragActive, open } =
    useDocumentUploader();

  const sortDocuments = (documents: DocumentWithUrl[]) => {
    switch (sortBy) {
      case "name":
        return [...documents].sort((a, b) =>
          a.fileName.localeCompare(b.fileName)
        );
      case "size":
        return [...documents].sort((a, b) => a.size - b.size);
      case "recent":
        return [...documents].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return documents;
    }
  };

  const filteredDocuments = sortDocuments(
    documents.filter((doc) => {
      const matchesSearch = doc.fileName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "starred" && doc.isStarred);
      return matchesSearch && matchesFilter;
    })
  );

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Documents</h1>
            <p className="text-muted-foreground">
              Manage and organize your documents
            </p>
          </div>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          </div>
        </div>

        {/* Upload Area */}
        {isDragActive && (
          <Card className="border-dashed border-2 border-primary">
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-lg font-medium">Drop files here to upload</p>
              </div>
            </CardContent>
          </Card>
        )}

        <UploadProgress />

        <DocumentFilters />

        {/* Documents */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Upload your first document to get started"}
              </p>
              <Button onClick={open} className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredDocuments.length} document
                {filteredDocuments.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <DocumentsView documents={filteredDocuments} />
          </>
        )}
      </div>
    </main>
  );
}
