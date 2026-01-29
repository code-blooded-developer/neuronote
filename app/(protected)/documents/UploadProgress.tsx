import { DocumentStatus } from "@prisma/client";
import { CheckCircle, Loader2, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { useDocumentUploader } from "@/hooks/useDocumentUploader";

import { useDocumentStore } from "@/store/documents";

export default function UploadProgress() {
  const { uploadQueue, setUploadQueue } = useDocumentStore();

  const { retryUpload, isUploadActive } = useDocumentUploader();
  if (uploadQueue.length === 0) {
    return null;
  }

  const uploadingCount = uploadQueue.filter(
    (u) => u.status === DocumentStatus.uploading,
  ).length;

  const completedCount = uploadQueue.filter(
    (u) => u.status === DocumentStatus.ready,
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Progress</CardTitle>
        <CardDescription>
          {uploadingCount} uploading, {completedCount} completed
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
                    <span className="text-destructive">• {upload.error}</span>
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

              {upload.status === "error" &&
                upload.canRetry &&
                !upload.isRetrying &&
                !isUploadActive(upload.id) && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUploadActive(upload.id)}
                      onClick={() => {
                        retryUpload(upload.id);
                      }}
                    >
                      Retry
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setUploadQueue(
                          uploadQueue.filter((item) => item.id !== upload.id),
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
