"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { Loader2, ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setPost(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PageTransitionProvider>
      <Header />
      <CartDrawer />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-heading transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {!loading && post && (
            <Breadcrumbs
              items={[
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
          ) : !post ? (
            <div className="glass-card p-12 text-center">
              <p className="text-heading font-semibold mb-2">Post not found</p>
              <p className="text-sm text-muted-fg mb-6">
                This article may have been removed or doesn&apos;t exist.
              </p>
              <Link
                href="/blog"
                className="inline-flex px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
              >
                Browse Articles
              </Link>
            </div>
          ) : (
            <article>
              {/* JSON-LD */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    headline: post.title,
                    description: post.excerpt,
                    image: post.coverImage || undefined,
                    author: {
                      "@type": "Person",
                      name: post.author,
                    },
                    publisher: {
                      "@type": "Organization",
                      name: "Siraj Luxe",
                      url: "https://sirajluxe.com",
                    },
                    datePublished: post.publishedAt,
                    mainEntityOfPage: `https://sirajluxe.com/blog/${post.slug}`,
                  }),
                }}
              />

              {/* Category Badge */}
              <span className="inline-block px-3 py-1 rounded-full border border-neon-violet/30 text-[10px] font-medium text-neon-violet uppercase tracking-widest mb-4">
                {post.category}
              </span>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-heading mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-fg mb-8">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Cover Image */}
              {post.coverImage && (
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority
                  />
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-invert prose-sm max-w-none prose-p:text-body prose-strong:text-heading prose-li:text-body prose-a:text-neon-violet prose-headings:text-heading prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-[var(--border)]">
                  <Tag className="w-4 h-4 text-muted-fg" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/[0.04] border border-[var(--border)] text-xs text-muted-fg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="glass-card p-8 text-center mt-12">
                <h3 className="text-lg font-semibold text-heading mb-2">
                  Enjoyed this article?
                </h3>
                <p className="text-sm text-muted-fg mb-4">
                  Browse our curated collection of premium products.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
                >
                  Shop Now
                </Link>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
