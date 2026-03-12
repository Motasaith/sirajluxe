import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Admin role hierarchy (highest to lowest):
 *   super_admin > admin > editor > support
 *
 * - super_admin  — full access (settings, roles, delete operations, refunds)
 * - admin        — manage products, orders, customers, coupons, media
 * - editor       — manage blog, site editor, newsletter, Q&A
 * - support      — view orders/customers, manage reviews & Q&A
 */
export type AdminRole = "super_admin" | "admin" | "editor" | "support";

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  support: 1,
};

/**
 * ADMIN_EMAILS — comma-separated list of email addresses allowed to access admin.
 * If this env var is empty or not set, NO ONE can access admin (secure by default).
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Get the admin role for the current user.
 * Returns the role if the user is an admin, or null if not.
 *
 * Role resolution order:
 * 1. Clerk publicMetadata.role (if set and valid)
 * 2. ADMIN_EMAILS match → defaults to "super_admin"
 * 3. null (not an admin)
 */
export async function getUserRole(): Promise<{ role: AdminRole; userId: string } | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const metadata = user.publicMetadata as { role?: string };

    // Check if metadata has a valid admin role
    if (metadata?.role && metadata.role in ROLE_HIERARCHY) {
      return { role: metadata.role as AdminRole, userId };
    }

    // Legacy check: ADMIN_EMAILS → super_admin
    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
    if (ADMIN_EMAILS.length > 0 && email && ADMIN_EMAILS.includes(email)) {
      return { role: "super_admin", userId };
    }

    // Also accept "admin" from metadata (backward compat with old single-role)
    if (metadata?.role === "admin") {
      return { role: "admin", userId };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if the currently authenticated user is an admin (any role).
 */
export async function isAdmin(): Promise<boolean> {
  const result = await getUserRole();
  return result !== null;
}

/**
 * Check if a role meets or exceeds the required role level.
 */
export function hasMinRole(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Call at the top of admin API route handlers.
 * With no argument: any admin role is accepted.
 * With a role argument: user must have that role or higher.
 * Returns null if authorized, or a 403 NextResponse if not.
 */
export async function adminGuard(requiredRole?: AdminRole): Promise<NextResponse | null> {
  const result = await getUserRole();
  if (!result) {
    return NextResponse.json(
      { error: "Forbidden: You do not have admin access" },
      { status: 403 }
    );
  }
  if (requiredRole && !hasMinRole(result.role, requiredRole)) {
    return NextResponse.json(
      { error: `Forbidden: Requires ${requiredRole} role or higher` },
      { status: 403 }
    );
  }
  return null;
}
