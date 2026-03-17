"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUsed, setLastUsed] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLastUsed(localStorage.getItem("last_auth_method") || "");
  }, []);

  const handleOAuth = (strategy: any) => {
    if (!isLoaded) return;
    localStorage.setItem("last_auth_method", strategy);
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setLoading(true);
    setError("");

    try {
      localStorage.setItem("last_auth_method", "email");
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("More verification steps are required.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Sign in failed. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-20 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 sm:p-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-heading mb-2">Welcome back</h1>
            <p className="text-sm text-muted-fg">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-blue-500 text-heading transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-heading">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-blue-500 text-heading transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-fg hover:text-heading"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
            {lastUsed === "email" && <p className="text-center text-[11px] text-emerald-500 mt-1">✓ You previously used this method</p>}
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-muted-fg font-medium tracking-wider uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <div className="space-y-3">
            {[
              { id: 'oauth_google', name: 'Google', icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )},
              { id: 'oauth_facebook', name: 'Facebook', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
              )},
              { id: 'oauth_tiktok', name: 'TikTok', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.52 5.46-3.88 6.84-2.51 1.4-5.71 1.5-8.24.23-2.61-1.32-4.22-4.14-4-7.06.19-2.76 1.9-5.18 4.41-6.19 1.83-.73 3.94-.7 5.7.07.72.31 1.29.58 1.85.95v-4.1c-1.39-.77-3-1.07-4.56-1.1-2.92-.04-5.83.67-8.15 2.45C1.84 10.74.31 13.68.04 16.78c-.28 3.08.77 6.18 2.77 8.44 2.1 2.37 5.17 3.63 8.35 3.73 3.19.1 6.32-1.06 8.58-3.26 2.31-2.25 3.52-5.36 3.52-8.59V.02h-4.32Z"/>
                </svg>
              )}
            ].map((provider) => (
              <div key={provider.id}>
                <button
                  type="button"
                  onClick={() => handleOAuth(provider.id)}
                  disabled={!isLoaded}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] text-heading transition-colors"
                >
                  {provider.icon}
                  <span className="font-medium">Continue with {provider.name}</span>
                </button>
                {lastUsed === provider.id && (
                  <p className="text-center text-[11px] text-emerald-500 mt-1">✓ You previously used this method</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-center mt-8 text-sm text-muted-fg">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
