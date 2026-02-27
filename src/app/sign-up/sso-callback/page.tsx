"use client";

import { useEffect, useRef, useState } from "react";
import { useSignUp, useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignUpSSOCallbackPage() {
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();
  const [error, setError] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function completeOAuth() {
      try {
        // Try Clerk's built-in redirect callback handler first
        await handleRedirectCallback({
          afterSignUpUrl: "/",
          afterSignInUrl: "/",
          redirectUrl: "/sign-up/sso-callback",
        });
      } catch {
        // If handleRedirectCallback fails, manually check signUp status
        try {
          if (!signUp || !signIn) return;

          if (signUp.status === "complete") {
            await setSignUpActive({ session: signUp.createdSessionId });
            router.push("/");
            return;
          }

          // Handle "transferable" — user already has an account
          if (signUp.status === "missing_requirements" || signUp.status === "abandoned") {
            // Try to transfer to sign-in
            const result = await signIn.create({ transfer: true });
            if (result.status === "complete") {
              await setSignInActive({ session: result.createdSessionId });
              router.push("/");
              return;
            }
          }

          // Fallback: redirect to sign-up with error
          console.error("OAuth sign-up incomplete. Status:", signUp.status);
          setError("Sign-up could not be completed. Please try again.");
        } catch (innerErr) {
          console.error("OAuth callback error:", innerErr);
          setError("Something went wrong. Please try again.");
        }
      }
    }

    completeOAuth();
  }, [signUp, signIn, setSignUpActive, setSignInActive, handleRedirectCallback, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-violet/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
          <button
            onClick={() => router.push("/sign-up")}
            className="text-sm text-neon-violet hover:text-neon-purple transition-colors"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-violet/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
        <p className="text-sm text-[var(--muted)]">Creating your account...</p>
      </div>
    </div>
  );
}
