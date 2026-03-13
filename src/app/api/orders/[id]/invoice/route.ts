import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";

// -------------------------------------------------------------------
// Minimal PDF generator — produces a valid PDF with text content.
// No external dependencies required.
// -------------------------------------------------------------------

function escPdf(str: string): string {
    return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildInvoicePdf(order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: { name: string; price: number; quantity: number }[];
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    couponCode?: string;
    shippingAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state?: string;
        postalCode: string;
        country: string;
    };
    createdAt: string;
}): Buffer {
    const currency = (n: number) =>
        new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    // Build content lines
    let y = 780;
    const leftMargin = 50;
    const rightCol = 400;
    const lineHeight = 16;

    const objects: string[] = [];
    let objectCount = 0;
    const offsets: number[] = [];

    function addObj(content: string): number {
        objectCount++;
        offsets.push(-1); // placeholder
        objects.push(content);
        return objectCount;
    }

    // Catalog, Pages placeholder
    const catalogId = addObj(""); // 1
    const pagesId = addObj(""); // 2

    // Font — Helvetica (built-in PDF font)
    const fontId = addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
    const fontBoldId = addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

    // Build page content stream
    let stream = "";

    function addText(text: string, x: number, yPos: number, size: number, bold = false) {
        stream += `BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${yPos} Td (${escPdf(text)}) Tj ET\n`;
    }

    function addLine(x1: number, y1: number, x2: number, lineWidth = 0.5) {
        stream += `${lineWidth} w ${x1} ${y1} m ${x2} ${y1} l S\n`;
    }

    // Header
    addText("SIRAJ LUXE", leftMargin, y, 22, true);
    y -= 18;
    addText("UK Premium E-Commerce", leftMargin, y, 9);

    // Invoice title
    addText("INVOICE", rightCol, y + 18, 18, true);
    addText(order.orderNumber, rightCol, y, 10);
    y -= 14;
    addText(formatDate(order.createdAt), rightCol, y, 9);

    // Separator
    y -= 20;
    addLine(leftMargin, y, 555);

    // Bill To
    y -= 20;
    addText("BILL TO", leftMargin, y, 8, true);
    y -= lineHeight;
    addText(order.customerName || "Customer", leftMargin, y, 10);
    y -= lineHeight;
    addText(order.customerEmail, leftMargin, y, 9);

    if (order.shippingAddress) {
        y -= lineHeight;
        addText(order.shippingAddress.line1, leftMargin, y, 9);
        if (order.shippingAddress.line2) {
            y -= lineHeight;
            addText(order.shippingAddress.line2, leftMargin, y, 9);
        }
        y -= lineHeight;
        const cityLine = [
            order.shippingAddress.city,
            order.shippingAddress.state,
            order.shippingAddress.postalCode,
        ]
            .filter(Boolean)
            .join(", ");
        addText(cityLine, leftMargin, y, 9);
        y -= lineHeight;
        addText(order.shippingAddress.country, leftMargin, y, 9);
    }

    // Item table header
    y -= 30;
    addLine(leftMargin, y + 5, 555);
    addText("Item", leftMargin, y - 10, 8, true);
    addText("Qty", 350, y - 10, 8, true);
    addText("Price", 410, y - 10, 8, true);
    addText("Total", 490, y - 10, 8, true);
    y -= 18;
    addLine(leftMargin, y, 555);

    // Items
    for (const item of order.items) {
        y -= lineHeight + 2;
        if (y < 80) break; // safety margin
        const name = item.name.length > 40 ? item.name.substring(0, 37) + "..." : item.name;
        addText(name, leftMargin, y, 9);
        addText(String(item.quantity), 358, y, 9);
        addText(currency(item.price), 410, y, 9);
        addText(currency(item.price * item.quantity), 490, y, 9);
    }

    // Separator
    y -= 15;
    addLine(leftMargin, y, 555);

    // Totals (right-aligned)
    const totalsX = 400;
    const valsX = 490;

    y -= 20;
    addText("Subtotal", totalsX, y, 9);
    addText(currency(order.subtotal), valsX, y, 9);

    if (order.discount > 0) {
        y -= lineHeight;
        const discountLabel = order.couponCode
            ? `Discount (${order.couponCode})`
            : "Discount";
        addText(discountLabel, totalsX, y, 9);
        addText(`-${currency(order.discount)}`, valsX, y, 9);
    }

    y -= lineHeight;
    addText("Tax", totalsX, y, 9);
    addText(currency(order.tax), valsX, y, 9);

    y -= lineHeight;
    addText("Shipping", totalsX, y, 9);
    addText(order.shipping === 0 ? "Free" : currency(order.shipping), valsX, y, 9);

    y -= lineHeight + 5;
    addLine(totalsX, y + 5, 555, 1.5);
    y -= 5;
    addText("Total", totalsX, y, 12, true);
    addText(currency(order.total), valsX, y, 12, true);

    // Footer
    addText(
        "Thank you for shopping with Siraj Luxe.",
        leftMargin,
        40,
        8
    );
    addText(
        "sirajluxe.com  |  UK Premium E-Commerce",
        leftMargin,
        28,
        7
    );

    // Stream object
    const streamBytes = Buffer.from(stream, "latin1");
    const streamId = addObj(
        `<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream`
    );

    // Page object
    const pageId = addObj(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontBoldId} 0 R >> >> >>`
    );

    // Now fill in catalog and pages
    objects[0] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[1] = `<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`;

    // Build the PDF
    let pdf = "%PDF-1.4\n";

    for (let i = 0; i < objects.length; i++) {
        offsets[i] = pdf.length;
        pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) {
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    return Buffer.from(pdf, "latin1");
}

// GET /api/orders/[id]/invoice — download PDF invoice
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const order = (await Order.findById(params.id).lean()) as any;
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Verify ownership (unless admin — checked by clerkUserId match)
        if (order.clerkUserId !== userId) {
            // Check if user is admin (import would be circular, so simple check)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const pdfBuffer = buildInvoicePdf({
            orderNumber: order.orderNumber,
            customerName: order.customerName || "",
            customerEmail: order.customerEmail || "",
            items: order.items || [],
            subtotal: order.subtotal || 0,
            discount: order.discount || 0,
            tax: order.tax || 0,
            shipping: order.shipping || 0,
            total: order.total || 0,
            couponCode: order.couponCode,
            shippingAddress: order.shippingAddress,
            createdAt: order.createdAt?.toISOString?.() || new Date().toISOString(),
        });

        return new NextResponse(pdfBuffer as unknown as Blob, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
                "Content-Length": String(pdfBuffer.length),
            },
        });
    } catch (error) {
        console.error(
            "GET /api/orders/[id]/invoice error:",
            error instanceof Error ? error.message : "Unknown error"
        );
        return NextResponse.json(
            { error: "Failed to generate invoice" },
            { status: 500 }
        );
    }
}
