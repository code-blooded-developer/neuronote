"use client";

import { useActionState, useState, use, useEffect } from "react";
import { resetPasswordAction } from "@/app/auth/actions";

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
import { Eye, EyeOff, KeyRound, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = use(searchParams);
  const token = params.token;

  const [state, action, pending] = useActionState(
    resetPasswordAction,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setTimeout(() => {
        redirect("/auth/signin");
      }, 2000);
    }
  }, [state]);

  if (state?.ok) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-poppins font-bold">
              Password reset successful!
            </CardTitle>
            <CardDescription>
              Your password has been updated successfully. You can now sign in
              with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting you to sign in page in a few seconds...
              </p>

              <Button asChild className="w-full">
                <Link href="/auth/signin">Continue to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || state?.errors?.token) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-poppins font-bold">
              Invalid reset link
            </CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                {!token
                  ? "Invalid or expired reset link"
                  : state?.errors?.token}
              </p>
            </div>

            <div className="text-center space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">Request New Reset Link</Link>
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
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-poppins font-bold">
            Create new password
          </CardTitle>
          <CardDescription>
            Enter a new password for your NeuroNote account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.errors?.token && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{state?.errors?.token}</p>
            </div>
          )}

          <form action={action} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div className="space-y-2">
              <Label htmlFor="password"> NewPassword</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  disabled={pending}
                  defaultValue={state?.values?.password ?? ""}
                  className={
                    state?.errors?.password
                      ? "border-destructive pr-10"
                      : "pr-10"
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {state?.errors?.password && (
                <p className="text-sm text-destructive">
                  {state?.errors?.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                disabled={pending}
                defaultValue={state?.values?.confirmPassword ?? ""}
                className={
                  state?.errors?.confirmPassword ? "border-destructive" : ""
                }
              />
              {state?.errors?.confirmPassword && (
                <p className="text-sm text-destructive">
                  {state?.errors?.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Updating..." : "Update Password"}
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
