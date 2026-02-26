import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Settings } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-logger";

// GET /api/admin/settings — get store settings (upsert default if not exists)
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    let settings = await Settings.findOne({ key: "global" }).lean();
    if (!settings) {
      settings = await Settings.create({ key: "global" });
      settings = settings.toObject();
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/admin/settings error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT /api/admin/settings — update store settings
export async function PUT(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();

    // Whitelist allowed fields
    const allowed: Record<string, unknown> = {};
    const stringFields = ["storeName", "storeEmail", "storePhone", "currency", "orderPrefix"];
    const numberFields = ["taxRate", "freeShippingThreshold", "shippingFlatRate", "lowStockThreshold"];

    for (const f of stringFields) {
      if (body[f] !== undefined) allowed[f] = String(body[f]);
    }
    for (const f of numberFields) {
      if (body[f] !== undefined) allowed[f] = Number(body[f]) || 0;
    }
    if (body.socialLinks && typeof body.socialLinks === "object") {
      allowed.socialLinks = {
        instagram: String(body.socialLinks.instagram || ""),
        twitter: String(body.socialLinks.twitter || ""),
        facebook: String(body.socialLinks.facebook || ""),
        tiktok: String(body.socialLinks.tiktok || ""),
      };
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "global" },
      allowed,
      { new: true, upsert: true }
    ).lean();

    await logActivity({
      action: "update",
      entity: "settings",
      details: `Updated settings: ${Object.keys(allowed).join(", ")}`,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
