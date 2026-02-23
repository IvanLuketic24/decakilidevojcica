import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/p(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const a = await auth();
  if (!a.userId) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};