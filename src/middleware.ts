import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/orders(.*)",
  "/checkout(.*)",
  "/admin(.*)",
  "/api/admin(.*)",
]);

// Webhooks must bypass auth — Stripe/Clerk send requests without user sessions
const isWebhookRoute = createRouteMatcher([
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isWebhookRoute(req)) return; // skip auth for webhooks
  if (isProtectedRoute(req)) {
    await auth.protect();
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
