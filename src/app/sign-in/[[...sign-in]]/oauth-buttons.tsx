"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { Loader2 } from "lucide-react";

interface OAuthButtonsProps {
  mode: "sign-in" | "sign-up";
}

export function OAuthButtons({ mode }: OAuthButtonsProps) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuth = async (strategy: OAuthStrategy) => {
    const provider = mode === "sign-in" ? signIn : signUp;
    if (!provider) return;

    setLoadingProvider(strategy);

    try {
      const callbackUrl = mode === "sign-in" ? "/sign-in/sso-callback" : "/sign-up/sso-callback";
      await provider.authenticateWithRedirect({
        strategy,
        redirectUrl: callbackUrl,
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error("OAuth error:", err);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Google */}
      <button
        type="button"
        onClick={() => handleOAuth("oauth_google")}
        disabled={!!loadingProvider}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-white text-sm font-medium hover:bg-[var(--hover)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-neon-violet/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loadingProvider === "oauth_google" ? (
          <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.88.43 3.66 1.18 5.24l3.66-2.84v-.31z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={() => handleOAuth("oauth_facebook")}
        disabled={!!loadingProvider}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-white text-sm font-medium hover:bg-[var(--hover)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-neon-violet/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loadingProvider === "oauth_facebook" ? (
          <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
        )}
        Continue with Facebook
      </button>

      {/* TikTok */}
      <button
        type="button"
        onClick={() => handleOAuth("oauth_tiktok")}
        disabled={!!loadingProvider}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-white text-sm font-medium hover:bg-[var(--hover)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-neon-violet/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loadingProvider === "oauth_tiktok" ? (
          <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.971-1.166-1.956-1.282-2.645h.004c-.097-.573-.064-.943-.058-.943h-3.943v14.092c0 .19 0 .376-.01.56 0 .026-.003.05-.004.076 0 .012-.002.024-.003.036v.01a3.28 3.28 0 0 1-1.65 2.604 3.226 3.226 0 0 1-1.6.422c-1.8 0-3.26-1.468-3.26-3.281s1.46-3.282 3.26-3.282c.341 0 .68.054 1.004.16l.005-4.027a7.198 7.198 0 0 0-5.56 1.794 7.632 7.632 0 0 0-1.655 2.04c-.163.281-.779 1.412-.853 3.246-.047 1.04.266 2.12.415 2.565v.01c.093.262.457 1.158 1.049 1.913a8.22 8.22 0 0 0 1.537 1.514v-.01l.01.01c1.837 1.304 3.888 1.22 3.888 1.22.714-.03 3.1 0 5.727-1.57a7.7 7.7 0 0 0 2.296-2.394c.651-1.082 1.084-2.386 1.084-2.386V8.765a10.59 10.59 0 0 0 2.534 1.09c.86.225 2.012.349 2.012.349V6.236s-1.578.157-3.282-.674z" fill="currentColor" />
          </svg>
        )}
        Continue with TikTok
      </button>
    </div>
  );
}
