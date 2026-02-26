"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-heading mb-2">Message Sent!</h3>
        <p className="text-muted-fg mb-6">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-heading mb-1.5">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg focus:outline-none focus:border-neon-violet transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-heading mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            maxLength={200}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg focus:outline-none focus:border-neon-violet transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-heading mb-1.5">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          maxLength={200}
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg focus:outline-none focus:border-neon-violet transition-colors"
          placeholder="Order enquiry, feedback, etc."
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-heading mb-1.5">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg focus:outline-none focus:border-neon-violet transition-colors resize-none"
          placeholder="How can we help you?"
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded-xl bg-neon-violet text-white font-medium hover:shadow-neon transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
