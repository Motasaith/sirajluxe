import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Cart } from "@/lib/models";
import { sendAbandonedCartEmail } from "@/lib/email";

// Vercel Cron: runs every hour to send abandoned cart emails
// Protected by CRON_SECRET to prevent unauthorized access
export async function GET(req: NextRequest) {
  const requestSecret = req.headers.get("x-cron-secret");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !requestSecret || requestSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Find carts that:
  // 1. Have items
  // 2. Haven't had an abandoned email sent yet
  // 3. Were last updated 1-48 hours ago (not too recent, not too old)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const abandonedCarts = await Cart.find({
    "items.0": { $exists: true },
    abandonedEmailSent: false,
    email: { $ne: "" },
    updatedAt: { $gte: twoDaysAgo, $lte: oneHourAgo },
  }).limit(50);

  let sent = 0;
  let failed = 0;

  for (const cart of abandonedCarts) {
    try {
      await sendAbandonedCartEmail({
        to: cart.email!,
        customerName: cart.email!.split("@")[0],
        items: cart.items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          color: i.color,
          size: i.size,
        })),
      });

      await Cart.findByIdAndUpdate(cart._id, { abandonedEmailSent: true });
      sent++;
    } catch (err) {
      console.error(
        `Failed to send abandoned cart email to ${cart.email}:`,
        err instanceof Error ? err.message : "Unknown"
      );
      failed++;
    }
  }

  console.log(`Abandoned cart cron: ${sent} emails sent, ${failed} failed, ${abandonedCarts.length} total processed`);

  return NextResponse.json({
    processed: abandonedCarts.length,
    sent,
    failed,
  });
}
