import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Question } from "@/lib/models";
import { isValidObjectId } from "@/lib/validation";

// GET /api/questions?productId=xxx — get questions for a product
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId || !isValidObjectId(productId)) {
      return NextResponse.json({ error: "Valid productId required" }, { status: 400 });
    }

    const questions = await Question.find({
      productId,
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      questions: questions.map((q) => ({
        id: q._id.toString(),
        userName: q.userName,
        question: q.question,
        answer: q.answer || null,
        answeredAt: q.answeredAt || null,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/questions error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

// POST /api/questions — ask a question
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to ask a question" }, { status: 401 });
    }

    const user = await currentUser();
    const body = await req.json();
    const { productId, question } = body;

    if (!productId || !isValidObjectId(productId)) {
      return NextResponse.json({ error: "Valid productId required" }, { status: 400 });
    }

    if (!question || typeof question !== "string" || question.trim().length < 5) {
      return NextResponse.json({ error: "Question must be at least 5 characters" }, { status: 400 });
    }

    if (question.length > 500) {
      return NextResponse.json({ error: "Question must be under 500 characters" }, { status: 400 });
    }

    await connectDB();

    // Rate limit: max 3 questions per product per user per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await Question.countDocuments({
      productId,
      clerkUserId: userId,
      createdAt: { $gte: oneDayAgo },
    });
    if (recentCount >= 3) {
      return NextResponse.json({ error: "You can ask up to 3 questions per product per day" }, { status: 429 });
    }

    const newQuestion = await Question.create({
      productId,
      clerkUserId: userId,
      userName: user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Customer",
      question: question.trim(),
    });

    return NextResponse.json({
      id: newQuestion._id.toString(),
      message: "Question submitted successfully",
    });
  } catch (error) {
    console.error("POST /api/questions error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to submit question" }, { status: 500 });
  }
}
