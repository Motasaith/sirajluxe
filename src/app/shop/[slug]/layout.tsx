import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Product, IProduct } from "@/lib/models/product";

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const doc = await Product.findOne({ slug: params.slug }).lean();

  if (!doc) {
    return { title: "Product Not Found | Siraj Luxe" };
  }

  const product = doc as unknown as IProduct;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sirajluxe.com";
  const image = product.images?.[0] || product.image;

  // Use custom SEO meta fields if set, otherwise fall back to defaults
  const title = product.metaTitle || `${product.name} | Siraj Luxe`;
  const plainDescription = typeof product.description === "string"
    ? product.description.replace(/<[^>]*>/g, "").slice(0, 160)
    : `Shop ${product.name} at Siraj Luxe. Premium quality, fast UK delivery.`;
  const description = product.metaDescription || plainDescription;

  return {
    title,
    description,
    openGraph: {
      title: product.metaTitle || product.name,
      description,
      type: "website",
      url: `${baseUrl}/shop/${product.slug}`,
      images: image
        ? [{ url: image, width: 800, height: 800, alt: product.name }]
        : [],
      siteName: "Siraj Luxe",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle || product.name,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `${baseUrl}/shop/${product.slug}`,
    },
  };
}

export default async function ProductLayout({ children, params }: Props) {
  await connectDB();
  const doc = await Product.findOne({ slug: params.slug }).lean();

  if (!doc) {
    return children;
  }

  const product = doc as unknown as IProduct;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sirajluxe.com";
  const image = product.images?.[0] || product.image;
  
  const plainDescription = typeof product.description === "string"
    ? product.description.replace(/<[^>]*>/g, "").slice(0, 160)
    : `Shop ${product.name} at Siraj Luxe.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": image ? [image] : [],
    "description": product.metaDescription || plainDescription,
    "sku": product.sku || product._id?.toString(),
    "brand": {
      "@type": "Brand",
      "name": "Siraj Luxe"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/shop/${product.slug}`,
      "priceCurrency": "GBP",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock && product.inventory > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Siraj Luxe"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
