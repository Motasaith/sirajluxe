import { NextRequest } from "next/server";
import { getEmailHtml } from "@/lib/email-dummy";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type) {
    return new Response("Missing template type", { status: 400 });
  }

  const html = getEmailHtml(type);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
