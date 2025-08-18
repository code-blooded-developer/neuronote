"use client";

import { useState } from "react";
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
  Image,
  Video,
  Archive,
  MoreHorizontal,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
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
import { Badge } from "@/components/ui/badge";
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

import {
  getSignedUploadUrl,
  createDocumentEntry,
} from "@/app/(protected)/actions/document";

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  collection: string;
  starred: boolean;
  tags: string[];
  lastModified: string;
  author: string;
}

interface UploadStatus {
  id: string;
  file: File;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Q4 Financial Report.pdf",
    type: "pdf",
    size: "2.3 MB",
    uploadedAt: "2 hours ago",
    collection: "Financial Reports",
    starred: true,
    tags: ["finance", "quarterly", "report"],
    lastModified: "2024-01-15",
    author: "John Smith",
  },
  {
    id: 2,
    name: "User Research Findings.docx",
    type: "docx",
    size: "1.8 MB",
    uploadedAt: "1 day ago",
    collection: "Research",
    starred: false,
    tags: ["research", "users", "analysis"],
    lastModified: "2024-01-14",
    author: "Sarah Johnson",
  },
  {
    id: 3,
    name: "Product Roadmap 2024.xlsx",
    type: "xlsx",
    size: "3.1 MB",
    uploadedAt: "3 days ago",
    collection: "Product",
    starred: true,
    tags: ["product", "roadmap", "planning"],
    lastModified: "2024-01-12",
    author: "Mike Chen",
  },
  {
    id: 4,
    name: "Meeting Notes.txt",
    type: "txt",
    size: "24 KB",
    uploadedAt: "1 week ago",
    collection: "Meetings",
    starred: false,
    tags: ["meeting", "notes"],
    lastModified: "2024-01-08",
    author: "Alex Kim",
  },
  {
    id: 5,
    name: "Brand Guidelines.pdf",
    type: "pdf",
    size: "5.2 MB",
    uploadedAt: "2 weeks ago",
    collection: "Design",
    starred: true,
    tags: ["brand", "design", "guidelines"],
    lastModified: "2024-01-01",
    author: "Emma Davis",
  },
  {
    id: 6,
    name: "API Documentation.md",
    type: "md",
    size: "156 KB",
    uploadedAt: "1 month ago",
    collection: "Development",
    starred: false,
    tags: ["api", "documentation", "development"],
    lastModified: "2023-12-15",
    author: "David Wilson",
  },
];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [uploadQueue, setUploadQueue] = useState<UploadStatus[]>([]);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const simulateUpload = async (uploadStatus: UploadStatus) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadStatus.id ? { ...item, progress } : item
        )
      );
    }

    // Switch to processing
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === uploadStatus.id
          ? { ...item, status: "processing", progress: 100 }
          : item
      )
    );

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Complete or error (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;

    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === uploadStatus.id
          ? {
              ...item,
              status: isSuccess ? "completed" : "error",
              error: isSuccess ? undefined : "Failed to process document",
            }
          : item
      )
    );

    if (isSuccess) {
      toast({
        title: "Upload completed",
        description: `${uploadStatus.name} has been successfully uploaded and processed.`,
      });
    } else {
      toast({
        title: "Upload failed",
        description: `Failed to process ${uploadStatus.name}. Please try again.`,
        variant: "destructive",
      });
    }

    // Remove from queue after 3 seconds
    setTimeout(() => {
      setUploadQueue((prev) =>
        prev.filter((item) => item.id !== uploadStatus.id)
      );
    }, 3000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
          status: "uploading",
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

          // Mark as processing
          updateQueue(uploadStatus.id, { status: "processing", progress: 100 });

          try {
            await createDocumentEntry(documentId, path, {
              name: file.name,
              type: file.type,
              size: file.size,
            });

            updateQueue(uploadStatus.id, { status: "completed" });
            toast({
              title: "Upload completed",
              description: `${file.name} has been successfully uploaded and processed.`,
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
        // auto-remove after 5s
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
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "docx":
      case "doc":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "xlsx":
      case "xls":
        return <FileText className="h-8 w-8 text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image className="h-8 w-8 text-purple-500" />;
      case "mp4":
      case "mov":
      case "avi":
        return <Video className="h-8 w-8 text-orange-500" />;
      case "zip":
      case "rar":
        return <Archive className="h-8 w-8 text-gray-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const sortDocuments = (documents: Document[]) => {
    switch (sortBy) {
      case "name":
        return [...documents].sort((a, b) => a.name.localeCompare(b.name));
      case "size":
        return [...documents].sort(
          (a, b) => parseFloat(a.size) - parseFloat(b.size)
        );
      case "recent":
        return [...documents].sort(
          (a, b) =>
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
        );
      default:
        return documents;
    }
  };

  const filteredDocuments = sortDocuments(
    mockDocuments.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "starred" && doc.starred) ||
        doc.collection.toLowerCase() === selectedFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    })
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredDocuments.map((doc) => (
        <Card
          key={doc.id}
          className="hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {doc.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {doc.size}
                  </CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star
                      className={`mr-2 h-4 w-4 ${
                        doc.starred ? "fill-current text-yellow-500" : ""
                      }`}
                    />
                    {doc.starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">
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
              </div>
              <div className="text-xs text-muted-foreground">
                <p>By {doc.author}</p>
                <p>Modified {doc.lastModified}</p>
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
        <Card key={doc.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{doc.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>By {doc.author}</span>
                    <span>•</span>
                    <span>Modified {doc.lastModified}</span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Badge variant="secondary">{doc.collection}</Badge>
                  {doc.starred && (
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star
                      className={`mr-2 h-4 w-4 ${
                        doc.starred ? "fill-current text-yellow-500" : ""
                      }`}
                    />
                    {doc.starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
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
                {uploadQueue.filter((u) => u.status === "uploading").length}{" "}
                uploading,{" "}
                {uploadQueue.filter((u) => u.status === "processing").length}{" "}
                processing,{" "}
                {uploadQueue.filter((u) => u.status === "completed").length}{" "}
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
                    {upload.status === "uploading" && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                    {upload.status === "processing" && (
                      <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    )}
                    {upload.status === "completed" && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {upload.status === "error" && (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{upload.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{upload.size}</span>
                        {upload.status === "uploading" && (
                          <span>• Uploading...</span>
                        )}
                        {upload.status === "processing" && (
                          <span>• Processing document...</span>
                        )}
                        {upload.status === "completed" && (
                          <span>• Upload completed</span>
                        )}
                        {upload.status === "error" && (
                          <span className="text-destructive">
                            • {upload.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {(upload.status === "uploading" ||
                      upload.status === "processing") && (
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
                          simulateUpload(upload);
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
              placeholder="Search documents, tags, or collections..."
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
                <SelectItem value="financial reports">
                  Financial Reports
                </SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="meetings">Meetings</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="development">Development</SelectItem>
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
              <Button className="gap-2">
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
