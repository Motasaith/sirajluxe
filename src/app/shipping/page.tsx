import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Shipping Information | Siraj Luxe",
  description: "Siraj Luxe shipping policy — UK delivery, shipping rates, and free shipping promotion.",
};

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-8">Shipping Information</h1>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-body">
            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Delivery Areas</h2>
              <p>We currently deliver exclusively to UK addresses. International shipping is not yet available.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Shipping Rates</h2>
              <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[var(--overlay)]">
                    <tr>
                      <th className="px-4 py-3 text-heading font-medium">Method</th>
                      <th className="px-4 py-3 text-heading font-medium">Cost</th>
                      <th className="px-4 py-3 text-heading font-medium">Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-3">Standard Delivery</td>
                      <td className="px-4 py-3">£3.99</td>
                      <td className="px-4 py-3">3–5 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="glass-card p-6">
              <h2 className="text-xl font-semibold text-heading mb-3">🎉 Free Shipping Promotion</h2>
              <p className="text-lg"><strong>Your first order ships FREE</strong> — no minimum spend! After that, <strong>spend £10 or more</strong> for <span className="text-neon-violet font-semibold">FREE shipping</span>.</p>
              <p className="text-sm text-muted-fg mt-2">This offer applies automatically at checkout for new customers.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Order Processing</h2>
              <p>Orders placed before 2pm on business days are dispatched the same day. Orders placed after 2pm or on weekends/bank holidays will be dispatched the next business day.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Tracking</h2>
              <p>Once your order is dispatched, you&apos;ll receive tracking information via email. You can also check your order status on your <a href="/orders" className="text-neon-violet hover:underline">Orders page</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Issues with Delivery?</h2>
              <p>If your order hasn&apos;t arrived within the estimated timeframe, please contact us at <a href="mailto:support@sirajluxe.com" className="text-neon-violet hover:underline">support@sirajluxe.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
