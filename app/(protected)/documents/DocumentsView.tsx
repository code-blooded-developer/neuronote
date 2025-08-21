import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Star,
  Download,
  Eye,
  Trash2,
  FileText,
  File,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { DocumentWithUrl } from "@/types/document";

import { DocumentStatus } from "@prisma/client";

import { formatFileSize } from "@/lib/utils";

interface DocumentViewProps {
  documents: DocumentWithUrl[];
  deleteDocument: (id: string) => void;
  toggleDocumentStar: (id: string) => void;
  goToDocumentViewer: (id: string) => void;
}

type DocumentActionsProps = Omit<DocumentViewProps, "documents"> & {
  doc: DocumentWithUrl;
  isGridView?: boolean;
};

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

const downloadDocument = (url: string) => {
  window.open(url, "_blank");
};

function DocumentActions({
  doc,
  isGridView = false,
  goToDocumentViewer,
  toggleDocumentStar,
  deleteDocument,
}: DocumentActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${
            isGridView
              ? "opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              : ""
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            goToDocumentViewer(doc.id);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            downloadDocument(doc.url);
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            toggleDocumentStar(doc.id);
          }}
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
          onSelect={(e) => {
            e.preventDefault();
            deleteDocument(doc.id);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GridView({
  documents,
  deleteDocument,
  goToDocumentViewer,
  toggleDocumentStar,
}: DocumentViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc) => (
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
              <DocumentActions
                doc={doc}
                isGridView
                goToDocumentViewer={goToDocumentViewer}
                toggleDocumentStar={toggleDocumentStar}
                deleteDocument={deleteDocument}
              />
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
}

export function ListView({
  documents,
  deleteDocument,
  goToDocumentViewer,
  toggleDocumentStar,
}: DocumentViewProps) {
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
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
              <DocumentActions
                doc={doc}
                goToDocumentViewer={goToDocumentViewer}
                toggleDocumentStar={toggleDocumentStar}
                deleteDocument={deleteDocument}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
