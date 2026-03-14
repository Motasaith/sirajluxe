import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-auth";
import { sendTestEmail } from "@/lib/email-dummy";

export async function POST(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { type, email } = await req.json();

    if (!type || !email) {
      return NextResponse.json({ error: "Missing type or email" }, { status: 400 });
    }

    await sendTestEmail(type, email);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Test email error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
