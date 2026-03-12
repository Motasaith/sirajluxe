const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";

function getCsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`));
  return match ? match.split("=")[1] : "";
}

/**
 * Drop-in replacement for fetch() that automatically attaches the CSRF token header
 * on mutation requests (POST, PUT, PATCH, DELETE).
 */
export async function csrfFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (isMutation) {
    const headers = new Headers(init?.headers);
    const token = getCsrfToken();
    if (token) {
      headers.set(CSRF_HEADER, token);
    }
    return fetch(input, { ...init, headers });
  }

  return fetch(input, init);
}

/**
 * Ensure CSRF cookie exists. Call this once on app mount.
 * If the cookie is missing, make a GET request to trigger middleware to set it.
 */
export async function ensureCsrfToken(): Promise<void> {
  if (!getCsrfToken()) {
    // Any GET to an API route will trigger middleware to set the cookie
    await fetch("/api/cart", { method: "GET", credentials: "same-origin" });
  }
}
