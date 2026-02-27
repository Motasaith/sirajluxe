"use client";

import { useEffect } from "react";

/**
 * Legacy SSO callback location — OAuth now redirects to /sso-callback
 * (outside the [[...sign-in]] catch-all route to avoid routing conflicts).
 * This page only exists as a safety-net: it forwards the full URL
 * (including Clerk's query-params / hash) to the canonical route.
 */
export default function LegacySSOCallbackPage() {
  useEffect(() => {
    const target = new URL("/sso-callback", window.location.origin);
    target.search = window.location.search;
    target.hash = window.location.hash;
    window.location.replace(target.toString());
  }, []);

  return null;
}
