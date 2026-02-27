import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Terms of Service | Siraj Luxe",
  description: "Siraj Luxe terms of service — conditions for using our e-commerce store.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-8">Terms of Service</h1>
          <p className="text-sm text-subtle-fg mb-8">Last updated: February 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-body">
            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">1. General</h2>
              <p>By using Siraj Luxe (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you agree to these terms of service. If you do not agree, please do not use our website or services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">2. Accounts</h2>
              <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">3. Orders & Pricing</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>All prices are displayed in British Pounds (£) and include VAT where applicable.</li>
                <li>We reserve the right to change prices at any time without notice.</li>
                <li>An order is confirmed once payment is successfully processed via Stripe.</li>
                <li>We reserve the right to cancel orders if products are out of stock or if fraud is suspected.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">4. Shipping</h2>
              <p>We currently ship to UK addresses only. Standard delivery takes 3–5 business days. Shipping costs £3.99 unless you qualify for our free shipping promotion (free on your first order, or spend £10 or more on subsequent orders).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">5. Returns & Refunds</h2>
              <p>You may return items within 30 days of delivery for a full refund, provided items are unused and in original packaging. See our <a href="/returns" className="text-neon-violet hover:underline">Returns Policy</a> for full details.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">6. Intellectual Property</h2>
              <p>All content on this website — including text, images, logos, and design — is owned by Siraj Luxe and protected by copyright law.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">7. Limitation of Liability</h2>
              <p>Siraj Luxe is not liable for any indirect, incidental, or consequential damages arising from the use of our website or products, to the fullest extent permitted by law.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">8. Governing Law</h2>
              <p>These terms are governed by the laws of England and Wales.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">9. Contact</h2>
              <p>If you have any questions about these terms, email us at <a href="mailto:support@sirajluxe.com" className="text-neon-violet hover:underline">support@sirajluxe.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
