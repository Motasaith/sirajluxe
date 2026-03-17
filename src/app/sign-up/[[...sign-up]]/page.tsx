"use client";

import { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Check, X } from "lucide-react";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [lastUsed, setLastUsed] = useState("");

  const router = useRouter();

  useEffect(() => {
    setLastUsed(localStorage.getItem("last_auth_method") || "");
  }, []);

  const handleOAuth = (strategy: any) => {
    if (!isLoaded) return;
    localStorage.setItem("last_auth_method", strategy);
    signUp.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length === 0) return { label: "", color: "bg-transparent" };
    if (score < 2) return { label: "Weak", color: "bg-red-400" };
    if (score === 2 || score === 3) return { label: "Medium", color: "bg-amber-400" };
    return { label: "Strong", color: "bg-emerald-400" };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      localStorage.setItem("last_auth_method", "email");
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-20 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10 glass-card p-8 sm:p-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-2xl">
          <div className="text-center mb-8">
            <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-heading mb-2">Check your email</h1>
            <p className="text-sm text-muted-fg">We sent a verification code to {email}</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-heading mb-1.5 block">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-blue-500 text-heading text-center tracking-[0.5em] text-lg"
                placeholder="123456"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-10 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="glass-card p-8 sm:p-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-heading mb-2">Create an account</h1>
            <p className="text-sm text-muted-fg">Join us to start shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-500 text-sm mb-4">
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
              <label className="text-sm font-medium text-heading">Password</label>
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
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="pt-1 flex items-center justify-between text-[11px] font-medium">
                  <span className="text-muted-fg">Strength:</span>
                  <div className="flex items-center gap-2">
                    <span className={\`transition-colors \${strength.label === 'Weak' ? 'text-red-400' : strength.label === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}\`}>
                      {strength.label}
                    </span>
                    <div className="flex gap-1 h-1.5 w-16 bg-[var(--background)] rounded-full overflow-hidden">
                      <div className={\`h-full \${strength.color}\`} style={{ width: strength.label === 'Weak' ? '33%' : strength.label === 'Medium' ? '66%' : '100%' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="text-sm font-medium text-heading">Confirm Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={\`w-full pl-11 pr-12 py-3 bg-[var(--background)] border rounded-xl focus:outline-none transition-colors \${confirmPassword.length > 0 ? (passwordsMatch ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-red-500/50 focus:border-red-500') : 'border-[var(--border)] focus:border-blue-500'}\`}
                  placeholder="••••••••"
                  required
                />
                {confirmPassword.length > 0 && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
            </button>
            {lastUsed === "email" && <p className="text-center text-[11px] text-emerald-500 mt-1">✓ You previously used this method</p>}
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-muted-fg font-medium tracking-wider uppercase">Or sign up with</span>
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
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
