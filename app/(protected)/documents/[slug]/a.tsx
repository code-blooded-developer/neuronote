"use client";
import { useEffect, useContext, useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share,
  Bookmark,
  Highlighter,
  Type,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { LayoutContext } from "../../layout";

export default function DocumentPage({ params }: { params: { slug: string } }) {
  const { layoutData, setLayoutData } = useContext(LayoutContext);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(24);
  const [searchTerm, setSearchTerm] = useState("");
  const viewerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 300));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 25));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const previousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    setLayoutData({
      title: `Document: ${params.slug}`,
      showHeader: true,
      isStarred: true,
    });
    return () => setLayoutData({});
  }, [params.slug, setLayoutData]);

  return (
    <>
      <div className="border-b bg-card px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation and zoom */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-0">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              {zoomLevel}%
            </Button>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48"
              />
            </div>

            <Button variant="outline" size="sm">
              <Maximize className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Rotate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Document Info</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 flex">
        {/* Main viewer area */}
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div
            ref={viewerRef}
            className="max-w-4xl mx-auto"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
            }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-0">
                {/* Simulated PDF content */}
                <div className="bg-white dark:bg-gray-900 min-h-[800px] p-8">
                  {/* Document header */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Quarterly Financial Report
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Q4 2023
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      NeuroNote Inc.
                    </p>
                  </div>

                  {/* Executive Summary */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Executive Summary
                    </h2>
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                      <p>
                        The fourth quarter of 2023 has been a period of
                        significant growth and strategic advancement for
                        NeuroNote Inc. Our AI-powered knowledge management
                        platform has seen unprecedented adoption across
                        enterprise clients.
                      </p>
                      <p className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                        {/* Simulated highlight */}
                        Revenue for Q4 2023 reached $2.4M, representing a 23%
                        increase from Q3 and a 156% year-over-year growth. This
                        exceptional performance was driven by strong customer
                        acquisition and expansion of existing accounts.
                      </p>
                      <p>
                        Our customer base has grown to over 500 enterprise
                        clients, with a customer retention rate of 96%. The
                        average contract value has increased by 31% compared to
                        the previous quarter.
                      </p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Key Financial Metrics
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Revenue
                        </h3>
                        <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                          <li>• Q4 2023: $2.4M (+23% QoQ)</li>
                          <li>• Annual 2023: $8.1M (+178% YoY)</li>
                          <li>• Recurring Revenue: 89%</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Profitability
                        </h3>
                        <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                          <li>• Gross Margin: 82%</li>
                          <li>• Operating Margin: 18.5%</li>
                          <li>• Net Income: $445K</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Simulated annotation */}
                  <div className="relative">
                    <div className="absolute -left-4 top-0 w-2 h-16 bg-blue-400 rounded-full opacity-50"></div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <MessageSquare className="inline h-4 w-4 mr-1" />
                        <strong>Note:</strong> The increase in operating margin
                        is particularly impressive given our aggressive R&D
                        investments.
                      </p>
                    </div>
                  </div>

                  {/* More content would continue here... */}
                  <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
