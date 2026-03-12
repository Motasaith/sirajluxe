import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-logger";

interface CsvRow {
  name?: string;
  slug?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  category?: string;
  tags?: string;
  inStock?: string;
  featured?: string;
  image?: string;
  images?: string;
  colors?: string;
  sizes?: string;
  sku?: string;
  inventory?: string;
  metaTitle?: string;
  metaDescription?: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseRow(headerLine).map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || "").trim();
    });
    rows.push(row as CsvRow);
  }
  return rows;
}

/** Parse a single CSV row, handling quoted fields with commas */
function parseRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

function toBool(val: string | undefined): boolean {
  if (!val) return false;
  return ["true", "yes", "1"].includes(val.toLowerCase());
}

function toFloat(val: string | undefined): number {
  const n = parseFloat(val || "");
  return isNaN(n) ? 0 : n;
}

function toInt(val: string | undefined): number {
  const n = parseInt(val || "", 10);
  return isNaN(n) ? 0 : n;
}

function splitPipe(val: string | undefined): string[] {
  if (!val) return [];
  return val
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

// POST /api/admin/products/import — bulk import products from CSV
export async function POST(req: NextRequest) {
  const denied = await adminGuard("admin");
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Please upload a .csv file" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json({ error: "Maximum 500 products per import" }, { status: 400 });
    }

    await connectDB();

    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed, +1 for header row

      if (!row.name?.trim()) {
        results.errors.push(`Row ${rowNum}: Missing required field "name"`);
        continue;
      }

      const price = toFloat(row.price);
      if (price <= 0) {
        results.errors.push(`Row ${rowNum}: Invalid price for "${row.name}"`);
        continue;
      }

      if (!row.category?.trim()) {
        results.errors.push(`Row ${rowNum}: Missing required field "category" for "${row.name}"`);
        continue;
      }

      const productData = {
        name: row.name.trim(),
        slug: row.slug?.trim() || undefined, // let pre-validate hook generate if empty
        description: row.description?.trim() || "",
        price,
        originalPrice: row.originalPrice ? toFloat(row.originalPrice) : undefined,
        category: row.category.trim(),
        tags: splitPipe(row.tags),
        inStock: row.inStock ? toBool(row.inStock) : true,
        featured: toBool(row.featured),
        image: row.image?.trim() || "",
        images: splitPipe(row.images),
        colors: splitPipe(row.colors),
        sizes: splitPipe(row.sizes),
        sku: row.sku?.trim() || "",
        inventory: toInt(row.inventory),
        metaTitle: row.metaTitle?.trim() || "",
        metaDescription: row.metaDescription?.trim() || "",
      };

      try {
        // If SKU provided, try to update existing product
        if (productData.sku) {
          const existing = await Product.findOne({ sku: productData.sku });
          if (existing) {
            await Product.findByIdAndUpdate(existing._id, productData, {
              runValidators: true,
            });
            results.updated++;
            continue;
          }
        }

        await Product.create(productData);
        results.created++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Row ${rowNum}: ${msg}`);
      }
    }

    await logActivity({
      action: "create",
      entity: "product",
      entityId: "bulk-import",
      details: `Bulk import: ${results.created} created, ${results.updated} updated, ${results.errors.length} errors`,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("POST /api/admin/products/import error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
