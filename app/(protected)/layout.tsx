"use client";

import { createContext, useState } from "react";

import { FileText, Star } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type LayoutData = {
  isChatPage?: boolean;
  title?: string;
  isStarred?: boolean;
  showHeader?: boolean;
};

export const LayoutContext = createContext<{
  layoutData: LayoutData;
  setLayoutData: (data: LayoutData) => void;
}>({
  layoutData: {},
  setLayoutData: () => {},
});

export default function ProtectedPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [layoutData, setLayoutData] = useState<LayoutData>({});

  const renderHeader = () => {
    if (layoutData.showHeader) {
      return (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="font-poppins font-semibold text-lg truncate">
              {layoutData.title}
            </h1>
          </div>
          {layoutData.isStarred && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
          )}
        </div>
      );
    }
    return <div className="flex-1" />;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <LayoutContext.Provider value={{ layoutData, setLayoutData }}>
          <div className="flex-1 flex flex-col">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger />
                {renderHeader()}
                <ThemeToggle />
              </div>
            </header>

            <main
              className={`flex-1 ${layoutData.isChatPage ? "flex" : "p-6"}`}
            >
              {children}
            </main>
          </div>
        </LayoutContext.Provider>
      </div>
    </SidebarProvider>
  );
}
