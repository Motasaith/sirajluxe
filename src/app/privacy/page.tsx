import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Privacy Policy | BinaCodes",
  description: "BinaCodes privacy policy — how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-8">Privacy Policy</h1>
          <p className="text-sm text-subtle-fg mb-8">Last updated: February 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-body">
            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">1. Information We Collect</h2>
              <p>When you use BinaCodes, we collect information you provide directly:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and email address when you create an account</li>
                <li>Shipping address when you place an order</li>
                <li>Payment information (processed securely by Stripe — we never store card details)</li>
                <li>Order history and preferences</li>
              </ul>
              <p className="mt-3">We also collect certain data automatically:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Browser type, device information, and IP address</li>
                <li>Pages visited and interactions via PostHog analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To process and fulfil your orders</li>
                <li>To send order confirmations and shipping updates</li>
                <li>To provide customer support</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">3. Data Sharing</h2>
              <p>We share your data only with trusted third-party services necessary to operate our business:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Stripe</strong> — payment processing</li>
                <li><strong>Clerk</strong> — authentication</li>
                <li><strong>Vercel</strong> — hosting</li>
                <li><strong>PostHog</strong> — anonymous analytics</li>
              </ul>
              <p className="mt-3">We never sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">4. Your Rights (UK GDPR)</h2>
              <p>Under UK data protection law, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing</li>
                <li>Data portability</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, contact us at support@binacodes.com.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">5. Data Retention</h2>
              <p>We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Order records are kept for a minimum of 6 years for tax purposes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">6. Contact</h2>
              <p>For any privacy-related queries, email us at <a href="mailto:support@binacodes.com" className="text-neon-violet hover:underline">support@binacodes.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
