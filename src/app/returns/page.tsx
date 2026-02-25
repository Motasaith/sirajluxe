import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Returns & Refunds | Siraj Luxe",
  description: "Siraj Luxe returns and refunds policy — 30-day hassle-free returns.",
};

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-8">Returns &amp; Refunds</h1>
          <p className="text-sm text-subtle-fg mb-8">Last updated: February 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-body">
            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">30-Day Returns</h2>
              <p>We offer a 30-day return policy on all items. If you&apos;re not completely satisfied with your purchase, you can return it within 30 days of delivery for a full refund.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Conditions</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Items must be unused and in their original packaging</li>
                <li>Items must not be damaged or altered</li>
                <li>Sale items are eligible for returns</li>
                <li>Proof of purchase is required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">How to Return</h2>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Email us at <a href="mailto:support@sirajluxe.com" className="text-neon-violet hover:underline">support@sirajluxe.com</a> with your order number</li>
                <li>We&apos;ll send you a return shipping label</li>
                <li>Pack the item and send it back to us</li>
                <li>Once received and inspected, your refund will be processed within 5–10 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Refunds</h2>
              <p>Refunds are issued to the original payment method. Shipping costs are non-refundable unless the return is due to our error.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Exchanges</h2>
              <p>We don&apos;t currently offer direct exchanges. Please return the item and place a new order.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
