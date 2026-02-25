import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Warranty Policy",
  description:
    "Siraj Luxe 2-year warranty policy — coverage, exclusions, and how to make a warranty claim.",
};

export default function WarrantyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-2">
            Warranty Policy
          </h1>
          <p className="text-sm text-muted-fg mb-10">Last updated: February 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-body">
            <section>
              <h2 className="text-xl font-bold text-heading mb-3">2-Year Warranty</h2>
              <p>
                All products sold on Siraj Luxe come with a 2-year warranty from the date of purchase, covering manufacturing defects in materials and workmanship under normal use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">What&apos;s Covered</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Manufacturing defects in materials or workmanship</li>
                <li>Faulty stitching, hardware, or construction</li>
                <li>Premature deterioration under normal use</li>
                <li>Electronic malfunctions in tech products (within warranty period)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">What&apos;s Not Covered</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Normal wear and tear</li>
                <li>Damage caused by misuse, negligence, or accidents</li>
                <li>Alterations or modifications made to the product</li>
                <li>Damage from improper cleaning or maintenance</li>
                <li>Cosmetic damage (scratches, dents) that doesn&apos;t affect functionality</li>
                <li>Products purchased from unauthorised resellers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">How to Make a Warranty Claim</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Email us at{" "}
                  <a href="mailto:support@sirajluxe.com" className="text-neon-violet hover:underline">
                    support@sirajluxe.com
                  </a>{" "}
                  with your order number and a description of the defect.
                </li>
                <li>Include clear photos showing the issue.</li>
                <li>Our team will review your claim within 3 business days.</li>
                <li>If approved, we&apos;ll provide instructions for returning the product.</li>
                <li>
                  Once received and inspected, we&apos;ll either repair, replace, or refund the product at our discretion.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Resolution Options</h2>
              <p>
                If your warranty claim is approved, we may at our sole discretion:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-heading">Repair</strong> the product at no cost</li>
                <li><strong className="text-heading">Replace</strong> the product with an identical or equivalent item</li>
                <li><strong className="text-heading">Refund</strong> the purchase price if repair or replacement is not possible</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Important Notes</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>The warranty is non-transferable and applies only to the original purchaser.</li>
                <li>Proof of purchase (order confirmation email or order number) is required for all claims.</li>
                <li>This warranty is in addition to your statutory rights under UK consumer law.</li>
                <li>The 30-day return policy and the 2-year warranty are separate — you can use either as applicable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-3">Contact</h2>
              <p>
                For warranty enquiries, email us at{" "}
                <a href="mailto:support@sirajluxe.com" className="text-neon-violet hover:underline">
                  support@sirajluxe.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
