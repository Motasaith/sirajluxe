"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { UserProfile, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { isLoaded } = useUser();

  return (
    <PageTransitionProvider>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          {/* Page Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
              My Account
            </p>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-heading mb-4">
              Account <span className="neon-text">Settings</span>
            </h1>
            <p className="text-lg text-muted-fg max-w-xl">
              Manage your profile, security settings, and preferences.
            </p>
          </motion.div>

          {/* Clerk UserProfile */}
          {!isLoaded ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <UserProfile
                appearance={{
                  baseTheme: dark,
                  variables: {
                    colorPrimary: "#2563eb",
                    colorBackground: "#0a0a0f",
                    colorText: "#e1e2e6",
                    colorInputBackground: "#1a1a1f",
                    colorInputText: "#e1e2e6",
                    borderRadius: "0.75rem",
                  },
                  elements: {
                    rootBox: "w-full max-w-4xl",
                    card: "!bg-transparent !shadow-none !border-0",
                    navbar: "!bg-[var(--surface)]",
                    pageScrollBox: "!bg-transparent",
                  },
                }}
              />
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
