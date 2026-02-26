import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BlogPost } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// Whitelist of allowed blog post fields
const BLOG_FIELDS = ["title", "slug", "content", "excerpt", "coverImage", "category", "tags", "published", "publishedAt", "author", "metaTitle", "metaDescription"] as const;

function pickBlogFields(body: Record<string, unknown>) {
  const picked: Record<string, unknown> = {};
  for (const key of BLOG_FIELDS) {
    if (body[key] !== undefined) picked[key] = body[key];
  }
  return picked;
}

// GET /api/admin/blog — list all blog posts (including drafts)
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const docs = await BlogPost.find()
      .sort({ createdAt: -1 })
      .select("-content")
      .lean();
    return NextResponse.json({ docs });
  } catch (error) {
    console.error("GET /api/admin/blog error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/admin/blog — create a new blog post
export async function POST(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    const post = await BlogPost.create(pickBlogFields(body));
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/blog error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
