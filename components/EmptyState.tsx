import {
  Brain,
  FileText,
  FolderOpen,
  MessageSquare,
  Plus,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  type: "no-documents" | "no-search-results" | "no-chats" | "no-collections";
  searchQuery?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  type,
  searchQuery,
  onAction,
}: EmptyStateProps) => {
  const configs = {
    "no-documents": {
      icon: FileText,
      title: "No documents yet",
      description:
        "Upload your first document to get started with AI-powered insights",
      actionLabel: "Upload Document",
      actionIcon: Upload,
    },
    "no-search-results": {
      icon: Search,
      title: "No results found",
      description: searchQuery
        ? `No documents found for "${searchQuery}". Try adjusting your search terms.`
        : "No documents match your current filters. Try adjusting your search or filters.",
      actionLabel: "Clear Search",
      actionIcon: Search,
    },
    "no-chats": {
      icon: MessageSquare,
      title: "No conversations yet",
      description:
        "Start a conversation with AI to get insights from your documents",
      actionLabel: "Start Chat",
      actionIcon: Brain,
    },
    "no-collections": {
      icon: FolderOpen,
      title: "No collections yet",
      description: "Create your first collection to organize your documents",
      actionLabel: "Create Collection",
      actionIcon: Plus,
    },
  };

  const config = configs[type];
  const Icon = config.icon;
  const ActionIcon = config.actionIcon;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="font-poppins font-semibold text-xl mb-2 text-foreground">
          {config.title}
        </h3>

        <p className="text-muted-foreground max-w-md mb-6">
          {config.description}
        </p>

        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <ActionIcon className="h-4 w-4" />
            {config.actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Illustration-style empty states for a more friendly feel
export const IllustrationEmptyState = ({
  type,
  searchQuery,
  onAction,
}: EmptyStateProps) => {
  const configs = {
    "no-documents": {
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl rotate-3"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl -rotate-2"></div>
          <div className="absolute inset-4 bg-card border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary/60" />
          </div>
        </div>
      ),
      title: "Ready to get started?",
      description:
        "Upload your documents and let AI help you discover insights you never knew existed.",
      actionLabel: "Upload Your First Document",
      actionIcon: Upload,
    },
    "no-search-results": {
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 rounded-full"></div>
          <div className="absolute inset-4 bg-card rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-primary/20 rounded-full animate-pulse delay-150"></div>
        </div>
      ),
      title: "No matches found",
      description: searchQuery
        ? `We couldn't find any documents matching "${searchQuery}". Try different keywords or browse your collections.`
        : "No documents match your current filters. Adjust your search to find what you're looking for.",
      actionLabel: "Browse All Documents",
      actionIcon: FileText,
    },
    "no-chats": {
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl rotate-6"></div>
          <div className="absolute inset-3 bg-card border border-primary/20 rounded-2xl -rotate-3 flex items-center justify-center">
            <div className="space-y-1">
              <div className="w-8 h-1 bg-primary/40 rounded"></div>
              <div className="w-6 h-1 bg-accent/40 rounded"></div>
              <div className="w-10 h-1 bg-primary/40 rounded"></div>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
            <Brain className="h-3 w-3 text-accent-foreground" />
          </div>
        </div>
      ),
      title: "Your AI assistant is waiting",
      description:
        "Ask questions about your documents and get instant, intelligent answers powered by advanced AI.",
      actionLabel: "Start Your First Chat",
      actionIcon: MessageSquare,
    },
    "no-collections": {
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 rounded-2xl rotate-2"></div>
          <div className="absolute inset-3 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-xl -rotate-1"></div>
          <div className="absolute inset-6 bg-card border border-primary/20 rounded-lg flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-primary/60" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <Plus className="h-4 w-4 text-accent-foreground" />
          </div>
        </div>
      ),
      title: "Organize with collections",
      description:
        "Group related documents together for better organization and more focused AI conversations.",
      actionLabel: "Create Your First Collection",
      actionIcon: Plus,
    },
  };

  const config = configs[type];
  const ActionIcon = config.actionIcon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {config.illustration}

      <h3 className="font-poppins font-semibold text-2xl mb-3 text-foreground">
        {config.title}
      </h3>

      <p className="text-muted-foreground max-w-lg mb-8 leading-relaxed">
        {config.description}
      </p>

      {onAction && (
        <Button onClick={onAction} size="lg" className="gap-2 shadow-lg">
          <ActionIcon className="h-5 w-5" />
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
};
