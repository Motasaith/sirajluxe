import { NextRequest, NextResponse } from "next/server";
import { put, del, getDownloadUrl } from "@vercel/blob";
import connectDB from "@/lib/mongodb";
import { Media } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { sanitizeFilename, hasAllowedExtension } from "@/lib/validation";

// GET /api/admin/media — list all media
export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const media = await Media.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ docs: media });
  } catch (error) {
    console.error("GET /api/admin/media error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST /api/admin/media — upload file to Vercel Blob
export async function POST(req: NextRequest) {
  const denied = await adminGuard("admin"); if (denied) return denied;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type — SVG blocked (stored XSS risk via embedded scripts)
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, GIF.` },
        { status: 400 }
      );
    }

    // Validate file extension (defense-in-depth — don't trust file.type alone)
    if (!hasAllowedExtension(file.name)) {
      return NextResponse.json(
        { error: "Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp, .gif" },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent path traversal & XSS in admin UI
    const safeName = sanitizeFilename(file.name);

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 10MB.` },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    let blob;
    try {
      blob = await put(safeName, file, { access: "public" });
    } catch {
      blob = await put(safeName, file, { access: "private" });
    }

    // For private blobs, generate a long-lived download URL
    let publicUrl = blob.url;
    if (blob.url && !blob.url.includes(".public.blob.")) {
      try {
        publicUrl = await getDownloadUrl(blob.url);
      } catch {
        // Fall back to raw URL
      }
    }

    // Save reference in MongoDB
    await connectDB();
    const media = await Media.create({
      filename: safeName,
      url: publicUrl,
      type: file.type.startsWith("image/") ? "image" : "file",
      size: file.size,
      alt: safeName.replace(/\.[^/.]+$/, ""),
    });

    return NextResponse.json(
      { ...media.toObject(), id: media._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/media error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

// PUT /api/admin/media — update alt text
export async function PUT(req: NextRequest) {
  const denied = await adminGuard("admin"); if (denied) return denied;
  try {
    await connectDB();
    const { id, alt } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const doc = await Media.findByIdAndUpdate(id, { alt: alt || "" }, { returnDocument: 'after' });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    console.error("PUT /api/admin/media error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

// DELETE /api/admin/media
export async function DELETE(req: NextRequest) {
  const denied = await adminGuard("admin"); if (denied) return denied;
  try {
    const { id, url } = await req.json();

    // Delete from Vercel Blob
    if (url) {
      try {
        await del(url);
      } catch {
        // Blob may already be deleted
      }
    }

    // Delete from MongoDB
    await connectDB();
    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/media error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
