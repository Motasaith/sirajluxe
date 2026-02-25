import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * ADMIN_EMAILS — comma-separated list of email addresses allowed to access admin.
 * If this env var is empty or not set, NO ONE can access admin (secure by default).
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Get the primary email of the currently authenticated user from Clerk.
 * Uses the Clerk Backend API (not sessionClaims) for reliability.
 */
async function getUserEmail(userId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
  } catch {
    return "";
  }
}

/**
 * Check if the currently authenticated user is an admin.
 * Returns true ONLY if:
 * 1. User is logged in, AND
 * 2. Their Clerk primary email matches one in ADMIN_EMAILS, OR
 * 3. Their Clerk public metadata has role === "admin"
 *
 * If ADMIN_EMAILS is empty/not set, NO ONE is granted admin (secure by default).
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    // Fetch the user's actual email from Clerk Backend API
    const email = await getUserEmail(userId);

    // Check if email is in the admin allow-list
    if (ADMIN_EMAILS.length > 0 && email && ADMIN_EMAILS.includes(email)) {
      return true;
    }

    // Also check Clerk public metadata for admin role
    // (set via Clerk Dashboard > Users > [user] > Public metadata > { "role": "admin" })
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata as { role?: string })?.role;
    if (role === "admin") return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Call at the top of admin API route handlers.
 * Returns null if authorized, or a 403 NextResponse if not.
 */
export async function adminGuard(): Promise<NextResponse | null> {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: You do not have admin access" },
      { status: 403 }
    );
  }
  return null;
}
