"use client";

import { useActionState, useState, use } from "react";
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
import { Eye, EyeOff, Mail } from "lucide-react";
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

  if (!token) {
    redirect("/");
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
          <CardDescription>Enter your new password.</CardDescription>
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
              <Label htmlFor="password">Password</Label>
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
              <Label htmlFor="confirmPassword">Confirm password</Label>
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
