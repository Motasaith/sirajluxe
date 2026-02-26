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
  const title = p.title as string;
  const slug = p.slug as string;
  const excerpt = p.excerpt as string | undefined;
  const content = p.content as string | undefined;
  const coverImage = p.coverImage as string | undefined;

  return {
    title: `${title} | Siraj Luxe Blog`,
    description: excerpt?.slice(0, 160) || content?.slice(0, 160) || "",
    openGraph: {
      title,
      description: excerpt?.slice(0, 160) || "",
      type: "article",
      url: `${baseUrl}/blog/${slug}`,
      images: coverImage
        ? [{ url: coverImage, width: 1200, height: 630, alt: title }]
        : [],
      siteName: "Siraj Luxe",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt?.slice(0, 160) || "",
      images: coverImage ? [coverImage] : [],
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return children;
}
