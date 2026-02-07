import { getRecentDocuments } from "@/app/(protected)/actions/document";

import { DocumentWithUrl } from "@/types/document";

import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  let documents: DocumentWithUrl[] = [];

  try {
    documents = await getRecentDocuments();
  } catch (e) {
    console.error("Could not load documents:", e);
  }

  return <DashboardClient recentDocuments={documents} />;
}

export const dynamic = "force-dynamic";
