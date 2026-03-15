// Product data for the store
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  image: string;
  colors?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  image: string;
  gradient: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Obsidian Pro Sneakers",
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
    colors: ["#050505", "#2563eb", "#f5f5f5"],
  },
  {
    id: "2",
    name: "Quantum Chronograph",
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
    colors: ["#1a1a1f", "#c4b5a0", "#2563eb"],
  },
  {
    id: "3",
    name: "Nebula Wireless Earbuds",
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
  },
  {
    id: "4",
    name: "Phantom Leather Jacket",
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
  },
  {
    id: "5",
    name: "Aether Sunglasses",
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
  },
  {
    id: "6",
    name: "Carbon Fiber Backpack",
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
  },
  {
    id: "7",
    name: "Void Gaming Mouse",
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
    colors: ["#050505", "#2563eb"],
  },
  {
    id: "8",
    name: "Onyx Mechanical Keyboard",
    description: "Hot-swappable switches, per-key RGB, gasket-mounted aluminum case.",
    price: 349,
    category: "Tech",
    tags: ["Premium"],
    rating: 4.9,
    reviews: 3156,
    inStock: true,
    featured: false,
    image: "/products/keyboard.jpg",
    colors: ["#050505", "#34353c", "#2563eb"],
  },
];

export const categories: Category[] = [
  {
    id: "footwear",
    name: "Footwear",
    description: "Performance meets luxury",
    productCount: 24,
    image: "/categories/footwear.jpg",
    gradient: "from-blue-600/20 to-purple-900/20",
  },
  {
    id: "watches",
    name: "Watches",
    description: "Precision craftsmanship",
    productCount: 18,
    image: "/categories/watches.jpg",
    gradient: "from-blue-600/20 to-blue-900/20",
  },
  {
    id: "audio",
    name: "Audio",
    description: "Sound reimagined",
    productCount: 12,
    image: "/categories/audio.jpg",
    gradient: "from-pink-600/20 to-rose-900/20",
  },
  {
    id: "apparel",
    name: "Apparel",
    description: "Designed for distinction",
    productCount: 36,
    image: "/categories/apparel.jpg",
    gradient: "from-emerald-600/20 to-teal-900/20",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Innovation elevated",
    productCount: 28,
    image: "/categories/tech.jpg",
    gradient: "from-amber-600/20 to-orange-900/20",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "The final touch",
    productCount: 42,
    image: "/categories/accessories.jpg",
    gradient: "from-cyan-600/20 to-sky-900/20",
  },
];

export const featuredCollections = [
  {
    id: "midnight-edition",
    title: "Midnight Edition",
    subtitle: "Limited Release",
    description: "An exclusive collection crafted for those who thrive after dark. Each piece tells a story of nocturnal elegance.",
    productCount: 12,
    gradient: "from-blue-900 via-blue-900 to-blue-950",
  },
  {
    id: "carbon-series",
    title: "Carbon Series",
    subtitle: "Performance Line",
    description: "Engineered with carbon fiber composites for unmatched strength and featherlight precision.",
    productCount: 8,
    gradient: "from-gray-900 via-zinc-800 to-neutral-950",
  },
  {
    id: "aurora-collection",
    title: "Aurora Collection",
    subtitle: "Spring 2026",
    description: "Inspired by the northern lights, this collection blends iridescent materials with minimalist design.",
    productCount: 16,
    gradient: "from-emerald-900 via-teal-900 to-cyan-950",
  },
];
