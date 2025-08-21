"use client";

import { useState, useEffect, use, useContext } from "react";

import { getDocumentWithUrl } from "@/app/(protected)/actions/document";
import { LayoutContext } from "../../layout";

import { Document } from "@/types/document";

export default function DocumentViewer({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [document, setDocument] = useState<Document>();
  const { setLayoutData } = useContext(LayoutContext);

  useEffect(() => {
    const fetchDocument = async () => {
      const document = await getDocumentWithUrl(slug);
      setDocument(document);
      setLayoutData({
        title: document.fileName,
        isStarred: document.isStarred,
        showHeader: true,
      });
    };
    fetchDocument();
    return () => setLayoutData({});
  }, [slug, setLayoutData]);

  if (!document) {
    return <p>Loading...</p>;
  }

  if (document) {
    if (
      document.mimeType === "application/pdf" ||
      document.mimeType === "text/plain"
    ) {
      return (
        <iframe
          src={document.url}
          className="w-full h-[90vh] border rounded"
          title={document.fileName}
        />
      );
    }

    if (
      document.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(
            document.url
          )}&embedded=true`}
          className="w-full h-[90vh] border rounded"
        />
      );
    }
  }

  return <p>Unsupported file type</p>;
}
