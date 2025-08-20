import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

const protectedRoutes = ["/dashboard", "/documents"]; // pages that require login
const unprotectedRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
]; // pages for guests only

export default async function middleware(req: NextRequest) {
  const session = await auth();
  const pathname = req.nextUrl.pathname;

  // 1. If user is not logged in and tries to access protected routes → redirect to sign in
  if (protectedRoutes.includes(pathname) && !session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // 2. If user is logged in and tries to access sign in/up → redirect to home
  if (unprotectedRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow the request if no redirect condition is met
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
