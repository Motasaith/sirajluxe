"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { Loader2, Calendar, ArrowRight, Tag } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.set("category", selectedCategory);

    fetch(`/api/blog?${params}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.docs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const categories = [
    "All",
    "Style Guide",
    "Product Spotlight",
    "Behind the Brand",
    "Tips & Tricks",
    "News",
  ];

  return (
    <PageTransitionProvider>
      <Header />
      <CartDrawer />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--border)] text-xs font-medium text-neon-violet uppercase tracking-widest mb-4">
              The Journal
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              Stories, Guides & Inspiration
            </h1>
            <p className="text-muted-fg max-w-xl mx-auto">
              Explore our latest articles on style, products, and the stories behind Siraj Luxe.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setLoading(true);
                  setSelectedCategory(cat);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-neon-violet text-white"
                    : "border border-[var(--border)] text-muted-fg hover:text-heading hover:border-heading/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-md mx-auto">
              <p className="text-heading font-semibold mb-2">No posts yet</p>
              <p className="text-sm text-muted-fg">
                We&apos;re working on some great content. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group glass-card overflow-hidden hover:border-neon-violet/30 transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-surface to-background overflow-hidden">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-violet/20 to-neon-purple/10 blur-2xl" />
                        <span className="absolute text-4xl font-display font-bold text-heading/10">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-muted-fg mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span>{post.author}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-heading mb-2 group-hover:text-neon-violet transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-fg line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-muted-fg"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neon-violet group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
