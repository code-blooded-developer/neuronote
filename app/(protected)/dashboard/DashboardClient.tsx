"use client";

import { useEffect } from "react";

import Link from "next/link";

import { useSession } from "next-auth/react";

import { Brain, Plus, Search, Upload } from "lucide-react";

import DocumentFilters from "@/app/(protected)/documents/DocumentFilters";
import DocumentsView from "@/app/(protected)/documents/DocumentsView";
import UploadProgress from "@/app/(protected)/documents/UploadProgress";

import { IllustrationEmptyState } from "@/components/EmptyState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useDocumentUploader } from "@/hooks/useDocumentUploader";

import { useDocumentStore } from "@/store/documents";

import { DocumentWithUrl } from "@/types/document";

export default function DashboardClient({
  recentDocuments,
}: {
  recentDocuments: DocumentWithUrl[];
}) {
  const { data: session } = useSession();

  const {
    documents,
    searchQuery,
    selectedFilter,
    sortBy,
    setDocuments,
    setSearchQuery,
    setSelectedFilter,
  } = useDocumentStore();

  useEffect(() => {
    setDocuments(recentDocuments);
  }, [recentDocuments, setDocuments]);

  const { getRootProps, getInputProps, isDragActive, open } =
    useDocumentUploader();

  const hasDocuments = documents.length > 0;

  const sortDocuments = (documents: DocumentWithUrl[]) => {
    switch (sortBy) {
      case "name":
        return [...documents].sort((a, b) =>
          a.fileName.localeCompare(b.fileName),
        );
      case "size":
        return [...documents].sort((a, b) => a.size - b.size);
      case "recent":
        return [...documents].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
    }),
  );

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="font-poppins font-bold text-3xl mb-2">
            {hasDocuments
              ? `Welcome back, ${session?.user?.name}`
              : "Welcome to NeuroNote"}
          </h1>
          <p className="text-muted-foreground">
            {hasDocuments
              ? "Manage your documents and discover insights with AI"
              : "Get started by uploading your first document"}
          </p>
        </div>

        <Card
          className={`transition-colors ${isDragActive ? "border-primary bg-primary/5" : ""}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Drag and drop your files here, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/5"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, Word, and text files
                  </p>
                </>
              )}
            </div>

            <UploadProgress />
          </CardContent>
        </Card>

        {!hasDocuments ? (
          <div className="space-y-8">
            <IllustrationEmptyState type="no-documents" onAction={open} />
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Here&apos;s how DocuMind can help you work smarter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">1. Upload Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload PDFs, Word docs, Excel files, and more
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">2. Ask Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat with AI to extract insights from your documents
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">3. Organize & Discover</h3>
                    <p className="text-sm text-muted-foreground">
                      Create collections and find connections across documents
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <DocumentFilters needsSorting={false} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  {filteredDocuments.length} document
                  {filteredDocuments.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length === 0 ? (
                  <IllustrationEmptyState
                    type="no-search-results"
                    searchQuery={searchQuery}
                    onAction={() => {
                      setSearchQuery("");
                      setSelectedFilter("all");
                    }}
                  />
                ) : (
                  <DocumentsView documents={filteredDocuments} />
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/collections">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Plus className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-medium mb-2">Create Collection</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize your documents into smart collections
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/chat">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Brain className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-medium mb-2">Ask AI</h3>
                    <p className="text-sm text-muted-foreground">
                      Get insights from your documents
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/chat">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Search className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-medium mb-2">Search</h3>
                    <p className="text-sm text-muted-foreground">
                      Find exactly what you&apos;re looking for
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
