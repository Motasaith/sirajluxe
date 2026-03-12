import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BlogPost } from "@/lib/models";

// GET /api/cron/publish-scheduled
// Called by Vercel Cron every 5 minutes to publish posts whose scheduledAt has passed.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const now = new Date();
    const result = await BlogPost.updateMany(
      {
        published: false,
        scheduledAt: { $ne: null, $lte: now },
      },
      {
        $set: { published: true, publishedAt: now },
      }
    );
    return NextResponse.json({ published: result.modifiedCount });
  } catch (error) {
    console.error("Cron publish-scheduled error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
