import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Newspaper, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Press & Media",
  description:
    "Siraj Luxe press and media page — media enquiries, brand assets, and company information for journalists and partners.",
};

export default function PressPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          {/* Hero */}
          <div className="mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--border)] text-xs font-medium text-neon-violet uppercase tracking-widest mb-4">
              Press
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              Press & Media
            </h1>
            <p className="text-muted-fg max-w-xl">
              For media enquiries, partnership opportunities, and brand assets.
            </p>
          </div>

          <div className="prose dark:prose-invert prose-sm max-w-none space-y-10 text-body">
            {/* About */}
            <section>
              <h2 className="text-xl font-bold text-heading mb-3">About Siraj Luxe</h2>
              <p>
                Founded in 2025, Siraj Luxe is a UK-based premium e-commerce store offering curated products across footwear, watches, audio, apparel, tech, and accessories. Our mission is to make online shopping feel as exciting as discovering a product in person.
              </p>
              <p>
                &quot;Siraj Luxe&quot; means &quot;Beacon of Premium Goods&quot; — we aim to be a guiding light for customers seeking quality, authenticity, and a premium shopping experience.
              </p>
            </section>

            {/* Key Facts */}
            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Key Facts</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Founded", "2025"],
                  ["Headquarters", "United Kingdom"],
                  ["Markets", "UK (expanding)"],
                  ["Categories", "6+ product categories"],
                  ["Currency", "GBP (£)"],
                  ["Website", "sirajluxe.com"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--overlay)] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-fg mb-1">{label}</p>
                    <p className="text-heading font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Media Contact */}
            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Media Enquiries</h2>
              <p>
                For press and media enquiries, please contact us at:
              </p>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-6 flex items-start gap-4">
                <Newspaper className="w-6 h-6 text-neon-violet flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-heading font-medium">Press Contact</p>
                  <a href="mailto:binacodesecommercestore@gmail.com?subject=Media%20Enquiry" className="text-neon-violet hover:underline text-sm">
                    binacodesecommercestore@gmail.com
                  </a>
                  <p className="text-xs text-muted-fg mt-1">
                    Please include &quot;Media Enquiry&quot; in the subject line. We respond within 48 hours.
                  </p>
                </div>
              </div>
            </section>

            {/* Brand Guidelines */}
            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Brand Guidelines</h2>
              <p>When referencing Siraj Luxe in publications, please note:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-heading">Name:</strong> Always written as &quot;Siraj Luxe&quot; (two words, both capitalised). Never &quot;SirajLuxe&quot;, &quot;SIRAJ LUXE&quot;, or &quot;siraj luxe&quot;.</li>
                <li><strong className="text-heading">Tagline:</strong> &quot;Beacon of Premium Goods&quot;</li>
                <li><strong className="text-heading">Description:</strong> &quot;UK-based premium e-commerce store offering curated products.&quot;</li>
                <li><strong className="text-heading">Website:</strong> sirajluxe.com</li>
              </ul>
            </section>

            {/* In The Press */}
            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Press Coverage</h2>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-8 text-center">
                <p className="text-muted-fg text-sm">
                  No press mentions yet. Be the first to feature Siraj Luxe!
                </p>
                <a
                  href="mailto:binacodesecommercestore@gmail.com?subject=Media%20Enquiry"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get in Touch
                </a>
              </div>
            </section>
          </div>

          {/* Learn More */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-fg">
              Learn more{" "}
              <Link href="/about" className="text-neon-violet hover:underline">about us</Link>
              {" "}or explore our{" "}
              <Link href="/blog" className="text-neon-violet hover:underline">blog</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
