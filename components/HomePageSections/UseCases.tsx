import { BookOpen, Brain, FolderOpen } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const useCases = [
  {
    title: "Personal Knowledge Base",
    description:
      "Organize your research papers, notes, and documents in one intelligent system.",
    icon: BookOpen,
  },
  {
    title: "Academic Research",
    description:
      "Perfect for researchers and students managing large document collections.",
    icon: Brain,
  },
  {
    title: "Project Documentation",
    description:
      "Keep all your project docs searchable and accessible with AI assistance.",
    icon: FolderOpen,
  },
];

export default function UseCases() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
            Perfect for your projects
          </h2>
          <p className="text-xl text-muted-foreground">
            See how NeuroNote can enhance your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <useCase.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {useCase.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
