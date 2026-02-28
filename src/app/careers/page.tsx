import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Rocket, Heart, Globe, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at Siraj Luxe",
  description:
    "Join the Siraj Luxe team — explore open positions and help us build the future of premium e-commerce.",
};

const values = [
  {
    icon: Rocket,
    title: "Innovation First",
    description:
      "We push boundaries with immersive shopping experiences. Every team member drives our innovation forward.",
  },
  {
    icon: Heart,
    title: "Customer Obsessed",
    description:
      "Everything we build starts with the customer. We obsess over creating delightful experiences.",
  },
  {
    icon: Globe,
    title: "Inclusive & Remote-Friendly",
    description:
      "Based in the UK, open to remote work. We value diverse perspectives and flexible working.",
  },
  {
    icon: Zap,
    title: "Move Fast, Stay Premium",
    description:
      "We ship quickly without compromising on quality. Speed and excellence go hand in hand.",
  },
];

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--border)] text-xs font-medium text-neon-violet uppercase tracking-widest mb-4">
              Careers
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              Help us build the future of shopping
            </h1>
            <p className="text-muted-fg max-w-xl mx-auto">
              We&apos;re a small, passionate team building a premium e-commerce experience from the ground up. Join us and make an impact from day one.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-6"
              >
                <v.icon className="w-8 h-8 text-neon-violet mb-3" />
                <h3 className="text-heading font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-fg">{v.description}</p>
              </div>
            ))}
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-heading mb-6">Open Positions</h2>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-12 text-center">
              <p className="text-heading font-medium mb-2">
                No open positions right now
              </p>
              <p className="text-sm text-muted-fg mb-6 max-w-md mx-auto">
                We don&apos;t have any open roles at the moment, but we&apos;re always interested in hearing from talented people. Send us your CV and a short note about why you&apos;d be a great fit.
              </p>
              <a
                href="mailto:binacodesecommercestore@gmail.com?subject=Career%20Enquiry"
                className="inline-flex px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
              >
                Send Your CV
              </a>
            </div>
          </div>

          {/* Perks */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-8">
            <h2 className="text-xl font-bold text-heading mb-6">Why Work With Us</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                "Flexible remote working",
                "Competitive compensation",
                "Staff discount on all products",
                "Latest tools and equipment",
                "Professional development budget",
                "Small team, big impact",
                "Creative freedom",
                "Inclusive culture",
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-violet flex-shrink-0" />
                  {perk}
                </div>
              ))}
            </div>
          </div>

          {/* About Link */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-fg">
              Want to learn more about us?{" "}
              <Link href="/about" className="text-neon-violet hover:underline">
                Read our story
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
