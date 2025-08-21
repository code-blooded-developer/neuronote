"use client";

import { useState } from "react";

import { useProgress } from "@bprogress/next";
import { DocumentStatus } from "@prisma/client";
import {
  CheckCircle,
  FileText,
  Filter,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  softDeleteDocument,
  toggleStar,
} from "@/app/(protected)/actions/document";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useDocumentUploader } from "@/hooks/useDocumentUploader";

import { DocumentWithUrl, UploadStatus } from "@/types/document";

import { GridView, ListView } from "./DocumentsView";

export default function DocumentsClient({
  initialDocuments,
}: {
  initialDocuments: DocumentWithUrl[];
}) {
  const [documents, setDocuments] =
    useState<DocumentWithUrl[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [uploadQueue, setUploadQueue] = useState<UploadStatus[]>([]);
  const { toast } = useToast();
  const { start, stop } = useProgress();
  const router = useRouter();

  const toggleDocumentStar = async (documentId: string) => {
    try {
      start();

      await toggleStar(documentId);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, isStarred: !doc.isStarred } : doc
        )
      );

      toast({
        title: "Success",
        description: "Document star status updated.",
      });
    } catch (error) {
      console.error("Failed to toggle star:", error);
      toast({
        title: "Error",
        description: "Failed to update document star status.",
        variant: "destructive",
      });
    } finally {
      stop();
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      start();

      await softDeleteDocument(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    } finally {
      stop();
    }
  };

  const goToDocumentViewer = (slug: string) => {
    router.push(`/documents/${slug}`);
  };

  const { getRootProps, getInputProps, isDragActive, open } =
    useDocumentUploader({
      setDocuments,
      setUploadQueue,
      updateQueue,
      handleError,
    });

  function updateQueue(id: string, updates: Partial<UploadStatus>) {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function handleError(id: string, fileName: string, error: string) {
    updateQueue(id, { status: "error", error });

    toast({
      title: "Upload failed",
      description: `${fileName}: ${error}`,
      variant: "destructive",
    });
  }

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

        {/* Upload Progress */}
        {uploadQueue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Progress</CardTitle>
              <CardDescription>
                {
                  uploadQueue.filter(
                    (u) => u.status === DocumentStatus.uploading
                  ).length
                }{" "}
                uploading,{" "}
                {
                  uploadQueue.filter((u) => u.status === DocumentStatus.ready)
                    .length
                }{" "}
                completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadQueue.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {upload.status === DocumentStatus.uploading && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                    {upload.status === DocumentStatus.ready && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {upload.status === "error" && (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{upload.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{upload.size}</span>
                        {upload.status === DocumentStatus.uploading && (
                          <span>• Uploading...</span>
                        )}
                        {upload.status === DocumentStatus.ready && (
                          <span>• Upload completed</span>
                        )}
                        {upload.status === DocumentStatus.error && (
                          <span className="text-destructive">
                            • {upload.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {upload.status === DocumentStatus.uploading && (
                      <div className="w-24">
                        <Progress value={upload.progress} className="h-2" />
                      </div>
                    )}

                    {upload.status === "error" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Retry upload
                          setUploadQueue((prev) =>
                            prev.map((item) =>
                              item.id === upload.id
                                ? {
                                    ...item,
                                    status: "uploading",
                                    progress: 0,
                                    error: undefined,
                                  }
                                : item
                            )
                          );
                        }}
                      >
                        Retry
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setUploadQueue((prev) =>
                          prev.filter((item) => item.id !== upload.id)
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

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
            {viewMode === "grid" ? (
              <GridView
                documents={filteredDocuments}
                deleteDocument={deleteDocument}
                toggleDocumentStar={toggleDocumentStar}
                goToDocumentViewer={goToDocumentViewer}
              />
            ) : (
              <ListView
                documents={filteredDocuments}
                deleteDocument={deleteDocument}
                toggleDocumentStar={toggleDocumentStar}
                goToDocumentViewer={goToDocumentViewer}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
