import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: [
    "/",                 // ako imaš landing
    "/p/:path*",         // friend flow (javno)
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/public/:path*", // ako budeš imao javne API rute
  ],
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};