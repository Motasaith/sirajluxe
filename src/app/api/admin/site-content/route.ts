import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import { SiteContent } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/site-content — all content including disabled
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const sections = await SiteContent.find().sort({ key: 1 }).lean();
    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sections: sections.map((s: any) => ({
        key: s.key,
        data: s.data,
        enabled: s.enabled,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/site-content error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/site-content — upsert a section by key
export async function PUT(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const { key, data, enabled } = await req.json();
    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    const section = await SiteContent.findOneAndUpdate(
      { key },
      { data, enabled: enabled !== false },
      { upsert: true, new: true }
    );

    // Purge all caches so visitors see the update immediately
    revalidatePath("/api/site-content");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/faq");
    revalidatePath("/shop");
    revalidatePath("/collections");

    return NextResponse.json({ section });
  } catch (error) {
    console.error("PUT /api/admin/site-content error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/site-content — reset a section to defaults
export async function DELETE(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const { key } = await req.json();
    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    await SiteContent.deleteOne({ key });

    // Purge all caches
    revalidatePath("/api/site-content");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/faq");
    revalidatePath("/shop");
    revalidatePath("/collections");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/site-content error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to reset content" },
      { status: 500 }
    );
  }
}
