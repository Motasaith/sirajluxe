import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BlogPost } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

const BLOG_FIELDS = ["title", "slug", "content", "excerpt", "coverImage", "category", "tags", "published", "publishedAt", "author", "metaTitle", "metaDescription"] as const;

function pickBlogFields(body: Record<string, unknown>) {
  const picked: Record<string, unknown> = {};
  for (const key of BLOG_FIELDS) {
    if (body[key] !== undefined) picked[key] = body[key];
  }
  return picked;
}

// GET /api/admin/blog/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const post = await BlogPost.findById(params.id).lean();
    if (!post)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error("GET /api/admin/blog/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT /api/admin/blog/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    const post = await BlogPost.findByIdAndUpdate(params.id, pickBlogFields(body), {
      returnDocument: 'after',
    });
    if (!post)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error("PUT /api/admin/blog/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/admin/blog/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    await BlogPost.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/blog/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
