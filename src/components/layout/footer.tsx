"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Twitter,
  Instagram,
  Linkedin,
  ArrowUpRight,
  Mail,
} from "lucide-react";
import { useSiteContent } from "@/components/providers/site-content-provider";
import { useToast } from "@/components/ui/toast";

const defaultFooterLinks: Record<string, { label: string; href: string }[]> = {
  Shop: [
    { label: "All Products", href: "/shop" },
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Best Sellers", href: "/shop?filter=bestsellers" },
    { label: "Sale", href: "/shop?filter=sale" },
  ],
  Support: [
    { label: "Help Centre", href: "/help" },
    { label: "Track Order", href: "/track" },
    { label: "My Orders", href: "/orders" },
    { label: "My Reviews", href: "/my-reviews" },
    { label: "FAQ", href: "/faq" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Warranty", href: "/warranty" },
    { label: "Contact", href: "/contact" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
    { label: "Careers", href: "/careers" },
    { label: "Accessibility", href: "/accessibility" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

const defaultSocialLinks = [
  { icon: Twitter, href: "https://x.com/sirajluxe", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/sirajluxe", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/sirajluxe", label: "LinkedIn" },
];

export function Footer() {
  const { data: cms } = useSiteContent("footer");
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!email || subscribing) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast({ title: "Subscribed!", description: "Welcome to the club.", variant: "success" });
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: "Failed to subscribe", description: data.error || "Please try again.", variant: "error" });
      }
    } catch {
      toast({ title: "Network error", description: "Check your connection and try again.", variant: "error" });
    } finally {
      setSubscribing(false);
    }
  };

  // Parse CMS footer columns if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerLinks: Record<string, { label: string; href: string }[]> = (() => {
    if (Array.isArray(cms?.columns) && cms.columns.length > 0) {
      const result: Record<string, { label: string; href: string }[]> = {};
      for (const col of cms.columns) {
        const title = col.title || "Links";
        const linkLines = (col.linksText || "").split("\n").filter(Boolean);
        result[title] = linkLines.map((line: string) => {
          const [label, href] = line.split("|");
          return { label: label?.trim() || "", href: href?.trim() || "#" };
        });
      }
      return result;
    }
    return defaultFooterLinks;
  })();

  const socialLinks = defaultSocialLinks;

  return (
    <footer className="relative bg-background border-t border-[var(--border)]">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-orb gradient-orb-2 opacity-5" />
      </div>

      <div className="relative ultra-wide-padding">
        {/* Newsletter Section */}
        <div className="py-20 border-b border-[var(--border)]">
          <div className="max-w-2xl">
            <motion.p
              className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {cms?.newsletterLabel || "Stay in the loop"}
            </motion.p>
            <motion.h3
              className="text-3xl md:text-4xl font-display font-bold text-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {cms?.newsletterHeading || "Get early access to drops, exclusive offers, and the latest news."}
            </motion.h3>
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative flex-1 max-w-md">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
                <input
                  type="email"
                  placeholder={cms?.newsletterPlaceholder || "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  className="w-full pl-12 pr-4 py-3.5 rounded-full bg-[var(--overlay)] border border-[var(--border-strong)] text-heading placeholder:text-subtle-fg focus:outline-none focus:border-neon-violet/50 focus:ring-2 focus:ring-neon-violet/20 transition-all duration-300"
                />
              </div>
              <button className="magnetic-btn px-6" onClick={handleSubscribe} disabled={subscribing}>
                <span className="flex items-center gap-2">
                  {subscribing ? "Subscribing…" : (cms?.newsletterButton || "Subscribe")}
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16">
          {Object.entries(footerLinks).map(([category, links], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h4 className="text-sm font-semibold text-heading tracking-wider uppercase mb-6">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-fg hover:text-heading transition-colors duration-300 inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-[var(--border)] flex flex-col items-center gap-6">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-violet to-neon-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">{cms?.logoLetter || "S"}</span>
              </div>
              <span className="text-sm text-subtle-fg">
                {cms?.copyright || "© 2026 Siraj Luxe. All rights reserved."}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full text-subtle-fg hover:text-heading hover:bg-[var(--hover)] transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="text-xs text-subtle-fg/60 text-center">
            Powered by{" "}
            <span className="text-subtle-fg">BinaCodes</span>
            {" "}&middot;{" "}
            Developed by{" "}
            <a
              href="https://github.com/Motasaith"
              target="_blank"
              rel="noopener noreferrer"
              className="text-subtle-fg hover:text-neon-violet transition-colors duration-300"
            >
              Abdul Rauf Azhar
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
