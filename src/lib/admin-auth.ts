import { auth } from "@clerk/nextjs/server";

// Add admin email addresses here
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

export async function isAdmin(): Promise<boolean> {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;

    // Check if user email is in admin list
    const email = (sessionClaims as { email?: string })?.email || "";
    if (ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email)) return true;

    // Fallback: check Clerk metadata for admin role
    const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
    if (role === "admin") return true;

    // If no admin emails configured, allow any authenticated user (dev mode)
    if (ADMIN_EMAILS.length === 0) return true;

    return false;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
