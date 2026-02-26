"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const allCrumbs = [{ label: "Home", href: "/" }, ...items];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sirajluxe.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allCrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${baseUrl}${crumb.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
        {allCrumbs.map((crumb, i) => {
          const isLast = i === allCrumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-subtle-fg" />}
              {isLast ? (
                <span className="text-heading font-medium truncate max-w-[200px]">
                  {i === 0 ? <Home className="w-3.5 h-3.5" /> : crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href || "/"}
                  className="text-muted-fg hover:text-neon-violet transition-colors"
                >
                  {i === 0 ? <Home className="w-3.5 h-3.5" /> : crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
