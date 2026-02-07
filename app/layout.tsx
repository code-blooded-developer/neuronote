import type { Metadata } from "next";

import { AppProviders } from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroNote",
  description: "AI-Powered Document Knowledge Base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
