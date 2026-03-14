"use client";

import { useEffect } from "react";

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getCsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`));
  return match ? match.split("=")[1] : "";
}

/**
 * Automatically attaches CSRF token header to all mutation fetch requests.
 * Wraps the native fetch once and ensures the CSRF cookie is available.
 */
export function CsrfProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Patch fetch to add CSRF header automatically
    const originalFetch = window.fetch;

    // Ensure cookie exists on first load (GET triggers middleware)
    if (!getCsrfToken()) {
      originalFetch("/api/cart", { credentials: "same-origin" }).catch(() => {});
    }

    window.fetch = async function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const method = (init?.method || "GET").toUpperCase();

      const urlString = typeof input === 'string' 
        ? input 
        : input instanceof URL 
          ? input.href 
          : (input as Request).url;
          
      const isSameOrigin = urlString.startsWith('/') || urlString.startsWith(window.location.origin);
      const isApiRoute = urlString.includes('/api/');

      if (MUTATION_METHODS.has(method) && isSameOrigin && isApiRoute) {
        const headers = new Headers(init?.headers);
        const token = getCsrfToken();
        if (token && !headers.has(CSRF_HEADER)) {
          headers.set(CSRF_HEADER, token);
        }
        return originalFetch(input, { ...init, headers });
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}
