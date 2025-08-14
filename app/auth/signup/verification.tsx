import { Mail, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Link from "next/link";

type VerificationProps = {
  email: string;
  setShowVerification: (show: boolean) => void;
};

export default function Verification({
  email,
  setShowVerification,
}: VerificationProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-2xl font-poppins font-bold">
            Verify your email
          </CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <CheckCircle className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Please check your email and click the verification link to
                activate your account.
              </p>
            </div>

            <div className="text-xs text-muted-foreground space-y-2">
              <p>Didn&apos;t receive the email?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Wait a few minutes for the email to arrive</li>
              </ul>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowVerification(false)}
              className="w-full"
            >
              Try different email
            </Button>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
