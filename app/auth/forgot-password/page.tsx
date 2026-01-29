"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import Link from "next/link";

import { CheckCircle, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { forgotPasswordAction } from "../actions";

export default function ForgotPassword() {
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    undefined,
  );
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setIsSuccess(true);
    }
  }, [state]);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-poppins font-bold">
              Check your email
            </CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to
              <br />
              <span className="font-medium text-foreground">
                {state?.values?.email ?? ""}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try
                again.
              </p>

              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="w-full"
              >
                Try another email
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

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-poppins font-bold">
            Reset your password
          </CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                defaultValue={state?.values?.email ?? ""}
                disabled={pending}
                className={state?.errors?.email ? "border-destructive" : ""}
              />
              {state?.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending reset link..." : "Send reset link"}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
