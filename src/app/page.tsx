import HomeContent from "./home-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sirajluxe.com";

// JSON-LD rendered server-side for crawlers
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Siraj Luxe",
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
      description:
        "UK-based premium goods store with curated products, fast delivery, and hassle-free returns.",
      sameAs: [
        "https://x.com/sirajluxe",
        "https://instagram.com/sirajluxe",
        "https://linkedin.com/company/sirajluxe",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Siraj Luxe",
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      {/* Server-rendered JSON-LD for SEO crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent />
    </>
  );
}
