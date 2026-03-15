import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { notFound } from "next/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const orderNumber = resolvedParams.order as string;

  if (!orderNumber) {
    notFound();
  }

  await connectDB();
  const order = await Order.findOne({ orderNumber }).lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-heading">
          Order Confirmed!
        </h1>
        
        <p className="text-[var(--muted)] text-base">
          Thank you for shopping with Siraj Luxe. Your order <strong className="text-neon-violet">{orderNumber}</strong> has been successfully placed.
        </p>

        <div className="p-6 rounded-2xl bg-[var(--elevated)] border border-[var(--border)] text-left space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-neon-violet" />
            </div>
            <div>
              <h3 className="font-semibold text-heading">Order Status</h3>
              <p className="text-sm text-[var(--dim)] mt-1">We&apos;ve received your order and are preparing it for shipment.</p>
            </div>
          </div>

          <div className="pt-2 text-sm text-[var(--muted)]">
            We&apos;ve sent a confirmation email to <strong className="text-[var(--body)]">{order.customerEmail}</strong> with your order details.
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="flex-1 px-6 py-3 rounded-xl bg-[var(--elevated)] border border-[var(--border)] hover:border-[var(--glass-border)] text-heading font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continue Shopping
          </Link>
          <Link
            href={`/orders/${order._id}?guest_email=${encodeURIComponent(order.customerEmail)}`}
            className="flex-1 px-6 py-3 rounded-xl bg-neon-violet text-white font-medium hover:bg-blue-500 shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all duration-200 flex items-center justify-center gap-2"
          >
            View Order <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
