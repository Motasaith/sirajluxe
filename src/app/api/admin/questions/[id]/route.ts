import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Question } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { isValidObjectId } from "@/lib/validation";

// PATCH /api/admin/questions/[id] — answer or moderate a question
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const updateFields: Record<string, unknown> = {};

    if (body.answer !== undefined) {
      if (typeof body.answer !== "string" || body.answer.length > 1000) {
        return NextResponse.json({ error: "Answer must be under 1000 characters" }, { status: 400 });
      }
      updateFields.answer = body.answer.trim();
      updateFields.answeredAt = new Date();
    }

    if (body.isPublished !== undefined) {
      updateFields.isPublished = Boolean(body.isPublished);
    }

    const question = await Question.findByIdAndUpdate(id, updateFields, { returnDocument: 'after' }).lean();
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("PATCH /api/admin/questions/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

// DELETE /api/admin/questions/[id] — delete a question
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    await connectDB();
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Question deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/questions/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
