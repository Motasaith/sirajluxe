"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

/**
 * Canonical SSO callback page — handles the OAuth token exchange after the
 * user returns from the provider (Google, Facebook, TikTok, etc.).
 *
 * Placed at the TOP level (/sso-callback) so it is **outside** the
 * /sign-in/[[...sign-in]] optional catch-all route and cannot be
 * accidentally intercepted by it.
 *
 * `signInUrl` / `signUpUrl` tell the callback component where to redirect
 * when a "transfer" is needed (e.g. sign-in attempt for a user that doesn't
 * exist yet → transfer to sign-up, or vice-versa).
 */
export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-violet/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]" />
      </div>

      {/* Spinner */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
        <p className="text-sm text-[var(--muted)]">Completing sign in…</p>
      </div>

      {/* Clerk callback handler */}
      <AuthenticateWithRedirectCallback
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
}
