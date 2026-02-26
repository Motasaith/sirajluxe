"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const range = () => {
    const items: (number | "...")[] = [];
    const delta = 1;
    const left = Math.max(2, page - delta);
    const right = Math.min(pages - 1, page + delta);

    items.push(1);
    if (left > 2) items.push("...");
    for (let i = left; i <= right; i++) items.push(i);
    if (right < pages - 1) items.push("...");
    if (pages > 1) items.push(pages);

    return items;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <p className="text-xs text-gray-500">
        {total} total result{total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {range().map((item, i) =>
          item === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-xs text-gray-600">
              ...
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item as number)}
              className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${
                page === item
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
