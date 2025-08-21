"use client";

import { SessionProvider } from "next-auth/react";

import { ProgressProvider } from "@bprogress/next/app";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ProgressProvider
        height="4px"
        color="#00D0FF"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <SessionProvider>{children}</SessionProvider>
      </ProgressProvider>
      <Toaster />
    </ThemeProvider>
  );
}
