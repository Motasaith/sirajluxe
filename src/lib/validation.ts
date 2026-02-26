/**
 * Shared input-validation & sanitisation helpers
 * Used across API routes to prevent NoSQL injection, mass assignment, etc.
 */

// ── ObjectId ────────────────────────────────────────────────────────────
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/** Return true when `v` is a valid 24-hex-char MongoDB ObjectId string. */
export function isValidObjectId(v: unknown): v is string {
  return typeof v === "string" && OBJECT_ID_RE.test(v);
}

/** Throw-early guard — returns the validated id or null. */
export function requireObjectId(v: unknown): string | null {
  return isValidObjectId(v) ? v : null;
}

// ── String guard ────────────────────────────────────────────────────────
/** Ensures `v` is a plain string (not an object / operator). */
export function ensureString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

// ── Enum validation ─────────────────────────────────────────────────────
/** Returns the value if it's an allowed enum member, else null. */
export function validateEnum<T extends string>(
  v: unknown,
  allowed: readonly T[]
): T | null {
  if (typeof v !== "string") return null;
  return allowed.includes(v as T) ? (v as T) : null;
}

// ── Pagination ──────────────────────────────────────────────────────────
/** Parse an integer query param and clamp between min/max (default 1–100). */
export function capInt(
  raw: string | null,
  fallback: number,
  min = 1,
  max = 100
): number {
  const n = parseInt(raw || String(fallback), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

// ── Order statuses ──────────────────────────────────────────────────────
export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ── Sanitised error message ─────────────────────────────────────────────
/** Extract a safe message from an unknown error — never leaks stack / internals. */
export function safeErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

// ── Filename sanitisation ───────────────────────────────────────────────
/** Strip non-alphanumeric chars (except . _ -) and cap length. */
export function sanitizeFilename(name: string, maxLen = 255): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, maxLen);
}

// ── Allowed upload extensions ───────────────────────────────────────────
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export function hasAllowedExtension(filename: string): boolean {
  const ext = "." + filename.toLowerCase().split(".").pop();
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
}
