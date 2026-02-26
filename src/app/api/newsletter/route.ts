import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      // Fallback: just log it
      console.log("Newsletter signup (no Brevo key):", email);
      return NextResponse.json({ success: true });
    }

    // Add contact to Brevo
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [parseInt(process.env.BREVO_LIST_ID || "2")],
        updateEnabled: true,
      }),
    });

    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      // "Contact already exists" is fine
      if (data.code !== "duplicate_parameter") {
        console.error("Brevo API error:", typeof data === "object" ? JSON.stringify(data).slice(0, 200) : "Unknown");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
