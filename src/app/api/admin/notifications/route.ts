import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Notification } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/notifications — list recent notifications
export async function GET(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const filter = unreadOnly ? { read: false } : {};

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ read: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PATCH /api/admin/notifications — mark all as read
export async function PATCH(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { id } = body;

    if (id) {
      // Mark single notification as read
      await Notification.findByIdAndUpdate(id, { read: true });
    } else {
      // Mark all as read
      await Notification.updateMany({ read: false }, { read: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/notifications error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
