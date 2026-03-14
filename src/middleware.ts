import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { setCsrfCookie, validateCsrf, CSRF_COOKIE } from "@/lib/csrf";

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/admin(.*)",
  "/api/admin(.*)",
  "/orders(/?)$",
]);

// Routes that bypass BOTH auth and CSRF (external webhooks, cron)
const isBypassRoute = createRouteMatcher([
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/api/auth(.*)",
]);

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export default clerkMiddleware(async (auth, req) => {
  if (isBypassRoute(req)) return; // skip auth + CSRF for webhooks/cron

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // --- CSRF protection for API mutation requests ---
  const isApiMutation =
    req.nextUrl.pathname.startsWith("/api/") &&
    MUTATION_METHODS.has(req.method);

  if (isApiMutation && !validateCsrf(req)) {
    return NextResponse.json(
      { error: "Invalid or missing CSRF token" },
      { status: 403 }
    );
  }

  // Ensure CSRF cookie is always set
  const existingToken = req.cookies.get(CSRF_COOKIE)?.value;
  if (!existingToken) {
    const response = NextResponse.next();
    setCsrfCookie(response);
    return response;
  }
});

export const config = {
  matcher: [
    // Skip internal Next.js routes and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
