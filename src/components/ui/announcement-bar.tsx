"use client";

import { X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useSiteContent } from "@/components/providers/site-content-provider";

export function AnnouncementBar() {
  const { data: cms, enabled } = useSiteContent("announcement");
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed || !cms?.text) return null;

  return (
    <div className="relative bg-neon-violet text-white text-center py-2.5 px-4 text-xs sm:text-sm font-medium z-[60]">
      <div className="ultra-wide-padding flex items-center justify-center gap-2">
        <span>{cms.text}</span>
        {cms.link && cms.linkText && (
          <Link
            href={cms.link}
            className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
          >
            {cms.linkText}
          </Link>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
