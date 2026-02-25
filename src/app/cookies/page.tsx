import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Cookie Policy | BinaCodes",
  description: "BinaCodes cookie policy — how and why we use cookies.",
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-8">Cookie Policy</h1>
          <p className="text-sm text-subtle-fg mb-8">Last updated: February 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-body">
            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">What Are Cookies?</h2>
              <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Cookies We Use</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies</strong> — Required for authentication (Clerk) and core site functionality. Cannot be disabled.</li>
                <li><strong>Analytics Cookies</strong> — PostHog analytics to understand how visitors use our site. Data is anonymised.</li>
                <li><strong>Cart Cookies</strong> — Local storage to remember your shopping cart between sessions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Managing Cookies</h2>
              <p>You can control cookies through your browser settings. Disabling certain cookies may affect site functionality.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Contact</h2>
              <p>Questions? Email <a href="mailto:support@binacodes.com" className="text-neon-violet hover:underline">support@binacodes.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
