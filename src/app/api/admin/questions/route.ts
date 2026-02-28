import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Question } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/questions — list all questions (admin)
export async function GET(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "unanswered";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (filter === "unanswered") {
      query.$or = [{ answer: "" }, { answer: { $exists: false } }];
    } else if (filter === "answered") {
      query.answer = { $nin: ["", null], $exists: true };
    }

    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      Question.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Question.countDocuments(query),
    ]);

    return NextResponse.json({
      questions: questions.map((q) => ({
        ...q,
        id: q._id.toString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/questions error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
