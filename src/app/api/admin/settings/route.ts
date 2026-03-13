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
  const denied = await adminGuard("super_admin");
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();

    // Whitelist allowed fields
    const allowed: Record<string, unknown> = {};
    const stringFields = ["storeName", "storeEmail", "storePhone", "currency", "orderPrefix"];
    const numberFields = ["taxRate", "freeShippingThreshold", "shippingFlatRate", "lowStockThreshold"];
    const booleanFields = ["enableStripeTax"];

    for (const f of stringFields) {
      if (body[f] !== undefined) allowed[f] = String(body[f]);
    }
    for (const f of numberFields) {
      if (body[f] !== undefined) allowed[f] = Number(body[f]) || 0;
    }
    for (const f of booleanFields) {
      if (body[f] !== undefined) allowed[f] = Boolean(body[f]);
    }
    if (body.socialLinks && typeof body.socialLinks === "object") {
      allowed.socialLinks = {
        instagram: String(body.socialLinks.instagram || ""),
        twitter: String(body.socialLinks.twitter || ""),
        facebook: String(body.socialLinks.facebook || ""),
        tiktok: String(body.socialLinks.tiktok || ""),
      };
    }
    if (Array.isArray(body.shippingZones)) {
      allowed.shippingZones = body.shippingZones
        .filter((z: unknown) => z && typeof z === "object")
        .slice(0, 20) // cap at 20 zones
        .map((z: Record<string, unknown>) => ({
          name: String(z.name || "").slice(0, 100),
          countries: Array.isArray(z.countries)
            ? z.countries.filter((c: unknown) => typeof c === "string").map((c: string) => c.toUpperCase().slice(0, 2)).slice(0, 50)
            : [],
          rate: Math.max(0, Number(z.rate) || 0),
          minOrderFree: Math.max(0, Number(z.minOrderFree) || 0),
          weightTiers: Array.isArray(z.weightTiers)
            ? z.weightTiers
              .filter((t: unknown) => t && typeof t === "object")
              .slice(0, 10)
              .map((t: Record<string, unknown>) => ({
                maxWeight: Math.max(0, Number(t.maxWeight) || 0),
                rate: Math.max(0, Number(t.rate) || 0),
              }))
            : [],
        }));
    }
    if (Array.isArray(body.taxRules)) {
      allowed.taxRules = body.taxRules
        .filter((r: unknown) => r && typeof r === "object")
        .slice(0, 50)
        .map((r: Record<string, unknown>) => ({
          country: String(r.country || "").toUpperCase().slice(0, 2),
          rate: Math.max(0, Math.min(100, Number(r.rate) || 0)),
          name: String(r.name || "").slice(0, 100),
        }))
        .filter((r: { country: string; name: string }) => r.country && r.name);
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "global" },
      allowed,
      { returnDocument: 'after', upsert: true }
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
