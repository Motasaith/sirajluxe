"use client";

import { useEffect, useRef, useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();
  const [error, setError] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function completeOAuth() {
      if (!signIn || !signUp) return;

      try {
        // Case 1: Sign-in completed (existing user with OAuth)
        if (signIn.status === "complete") {
          await setSignInActive({ session: signIn.createdSessionId });
          router.push("/");
          return;
        }

        // Case 2: User doesn't have an account yet — transfer OAuth to sign-up
        if (
          signIn.firstFactorVerification?.status === "transferable" ||
          signIn.status === "needs_first_factor"
        ) {
          // Create a new user from the OAuth data
          const result = await signUp.create({ transfer: true });
          if (result.status === "complete") {
            await setSignUpActive({ session: result.createdSessionId });
            router.push("/");
            return;
          }
        }

        // Case 3: Sign-up already had OAuth data (existing external account)
        if (
          signUp.status === "complete"
        ) {
          await setSignUpActive({ session: signUp.createdSessionId });
          router.push("/");
          return;
        }

        // Case 4: Sign-up has external account that already exists — transfer to sign-in
        if (
          signUp.verifications?.externalAccount?.status === "transferable" &&
          signUp.verifications?.externalAccount?.error?.code === "external_account_exists"
        ) {
          const result = await signIn.create({ transfer: true });
          if (result.status === "complete") {
            await setSignInActive({ session: result.createdSessionId });
            router.push("/");
            return;
          }
        }

        console.error("OAuth incomplete. signIn.status:", signIn.status, "signUp.status:", signUp.status, "signIn.firstFactorVerification:", signIn.firstFactorVerification, "signUp.verifications:", signUp.verifications);
        setError("Authentication could not be completed. Please try again.");
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Something went wrong. Please try again.");
      }
    }

    completeOAuth();
  }, [signIn, signUp, setSignInActive, setSignUpActive, router]);

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
