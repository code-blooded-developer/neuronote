import Link from "next/link";

import { ArrowRight, Github, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GetStarted() {
  return (
    <section
      id="contribute"
      className="py-20 bg-primary text-primary-foreground"
    >
      <div className="container text-center">
        <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
          Ready to get started?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join our open source community and start organizing your documents
          with AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="group">
              Sign Up Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="https://github.com/code-blooded-developer/neuronote">
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary hover:bg-primary-foreground hover:text-primary flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              View Source Code
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-75">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            <span>Open source</span>
          </div>
        </div>
      </div>
    </section>
  );
}
