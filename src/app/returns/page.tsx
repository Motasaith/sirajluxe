import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Returns & Refunds | Siraj Luxe",
  description: "Siraj Luxe returns and refunds policy — 7-day returns for damaged or lost items.",
};

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-8">Returns &amp; Refunds</h1>
          <p className="text-sm text-subtle-fg mb-8">Last updated: February 2026</p>

          <div className="prose dark:prose-invert prose-sm max-w-none space-y-6 text-body">
            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">7-Day Return Policy</h2>
              <p>We offer a <strong>7-day return policy</strong> from the date of delivery. If your order arrives damaged, defective, or is lost in transit, you can request a return directly from your <a href="/orders" className="text-neon-violet hover:underline">order page</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Eligible Reasons</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Damaged on arrival</strong> — item arrived broken, torn, or visibly damaged</li>
                <li><strong>Item lost in transit</strong> — order marked as delivered but never received</li>
                <li><strong>Wrong item received</strong> — you received a different product than ordered</li>
                <li><strong>Item defective</strong> — product doesn&apos;t function as described</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">How to Request a Return</h2>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Go to <a href="/orders" className="text-neon-violet hover:underline">My Orders</a> and find the relevant order</li>
                <li>Click <strong>&ldquo;Request Return&rdquo;</strong> (available within 7 days of delivery)</li>
                <li>Select the reason and provide a brief description of the issue</li>
                <li>Our team will review your request within <strong>1-2 business days</strong></li>
                <li>Once approved, a full refund will be processed to your original payment method</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Refunds</h2>
              <p>Approved refunds are issued to the original payment method within <strong>5–10 business days</strong> depending on your bank or card issuer. Shipping costs are included in the refund for eligible returns.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Exchanges</h2>
              <p>We don&apos;t currently offer direct exchanges. If your return is approved, please place a new order for the replacement item.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-heading mb-3">Questions?</h2>
              <p>If you have any questions about returns or need assistance, please <a href="/contact" className="text-neon-violet hover:underline">contact our support team</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
