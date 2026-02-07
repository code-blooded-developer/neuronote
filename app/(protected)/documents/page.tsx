import { getUserDocuments } from "@/app/(protected)/actions/document";

import { DocumentWithUrl } from "@/types/document";

import DocumentsClient from "./DocumentsClient";

export default async function DocumentsPage() {
  let documents: DocumentWithUrl[] = [];

  try {
    documents = await getUserDocuments();
  } catch (e) {
    console.error("Could not load documents:", e);
  }

  return <DocumentsClient initialDocuments={documents} />;
}

export const dynamic = "force-dynamic";
