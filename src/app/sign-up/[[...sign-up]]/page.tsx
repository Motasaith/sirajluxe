"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { OAuthButtons } from "../../sign-in/[[...sign-in]]/oauth-buttons";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Password strength
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][strength] || "";
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-400"][strength] || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setError("");
    setLoading(true);

    try {
      await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: email,
        password,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string; longMessage?: string }[] };
      const message =
        clerkError.errors?.[0]?.longMessage ||
        clerkError.errors?.[0]?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setError("");
    setVerifying(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string; longMessage?: string }[] };
      const message =
        clerkError.errors?.[0]?.longMessage ||
        clerkError.errors?.[0]?.message ||
        "Invalid verification code. Please try again.";
      setError(message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505] py-8">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-neon-violet/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                Siraj
              </span>
              <span className="bg-gradient-to-r from-neon-violet to-neon-purple bg-clip-text text-transparent">
                {" "}Luxe
              </span>
            </h1>
          </Link>
          <p className="text-[var(--muted)] text-sm mt-2">
            {pendingVerification ? "Check your email" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-violet/50 to-transparent" />

          <div className="p-8">
            {!pendingVerification ? (
              <>
                <h2 className="text-xl font-semibold text-white mb-1">Create account</h2>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Join Siraj Luxe for exclusive deals
                </p>

                {/* OAuth Buttons */}
                <OAuthButtons mode="sign-up" />

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[#0a0a0f] text-[var(--muted)]">or sign up with email</span>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                        First name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--subtle)]" />
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          required
                          autoComplete="given-name"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-white text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                        autoComplete="family-name"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-white text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signupEmail" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--subtle)]" />
                      <input
                        id="signupEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-white text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signupPassword" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--subtle)]" />
                      <input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-white text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--subtle)] hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength meter */}
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= strength ? strengthColor : "bg-[var(--border)]"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[var(--muted)]">{strengthLabel}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isLoaded}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-neon-violet to-neon-purple text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-violet/25 focus:outline-none focus:ring-2 focus:ring-neon-violet/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-[var(--dim)] leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-neon-violet hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-neon-violet hover:underline">Privacy Policy</Link>
                  </p>
                </form>
              </>
            ) : (
              /* Verification Step */
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-neon-violet/10 border border-neon-violet/20 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-neon-violet" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-1">Verify your email</h2>
                  <p className="text-sm text-[var(--muted)]">
                    We&apos;ve sent a 6-digit code to<br />
                    <span className="text-white font-medium">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                      Verification code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      required
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || verificationCode.length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-neon-violet to-neon-purple text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-violet/25 focus:outline-none focus:ring-2 focus:ring-neon-violet/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPendingVerification(false);
                      setVerificationCode("");
                      setError("");
                    }}
                    className="w-full text-center text-sm text-[var(--muted)] hover:text-white transition-colors"
                  >
                    Use a different email
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          {!pendingVerification && (
            <div className="px-8 py-4 border-t border-[var(--border)] bg-[var(--elevated)]/50">
              <p className="text-center text-sm text-[var(--muted)]">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-neon-violet hover:text-neon-purple font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-[var(--dim)] text-xs">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          Secured by Clerk
        </div>
      </div>
    </div>
  );
}
