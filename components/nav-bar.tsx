import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="font-poppins font-bold text-xl text-foreground">
            NeuroNote
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Pricing
          </a>
          <a
            href="#testimonials"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Testimonials
          </a>
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
