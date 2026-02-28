import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models";
import { sendWelcomeEmail } from "@/lib/email";

// Clerk sends webhook events here when users are created/updated/deleted
export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // If no webhook secret, accept all events (dev mode)
  const body = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  let event;

  if (WEBHOOK_SECRET) {
    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      event = wh.verify(body, headers) as WebhookEvent;
    } catch (err) {
      console.error("Clerk webhook verification failed:", err instanceof Error ? err.message : "Unknown error");
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 400 }
      );
    }
  } else {
    // In production, webhook secret is required
    if (process.env.NODE_ENV === "production") {
      console.error("CLERK_WEBHOOK_SECRET is not set in production!");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
    event = JSON.parse(body) as WebhookEvent;
  }

  await connectDB();

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;

      const primaryEmail =
        email_addresses?.[0]?.email_address || "";

      await Customer.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url || "",
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Send welcome email only for new users
      if (event.type === "user.created" && primaryEmail) {
        try {
          await sendWelcomeEmail({
            to: primaryEmail,
            customerName: first_name || "",
          });
          console.log(`Welcome email sent to ${primaryEmail}`);
        } catch (emailErr) {
          console.error("Failed to send welcome email:", emailErr instanceof Error ? emailErr.message : "Unknown error");
        }
      }
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      await Customer.findOneAndDelete({ clerkId: id });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// Type for Clerk webhook events we handle
interface WebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}
