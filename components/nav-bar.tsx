import Link from "next/link";

import { Brain, Github } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="font-poppins font-bold text-xl text-foreground">
            NeuroNote
          </span>
          <Badge variant="secondary" className="ml-2">
            <Github className="h-3 w-3 mr-1" />
            Open Source
          </Badge>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#community"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Community
          </Link>
          <Link
            href="#contribute"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Contribute
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/auth/signin">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
