import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models";
import { Webhook } from "svix";

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
      console.error("Clerk webhook verification failed:", err);
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 400 }
      );
    }
  } else {
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
        { clerkUserId: id },
        {
          clerkUserId: id,
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url || "",
        },
        { upsert: true, new: true }
      );
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      await Customer.findOneAndDelete({ clerkUserId: id });
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
