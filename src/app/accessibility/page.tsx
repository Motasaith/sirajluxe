import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Siraj Luxe accessibility statement — our commitment to making our website accessible to everyone.",
};

export default function AccessibilityPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-2">
            Accessibility Statement
          </h1>
          <p className="text-sm text-muted-fg mb-10">Last updated: February 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-body">
            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Our Commitment</h2>
              <p>
                Siraj Luxe is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Standards</h2>
              <p>
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities, and more user-friendly for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">What We&apos;re Doing</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Using semantic HTML for proper page structure and navigation</li>
                <li>Providing text alternatives for images and media content</li>
                <li>Ensuring sufficient colour contrast throughout the site</li>
                <li>Making all interactive elements keyboard accessible</li>
                <li>Using clear, readable fonts at appropriate sizes</li>
                <li>Implementing responsive design for all screen sizes</li>
                <li>Providing descriptive link text and button labels</li>
                <li>Testing with screen readers and assistive technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Known Limitations</h2>
              <p>
                While we strive for full accessibility, some areas may have limitations:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Some third-party content (payment forms, authentication) may have varying accessibility levels</li>
                <li>Certain rich interactive elements may have limited screen reader support</li>
                <li>Older content may not yet meet all accessibility standards</li>
              </ul>
              <p>
                We are actively working to resolve these issues.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Assistive Technology Compatibility</h2>
              <p>
                Our website is designed to be compatible with:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Modern screen readers (NVDA, JAWS, VoiceOver)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Feedback</h2>
              <p>
                We welcome your feedback on the accessibility of Siraj Luxe. If you encounter accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Email:{" "}
                  <a href="mailto:support@sirajluxe.com" className="text-neon-violet hover:underline">
                    support@sirajluxe.com
                  </a>
                </li>
                <li>Subject line: &quot;Accessibility Feedback&quot;</li>
              </ul>
              <p>
                We aim to respond to accessibility feedback within 5 business days.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
