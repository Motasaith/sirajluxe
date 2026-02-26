"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay so it doesn't appear instantly
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4"
        >
          <div className="max-w-4xl mx-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-neon-violet" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-heading mb-1">We value your privacy</h3>
                <p className="text-xs text-muted-fg leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                  <Link href="/cookies" className="text-neon-violet hover:underline ml-1">
                    Cookie Policy
                  </Link>
                </p>
              </div>
              <button onClick={() => setShow(false)} className="p-1 text-subtle-fg hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={decline}
                className="px-5 py-2 text-sm font-medium text-muted-fg hover:text-heading transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="px-5 py-2 text-sm font-medium bg-neon-violet text-white rounded-xl hover:shadow-neon transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
