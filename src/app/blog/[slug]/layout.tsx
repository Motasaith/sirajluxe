import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { BlogPost } from "@/lib/models/blog-post";

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const post = await BlogPost.findOne({ slug: params.slug }).lean();

  if (!post) {
    return { title: "Post Not Found | Siraj Luxe Blog" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sirajluxe.com";
  const p = post as Record<string, unknown>;
  const postTitle = p.title as string;
  const slug = p.slug as string;
  const excerpt = p.excerpt as string | undefined;
  const content = p.content as string | undefined;
  const coverImage = p.coverImage as string | undefined;
  const metaTitle = p.metaTitle as string | undefined;
  const metaDescription = p.metaDescription as string | undefined;

  // Use custom SEO meta fields if set, otherwise fall back to defaults
  const title = metaTitle || `${postTitle} | Siraj Luxe Blog`;
  const plainExcerpt = excerpt?.slice(0, 160) || content?.replace(/<[^>]*>/g, "").slice(0, 160) || "";
  const description = metaDescription || plainExcerpt;

  return {
    title,
    description,
    openGraph: {
      title: metaTitle || postTitle,
      description,
      type: "article",
      url: `${baseUrl}/blog/${slug}`,
      images: coverImage
        ? [{ url: coverImage, width: 1200, height: 630, alt: postTitle }]
        : [],
      siteName: "Siraj Luxe",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle || postTitle,
      description,
      images: coverImage ? [coverImage] : [],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return children;
}
