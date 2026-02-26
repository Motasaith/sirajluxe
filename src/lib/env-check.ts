/**
 * Runtime validation for required environment variables.
 * Called once at build time / first server request.
 * Warnings appear in server logs; the app still starts so deploys
 * don't hard-fail, but operators are alerted to misconfigurations.
 */

const REQUIRED_VARS = [
  "MONGODB_URI",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "BLOB_READ_WRITE_TOKEN",
] as const;

const OPTIONAL_BUT_RECOMMENDED = [
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "NEXT_PUBLIC_SITE_URL",
] as const;

let validated = false;

export function validateEnv() {
  if (validated) return;
  validated = true;

  const missing: string[] = [];
  const empty: string[] = [];

  for (const key of REQUIRED_VARS) {
    const val = process.env[key];
    if (!val) missing.push(key);
    else if (val.trim() === "") empty.push(key);
  }

  const missingOptional: string[] = [];
  for (const key of OPTIONAL_BUT_RECOMMENDED) {
    if (!process.env[key]) missingOptional.push(key);
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️  SECURITY: Missing required env vars: ${missing.join(", ")}. Some features will not work.`
    );
  }

  if (empty.length > 0) {
    console.warn(
      `⚠️  SECURITY: Empty env vars (set but blank): ${empty.join(", ")}. Webhooks may not be verified.`
    );
  }

  if (missingOptional.length > 0) {
    console.info(
      `ℹ️  Recommended env vars not set: ${missingOptional.join(", ")}`
    );
  }

  // Warn about mixed environments (test Clerk + live Stripe — or vice versa)
  const clerkKey = process.env.CLERK_SECRET_KEY || "";
  const stripeKey = process.env.STRIPE_SECRET_KEY || "";
  const clerkIsTest = clerkKey.startsWith("sk_test_");
  const stripeIsTest = stripeKey.startsWith("sk_test_");
  if (clerkKey && stripeKey && clerkIsTest !== stripeIsTest) {
    console.warn(
      `⚠️  SECURITY: Clerk is using ${clerkIsTest ? "TEST" : "LIVE"} keys but Stripe is using ${stripeIsTest ? "TEST" : "LIVE"} keys. Align both to the same environment.`
    );
  }
}
