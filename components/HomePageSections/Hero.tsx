import Link from "next/link";

import {
  ArrowRight,
  Code,
  Github,
  Heart,
  MessageSquare,
  Star,
  Upload,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                Open Source
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Free Forever
              </Badge>
            </div>

            <h1 className="font-poppins font-bold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Your personal{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI knowledge
              </span>{" "}
              assistant
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Open source AI-powered document management. Sign up for free and
              join our community-driven platform where transparency meets
              innovation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="https://github.com/code-blooded-developer/neuronote">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  View Source Code
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-500" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Community driven</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-card border rounded-2xl p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border">
                  <Upload className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">my_research_notes.pdf</div>
                    <div className="text-sm text-muted-foreground">
                      Personal • 1.8 MB
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-accent/5 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-accent mt-1" />
                    <div>
                      <div className="font-medium mb-2">
                        What did I learn about AI?
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Based on your notes, you explored three main concepts...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground p-2 rounded-full">
                <Heart className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
