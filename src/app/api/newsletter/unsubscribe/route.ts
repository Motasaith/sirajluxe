import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIP } from "@/lib/rate-limit";

/**
 * GET /api/newsletter/unsubscribe?email=...
 * GDPR-compliant one-click unsubscribe.
 * Removes the contact from the Brevo newsletter list.
 */
export async function GET(req: NextRequest) {
  const ip = getIP(req);
  const rl = rateLimit(`unsub:${ip}`, { limit: 10, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new NextResponse(unsubPage("Invalid email address.", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const listId = parseInt(process.env.BREVO_LIST_ID || "2");

  if (!BREVO_API_KEY) {
    console.log("Newsletter unsubscribe (no Brevo key):", email);
    return new NextResponse(unsubPage("You have been unsubscribed.", true), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    // Remove contact from the newsletter list via Brevo API
    const res = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`,
      {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails: [email] }),
      }
    );

    if (!res.ok && res.status !== 404) {
      const data = await res.json().catch(() => ({}));
      console.error("Brevo unsubscribe error:", typeof data === "object" ? JSON.stringify(data).slice(0, 200) : "Unknown");
    }

    return new NextResponse(unsubPage("You have been unsubscribed successfully.", true), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error(
      "Newsletter unsubscribe error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return new NextResponse(
      unsubPage("Something went wrong. Please try again later.", false),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

function unsubPage(message: string, success: boolean) {
  const color = success ? "#10b981" : "#ef4444";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? "Unsubscribed" : "Error"} | Siraj Luxe</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0f; font-family: system-ui, sans-serif; color: #e1e2e6; }
    .card { text-align: center; max-width: 26rem; padding: 2rem; }
    .icon { width: 4rem; height: 4rem; border-radius: 50%; background: ${color}1a; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .icon svg { width: 2rem; height: 2rem; color: ${color}; }
    h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }
    p { color: #9ca3af; line-height: 1.6; margin: 0 0 1.5rem; }
    a { display: inline-block; padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border-radius: 0.75rem; text-decoration: none; font-weight: 500; }
    a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${success
          ? '<polyline points="20 6 9 17 4 12"/>'
          : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
        }
      </svg>
    </div>
    <h1>${success ? "Unsubscribed" : "Oops"}</h1>
    <p>${message}</p>
    <a href="/">Return to Siraj Luxe</a>
  </div>
</body>
</html>`;
}
