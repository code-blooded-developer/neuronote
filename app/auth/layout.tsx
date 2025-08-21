import Link from "next/link";

import { ArrowLeft, Brain } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-poppins font-bold text-lg">NeuroNote</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 NeuroNote. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
