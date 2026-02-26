import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { SiteContent } from "@/lib/models";

// Force dynamic — never serve a stale build-time cache
export const dynamic = "force-dynamic";

// GET /api/site-content — public, fetches all CMS content
export async function GET() {
  try {
    await connectDB();
    const sections = await SiteContent.find().lean();
    return NextResponse.json(
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sections: sections.map((s: any) => ({
          key: s.key,
          data: s.data,
          enabled: s.enabled,
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/site-content error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ sections: [] });
  }
}
