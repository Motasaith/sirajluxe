import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product, Category } from "@/lib/models";

// Static data to seed the database
const seedProducts = [
  {
    name: "Obsidian Pro Sneakers",
    slug: "obsidian-pro-sneakers",
    description: "Ultra-lightweight performance sneakers with adaptive cushioning and carbon-fiber sole plate.",
    price: 299,
    originalPrice: 399,
    category: "Footwear",
    tags: ["New", "Limited"],
    rating: 4.9,
    reviews: 2847,
    inStock: true,
    featured: true,
    image: "/products/sneaker.jpg",
    colors: ["#050505", "#8b5cf6", "#f5f5f5"],
    sku: "BC-SNK-001",
    inventory: 150,
  },
  {
    name: "Quantum Chronograph",
    slug: "quantum-chronograph",
    description: "Precision-crafted timepiece with sapphire crystal display and 100m water resistance.",
    price: 1299,
    originalPrice: 1599,
    category: "Watches",
    tags: ["Bestseller"],
    rating: 4.8,
    reviews: 1293,
    inStock: true,
    featured: true,
    image: "/products/watch.jpg",
    colors: ["#1a1a1f", "#c4b5a0", "#8b5cf6"],
    sku: "BC-WCH-001",
    inventory: 50,
  },
  {
    name: "Nebula Wireless Earbuds",
    slug: "nebula-wireless-earbuds",
    description: "Active noise cancellation with spatial audio. 48-hour battery life in a titanium case.",
    price: 349,
    category: "Audio",
    tags: ["Hot"],
    rating: 4.7,
    reviews: 5621,
    inStock: true,
    featured: true,
    image: "/products/earbuds.jpg",
    colors: ["#050505", "#f5f5f5"],
    sku: "BC-AUD-001",
    inventory: 200,
  },
  {
    name: "Phantom Leather Jacket",
    slug: "phantom-leather-jacket",
    description: "Italian full-grain leather with hand-stitched detailing and custom hardware.",
    price: 899,
    originalPrice: 1199,
    category: "Apparel",
    tags: ["Premium"],
    rating: 4.9,
    reviews: 834,
    inStock: true,
    featured: true,
    image: "/products/jacket.jpg",
    colors: ["#050505", "#34353c"],
    sku: "BC-APR-001",
    inventory: 75,
  },
  {
    name: "Aether Sunglasses",
    slug: "aether-sunglasses",
    description: "Titanium frame with polarized CR-39 lenses and UV400 protection.",
    price: 459,
    category: "Accessories",
    tags: ["New"],
    rating: 4.6,
    reviews: 1567,
    inStock: true,
    featured: false,
    image: "/products/sunglasses.jpg",
    colors: ["#050505", "#c4b5a0"],
    sku: "BC-ACC-001",
    inventory: 120,
  },
  {
    name: "Carbon Fiber Backpack",
    slug: "carbon-fiber-backpack",
    description: "Ballistic nylon construction with RFID-blocking pocket and magnetic closure.",
    price: 249,
    category: "Bags",
    tags: ["Trending"],
    rating: 4.8,
    reviews: 2103,
    inStock: true,
    featured: false,
    image: "/products/backpack.jpg",
    colors: ["#050505", "#3e3f48"],
    sku: "BC-BAG-001",
    inventory: 90,
  },
  {
    name: "Void Gaming Mouse",
    slug: "void-gaming-mouse",
    description: "26K DPI optical sensor, 85g ultralight design, 100-hour battery life.",
    price: 179,
    originalPrice: 229,
    category: "Tech",
    tags: ["Sale"],
    rating: 4.7,
    reviews: 4290,
    inStock: true,
    featured: false,
    image: "/products/mouse.jpg",
    colors: ["#050505", "#8b5cf6"],
    sku: "BC-TCH-001",
    inventory: 300,
  },
  {
    name: "Onyx Mechanical Keyboard",
    slug: "onyx-mechanical-keyboard",
    description: "Hot-swappable switches, per-key RGB, gasket-mounted aluminum case.",
    price: 349,
    category: "Tech",
    tags: ["Premium"],
    rating: 4.9,
    reviews: 3156,
    inStock: true,
    featured: false,
    image: "/products/keyboard.jpg",
    colors: ["#050505", "#34353c", "#8b5cf6"],
    sku: "BC-TCH-002",
    inventory: 180,
  },
];

const seedCategories = [
  { name: "Footwear", slug: "footwear", description: "Performance meets luxury", productCount: 24, image: "/categories/footwear.jpg", gradient: "from-violet-600/20 to-purple-900/20", sortOrder: 1 },
  { name: "Watches", slug: "watches", description: "Precision craftsmanship", productCount: 18, image: "/categories/watches.jpg", gradient: "from-blue-600/20 to-indigo-900/20", sortOrder: 2 },
  { name: "Audio", slug: "audio", description: "Sound reimagined", productCount: 12, image: "/categories/audio.jpg", gradient: "from-pink-600/20 to-rose-900/20", sortOrder: 3 },
  { name: "Apparel", slug: "apparel", description: "Designed for distinction", productCount: 36, image: "/categories/apparel.jpg", gradient: "from-emerald-600/20 to-teal-900/20", sortOrder: 4 },
  { name: "Tech", slug: "tech", description: "Innovation elevated", productCount: 28, image: "/categories/tech.jpg", gradient: "from-amber-600/20 to-orange-900/20", sortOrder: 5 },
  { name: "Accessories", slug: "accessories", description: "The final touch", productCount: 42, image: "/categories/accessories.jpg", gradient: "from-cyan-600/20 to-sky-900/20", sortOrder: 6 },
  { name: "Bags", slug: "bags", description: "Carry with style", productCount: 15, image: "/categories/bags.jpg", gradient: "from-rose-600/20 to-pink-900/20", sortOrder: 7 },
];

// POST /api/seed — seeds the database with initial data
export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([Product.deleteMany({}), Category.deleteMany({})]);

    // Insert seed data
    const [products, categories] = await Promise.all([
      Product.insertMany(seedProducts),
      Category.insertMany(seedCategories),
    ]);

    return NextResponse.json({
      message: "Database seeded successfully",
      products: products.length,
      categories: categories.length,
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
