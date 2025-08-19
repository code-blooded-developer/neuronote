"use client";

import { useState, useEffect, use } from "react";

import { getSignedUrl } from "@/app/(protected)/actions/document";

export default function DocumentViewer({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const fetchDocument = async () => {
      const url = await getSignedUrl(slug);
      setUrl(url);
    };
    fetchDocument();
  }, [slug]);

  if (!url) {
    return <p>Loading document...</p>;
  }

  return <iframe src={url} className="w-full h-[90vh] border rounded"></iframe>;
}
