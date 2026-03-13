import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product } from "@/lib/models";

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        await connectDB();
        const product = await Product.findOne({ slug: params.slug })
            .populate("relatedProducts", "name slug price originalPrice image")
            .lean();

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let related = (product.relatedProducts as any[]) || [];

        // Auto-fill fallback if < 4 related products
        if (related.length < 4) {
            const fallback = await Product.find({
                category: product.category,
                _id: { $ne: product._id, $nin: related.map((r) => r._id) },
            })
                .select("name slug price originalPrice image")
                .limit(4 - related.length)
                .lean();

            related = [...related, ...fallback];
        }

        return NextResponse.json(
            related.map((p) => ({ ...p, id: p._id.toString() }))
        );
    } catch (error) {
        console.error(
            "GET /api/products/[slug]/related error:",
            error instanceof Error ? error.message : "Unknown error"
        );
        return NextResponse.json(
            { error: "Failed to fetch related products" },
            { status: 500 }
        );
    }
}
