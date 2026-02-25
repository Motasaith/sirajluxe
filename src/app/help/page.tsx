import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import {
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  User,
  Shield,
  Mail,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Centre",
  description:
    "Get help with your Siraj Luxe orders, shipping, returns, payments, and account. Browse our guides or contact support.",
};

const sections = [
  {
    icon: Package,
    title: "Orders",
    description: "Track orders, order confirmation, order issues",
    links: [
      { label: "Track my order", href: "/orders" },
      { label: "I didn't receive my confirmation email", href: "/faq" },
      { label: "Cancel or change my order", href: "/contact" },
    ],
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    description: "Delivery times, shipping costs, delivery areas",
    links: [
      { label: "Shipping rates & times", href: "/shipping" },
      { label: "Do you ship internationally?", href: "/faq" },
      { label: "Free shipping promotion", href: "/shipping" },
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns & Refunds",
    description: "Return policy, how to return, refund timelines",
    links: [
      { label: "Start a return", href: "/returns" },
      { label: "Refund policy", href: "/returns" },
      { label: "I received a damaged item", href: "/contact" },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Payment methods, security, pricing",
    links: [
      { label: "Accepted payment methods", href: "/faq" },
      { label: "Is my payment secure?", href: "/faq" },
      { label: "Prices & VAT", href: "/faq" },
    ],
  },
  {
    icon: User,
    title: "My Account",
    description: "Create account, sign in, manage data",
    links: [
      { label: "Create an account", href: "/sign-up" },
      { label: "Reset my password", href: "/sign-in" },
      { label: "Delete my account", href: "/contact" },
    ],
  },
  {
    icon: Shield,
    title: "Privacy & Legal",
    description: "Privacy policy, terms, cookies, your rights",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
    ],
  },
];

export default function HelpCentrePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--border)] text-xs font-medium text-neon-violet uppercase tracking-widest mb-4">
              Support
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              How can we help?
            </h1>
            <p className="text-muted-fg max-w-xl mx-auto">
              Find answers to common questions, browse our guides, or get in touch with our support team.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-6 hover:border-neon-violet/20 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-neon-violet/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-neon-violet" />
                  </div>
                  <div>
                    <h2 className="text-heading font-semibold">{section.title}</h2>
                    <p className="text-xs text-muted-fg">{section.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-body hover:text-neon-violet transition-colors"
                      >
                        → {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Popular Resources */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-8 mb-12">
            <h2 className="text-xl font-bold text-heading mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-neon-violet" />
              Popular Resources
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/faq" className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/[0.02] transition-colors group">
                <span className="text-neon-violet font-bold">FAQ</span>
                <span className="text-sm text-muted-fg group-hover:text-body transition-colors">Frequently asked questions</span>
              </Link>
              <Link href="/size-guide" className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/[0.02] transition-colors group">
                <span className="text-neon-violet font-bold">Size Guide</span>
                <span className="text-sm text-muted-fg group-hover:text-body transition-colors">Find your perfect fit</span>
              </Link>
              <Link href="/warranty" className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/[0.02] transition-colors group">
                <span className="text-neon-violet font-bold">Warranty</span>
                <span className="text-sm text-muted-fg group-hover:text-body transition-colors">2-year warranty details</span>
              </Link>
              <Link href="/shipping" className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/[0.02] transition-colors group">
                <span className="text-neon-violet font-bold">Shipping</span>
                <span className="text-sm text-muted-fg group-hover:text-body transition-colors">Delivery info & free shipping</span>
              </Link>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="glass-card p-8 text-center">
            <Mail className="w-8 h-8 text-neon-violet mx-auto mb-4" />
            <h2 className="text-xl font-bold text-heading mb-2">
              Still need help?
            </h2>
            <p className="text-sm text-muted-fg mb-6 max-w-md mx-auto">
              Our support team is available Monday–Friday, 9am–5pm GMT. We typically respond within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
