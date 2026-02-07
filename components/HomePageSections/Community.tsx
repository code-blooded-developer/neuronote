import Link from "next/link";

import { Github, MessageSquare, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Community() {
  return (
    <section id="community" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
            Join our community
          </h2>
          <p className="text-xl text-muted-foreground">
            Connect with developers, share ideas, and help shape the future of
            NeuroNote
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg text-center p-8">
            <Github className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-xl mb-2">Contribute on GitHub</h3>
            <p className="text-muted-foreground mb-6">
              Help improve NeuroNote by contributing code, reporting bugs, or
              suggesting features.
            </p>
            <Link href="https://github.com/code-blooded-developer/neuronote">
              <Button className="w-full">
                <Github className="h-4 w-4 mr-2" />
                View Repository
              </Button>
            </Link>
          </Card>

          <Card className="border-0 shadow-lg text-center p-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold text-xl mb-2">Join Discussions</h3>
            <p className="text-muted-foreground mb-6">
              Connect with other users, get help, and share your experiences in
              our community forum.
            </p>
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Community Forum
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
