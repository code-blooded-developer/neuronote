import Link from "next/link";

import { Brain, Heart } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function Footer() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-poppins font-bold text-lg">NeuroNote</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Open source AI-powered document management for everyone.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Heart className="h-3 w-3 mr-1" />
                Made with love
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Project</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://github.com/code-blooded-developer/neuronote"
                  className="hover:text-foreground transition-colors flex items-center gap-2"
                >
                  GitHub Repository
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/code-blooded-developer/neuronote?tab=readme-ov-file#installation"
                  className="hover:text-foreground transition-colors"
                >
                  Installation Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://github.com/code-blooded-developer/neuronote/issues"
                  className="hover:text-foreground transition-colors"
                >
                  Issues
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://github.com/code-blooded-developer/neuronote/issues"
                  className="hover:text-foreground transition-colors"
                >
                  Report Bug
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/code-blooded-developer/neuronote/issues"
                  className="hover:text-foreground transition-colors"
                >
                  Feature Request
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/code-blooded-developer/neuronote/blob/main/LICENSE"
                  className="hover:text-foreground transition-colors"
                >
                  License
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 NeuroNote. Released under the MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
