"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  FileText,
  Bot,
  User,
  X,
  Plus,
  MessageSquare,
  Search,
} from "lucide-react";

import { LayoutContext } from "../layout";

import { getUserReadyDocuments } from "../actions/document";

import { DocumentWithoutUrl as Document } from "@/types/document";

import { formatFileSize } from "@/utils/document";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatSession {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  documentIds: number[];
}

const sampleMessages: Message[] = [
  {
    id: "1",
    type: "ai",
    content:
      "Hello! I'm ready to help you analyze your documents. What would you like to know?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    type: "user",
    content: "What are the key findings from the Q4 financial report?",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: "3",
    type: "ai",
    content:
      "Based on the Q4 Financial Report, here are the key findings:\n\n• Revenue increased by 23% compared to Q3\n• Operating margin improved to 18.5%\n• Customer acquisition cost decreased by 12%\n• Net income reached $2.4M, exceeding projections",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    sources: ["Q4 Financial Report.pdf"],
  },
];

const AIChat = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("aiChatMessages");
    return saved ? JSON.parse(saved) : sampleMessages;
  });
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem("aiChatDocuments");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { setLayoutData } = useContext(LayoutContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await getUserReadyDocuments();
      setDocuments(docs);
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    const fetchDocument = async () => {
      setLayoutData({
        isChatPage: true,
      });
    };
    fetchDocument();
    return () => setLayoutData({});
  }, [setLayoutData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages and documents to localStorage
  useEffect(() => {
    localStorage.setItem("aiChatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("aiChatDocuments", JSON.stringify(selectedDocuments));
  }, [selectedDocuments]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "I'm analyzing your documents to provide you with the most accurate answer. This is a simulated response for demonstration purposes.",
        timestamp: new Date(),
        sources: selectedDocuments.map((doc) => doc.fileName),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeDocument = (docId: string) => {
    setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const addDocuments = (documentIds: string[]) => {
    const documentsToAdd = documents.filter(
      (doc) =>
        documentIds.includes(doc.id) &&
        !selectedDocuments.some((selected) => selected.id === doc.id)
    );
    setSelectedDocuments((prev) => [...prev, ...documentsToAdd]);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex">
      {/* Left Panel - Selected Documents */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-3">
            Selected Documents ({selectedDocuments.length})
          </h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Documents
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Select Documents</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredDocuments.map((doc) => {
                      const isSelected = selectedDocuments.some(
                        (selected) => selected.id === doc.id
                      );
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addDocuments([doc.id]);
                              } else {
                                removeDocument(doc.id);
                              }
                            }}
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {doc.fileName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {/* <Badge variant="secondary" className="text-xs">
                                  {doc.collection}
                                </Badge> */}
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.size)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="flex justify-end">
                  <Button onClick={() => setIsDialogOpen(false)}>Done</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {selectedDocuments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents selected</p>
                <p className="text-xs">Add documents to start chatting</p>
              </div>
            ) : (
              selectedDocuments.map((doc) => (
                <Card key={doc.id} className="relative">
                  <CardContent className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="flex items-start gap-2 pr-6">
                      <FileText className="h-4 w-4 mt-0.5 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {/* <Badge variant="secondary" className="text-xs">
                            {doc.collection}
                          </Badge> */}
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(doc.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "ai" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[70%] ${
                    message.type === "user" ? "order-1" : ""
                  }`}
                >
                  <Card
                    className={`${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card"
                    }`}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.sources && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">
                            Sources:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* <p className="text-xs text-muted-foreground mt-1 px-3">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p> */}
                </div>

                {message.type === "user" && (
                  <div className="flex-shrink-0 order-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your documents..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
