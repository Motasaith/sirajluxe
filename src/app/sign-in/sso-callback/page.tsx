"use client";

import { useEffect, useRef, useState } from "react";
import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();
  const [error, setError] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function completeOAuth() {
      try {
        await handleRedirectCallback({
          afterSignInUrl: "/",
          afterSignUpUrl: "/",
          redirectUrl: "/sign-in/sso-callback",
        });
      } catch {
        try {
          if (!signIn || !signUp) return;

          if (signIn.status === "complete") {
            await setSignInActive({ session: signIn.createdSessionId });
            router.push("/");
            return;
          }

          // User used sign-in OAuth but doesn't have an account — transfer to sign-up
          if (signIn.firstFactorVerification?.status === "transferable") {
            const result = await signUp.create({ transfer: true });
            if (result.status === "complete") {
              await setSignUpActive({ session: result.createdSessionId });
              router.push("/");
              return;
            }
          }

          console.error("OAuth sign-in incomplete. Status:", signIn.status);
          setError("Sign-in could not be completed. Please try again.");
        } catch (innerErr) {
          console.error("OAuth callback error:", innerErr);
          setError("Something went wrong. Please try again.");
        }
      }
    }

    completeOAuth();
  }, [signIn, signUp, setSignInActive, setSignUpActive, handleRedirectCallback, router]);

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
            onClick={() => router.push("/sign-in")}
            className="text-sm text-neon-violet hover:text-neon-purple transition-colors"
          >
            Back to Sign In
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
        <p className="text-sm text-[var(--muted)]">Completing sign in...</p>
      </div>
    </div>
  );
}
