import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-auth";
import connectDB from "@/lib/mongodb";
import {
    Product,
    Order,
    Customer,
    Category,
    BlogPost,
    Coupon,
    Subscriber,
    Review,
    Media,
    Settings,
    Question,
} from "@/lib/models";


export async function GET() {
    try {
        const denied = await adminGuard("super_admin");
        if (denied) return denied;

        // Connect to DB
        await connectDB();

        // Fetch all collections
        const [
            products,
            orders,
            customers,
            categories,
            blogPosts,
            coupons,
            subscribers,
            reviews,
            media,
            settings,
            questions,
        ] = await Promise.all([
            Product.find().lean(),
            Order.find().lean(),
            Customer.find().lean(),
            Category.find().lean(),
            BlogPost.find().lean(),
            Coupon.find().lean(),
            Subscriber.find().lean(),
            Review.find().lean(),
            Media.find().lean(),
            Settings.findOne().lean(),
            Question.find().lean(),
        ]);

        // Aggregate data into a single object
        const backupData = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            data: {
                products,
                orders,
                customers,
                categories,
                blogPosts,
                coupons,
                subscribers,
                reviews,
                media,
                settings,
                questions,
            },
        };

        // Format the response as a downloadable JSON file
        return new NextResponse(JSON.stringify(backupData, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="binacodes_backup_${new Date().toISOString().split("T")[0]}.json"`,
            },
        });
    } catch (error) {
        console.error("GET /api/admin/backup error:", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json(
            { error: "Failed to create database backup" },
            { status: 500 }
        );
    }
}
