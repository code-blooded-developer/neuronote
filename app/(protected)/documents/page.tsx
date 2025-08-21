"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Upload,
  Filter,
  Grid,
  List,
  Star,
  Download,
  Eye,
  Trash2,
  FileText,
  File,
  MoreHorizontal,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import {
  getSignedUploadUrl,
  createDocumentEntry,
  getUserDocuments,
  toggleStar,
  softDeleteDocument,
} from "@/app/(protected)/actions/document";

import { useProgress } from "@bprogress/next";

import { Document } from "@/types/document";
import { Badge } from "@/components/ui/badge";

import { DocumentStatus } from "@prisma/client";

import { formatFileSize } from "@/utils/document";

interface UploadStatus {
  id: string;
  file: File;
  name: string;
  size: string;
  progress: number;
  status: DocumentStatus;
  error?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [uploadQueue, setUploadQueue] = useState<UploadStatus[]>([]);
  const { toast } = useToast();
  const { start, stop } = useProgress();
  const router = useRouter();

  useEffect(() => {
    // Fetch user documents on mount
    const fetchDocuments = async () => {
      try {
        start();
        const documents = await getUserDocuments();

        setDocuments(documents);
        if (documents.length === 0) {
          toast({
            title: "No documents found",
            description:
              "You have no documents yet. Upload your first document.",
          });
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        toast({
          title: "Error",
          description: "Failed to load documents.",
          variant: "destructive",
        });
      } finally {
        stop();
      }
    };

    fetchDocuments();
  }, [start, stop, toast]);

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

  const downloadDocument = (url: string) => {
    window.open(url, "_blank");
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: async (acceptedFiles) => {
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

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "application/pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return <FileText className="h-8 w-8 text-blue-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const sortDocuments = (documents: Document[]) => {
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

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.uploading:
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Uploading
          </Badge>
        );
      case DocumentStatus.processing:
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
          >
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case DocumentStatus.ready:
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
      case DocumentStatus.error:
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
    }
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredDocuments.map((doc) => (
        <Card
          key={doc.id}
          className="hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => goToDocumentViewer(doc.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(doc.mimeType)}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {doc.fileName}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatFileSize(doc.size)}
                  </CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => goToDocumentViewer(doc.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => downloadDocument(doc.url)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => toggleDocumentStar(doc.id)}
                  >
                    <Star
                      className={`mr-2 h-4 w-4 ${
                        doc.isStarred ? "fill-current text-yellow-500" : ""
                      }`}
                    />
                    {doc.isStarred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => deleteDocument(doc.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {getStatusBadge(doc.status)}
              {/* <Badge variant="secondary" className="text-xs">
                {doc.collection}
              </Badge>
              <div className="flex flex-wrap gap-1">
                {doc.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {doc.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{doc.tags.length - 2}
                  </Badge>
                )}
              </div> */}
              <div className="text-xs text-muted-foreground">
                {/* <p>By {doc.author}</p> */}
                <p>
                  Created {new Date(doc.createdAt).toLocaleDateString("en")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {filteredDocuments.map((doc) => (
        <Card
          key={doc.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => goToDocumentViewer(doc.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {getFileIcon(doc.mimeType)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{doc.fileName}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(doc.size)}</span>
                    <span>•</span>
                    {/* <span>By {doc.author}</span>
                    <span>•</span> */}
                    <span>
                      Created {new Date(doc.createdAt).toLocaleDateString("en")}
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {getStatusBadge(doc.status)}
                  {/* <Badge variant="secondary">{doc.collection}</Badge>
                  {doc.isStarred && (
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                  )} */}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => goToDocumentViewer(doc.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => downloadDocument(doc.url)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => toggleDocumentStar(doc.id)}
                  >
                    <Star
                      className={`mr-2 h-4 w-4 ${
                        doc.isStarred ? "fill-current text-yellow-500" : ""
                      }`}
                    />
                    {doc.isStarred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => deleteDocument(doc.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
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
            {viewMode === "grid" ? <GridView /> : <ListView />}
          </>
        )}
      </div>
    </main>
  );
}
