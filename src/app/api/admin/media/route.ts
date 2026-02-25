import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import connectDB from "@/lib/mongodb";
import { Media } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/media — list all media
export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const media = await Media.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ docs: media });
  } catch (error) {
    console.error("GET /api/admin/media error:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST /api/admin/media — upload file to Vercel Blob
export async function POST(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    });

    // Save reference in MongoDB
    await connectDB();
    const media = await Media.create({
      filename: file.name,
      url: blob.url,
      type: file.type.startsWith("image/") ? "image" : "file",
      size: file.size,
      alt: file.name.replace(/\.[^/.]+$/, ""),
    });

    return NextResponse.json(
      { ...media.toObject(), id: media._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/media error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

// DELETE /api/admin/media
export async function DELETE(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
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
    console.error("DELETE /api/admin/media error:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
