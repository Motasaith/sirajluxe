"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  ImageIcon,
  ArrowLeft,
  Settings,
  FileText,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Siraj Luxe</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-violet-400" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to Store */}
      <div className="p-4 border-t border-white/[0.06]">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
