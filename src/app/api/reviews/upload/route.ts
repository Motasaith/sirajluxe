import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { sanitizeFilename, hasAllowedExtension } from "@/lib/validation";
import { rateLimit, getIP } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

// POST /api/reviews/upload — upload a review photo (signed-in users only)
export async function POST(req: NextRequest) {
  // Rate limit: 20 uploads per minute per IP
  const { allowed } = rateLimit(`review-upload:${getIP(req)}`, { limit: 20, windowSec: 60 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to upload review photos" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF." },
        { status: 400 }
      );
    }

    if (!hasAllowedExtension(file.name)) {
      return NextResponse.json(
        { error: "Invalid file extension." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 8 MB." }, { status: 400 });
    }

    const safeName = sanitizeFilename(file.name);
    const blob = await put(`reviews/${userId}/${Date.now()}-${safeName}`, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("POST /api/reviews/upload error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
