import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { adminGuard } from "@/lib/admin-auth";
import { Order, Product, Customer, Review } from "@/lib/models";

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const escapeCsv = (value: unknown) => {
    const str = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const headerLine = headers.join(",");
  const body = rows
    .map((row) => headers.map((h) => escapeCsv(row[h])).join(","))
    .join("\n");
  return `${headerLine}\n${body}`;
}

export async function GET(req: NextRequest) {
  const denied = await adminGuard("admin");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "orders").toLowerCase();
  const format = (searchParams.get("format") || "json").toLowerCase();

  const modelMap: Record<string, { find: () => Promise<Record<string, unknown>[]>; filename: string }> = {
    orders: {
      find: async () => (await Order.find().sort({ createdAt: -1 }).lean()) as unknown as Record<string, unknown>[],
      filename: "orders",
    },
    products: {
      find: async () => (await Product.find().sort({ createdAt: -1 }).lean()) as unknown as Record<string, unknown>[],
      filename: "products",
    },
    customers: {
      find: async () => (await Customer.find().sort({ createdAt: -1 }).lean()) as unknown as Record<string, unknown>[],
      filename: "customers",
    },
    reviews: {
      find: async () => (await Review.find().sort({ createdAt: -1 }).lean()) as unknown as Record<string, unknown>[],
      filename: "reviews",
    },
  };

  if (!modelMap[type]) {
    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  }

  try {
    await connectDB();
    const rows = await modelMap[type].find();

    if (format === "csv") {
      const csv = toCsv(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=\"${modelMap[type].filename}-export.csv\"`,
        },
      });
    }

    return new NextResponse(JSON.stringify(rows, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${modelMap[type].filename}-export.json\"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/export error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
