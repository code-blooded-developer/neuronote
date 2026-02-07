import { Brain, Code, Download, MessageSquare, Upload } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "Smart Document Upload",
    description:
      "Drag and drop PDFs, Word docs, and text files. AI automatically extracts and indexes content.",
  },
  {
    icon: MessageSquare,
    title: "AI-Powered Chat",
    description:
      "Ask questions about your documents and get instant, contextual answers with source citations.",
  },
  {
    icon: Brain,
    title: "Neural Search",
    description:
      "Advanced semantic search that understands context and meaning, not just keywords.",
  },
];

const openSourceFeatures = [
  {
    icon: Code,
    title: "100% Open Source",
    description:
      "Full source code available on GitHub. Fork, modify, and contribute to make it better.",
  },
  {
    icon: Download,
    title: "Always Free",
    description:
      "No subscriptions, no hidden costs. Use all features for free, forever.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
            Powerful features for your personal projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build your own intelligent document system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Open Source Features */}
        <div className="text-center mb-12">
          <h3 className="font-poppins font-bold text-2xl md:text-3xl mb-4">
            Why choose open source?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {openSourceFeatures.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-primary/5 to-accent/5"
            >
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
