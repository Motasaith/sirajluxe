"use client";

import { useState, useEffect } from "react";
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
  PenTool,
  Ticket,
  Menu,
  X,
  ClipboardList,
  MessageCircleQuestion,
  Mail,
} from "lucide-react";
import { useAdminRole } from "./role-context";
import type { AdminRole } from "@/lib/admin-auth";

const ROLE_LEVEL: Record<AdminRole, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  support: 1,
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, minRole: "support" as AdminRole },
  { label: "Products", href: "/admin/products", icon: Package, minRole: "admin" as AdminRole },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, minRole: "support" as AdminRole },
  { label: "Categories", href: "/admin/categories", icon: FolderTree, minRole: "admin" as AdminRole },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket, minRole: "admin" as AdminRole },
  { label: "Customers", href: "/admin/customers", icon: Users, minRole: "support" as AdminRole },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare, minRole: "support" as AdminRole },
  { label: "Q&A", href: "/admin/questions", icon: MessageCircleQuestion, minRole: "support" as AdminRole },
  { label: "Site Editor", href: "/admin/site-editor", icon: PenTool, minRole: "editor" as AdminRole },
  { label: "Blog", href: "/admin/blog", icon: FileText, minRole: "editor" as AdminRole },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail, minRole: "editor" as AdminRole },
  { label: "Media", href: "/admin/media", icon: ImageIcon, minRole: "admin" as AdminRole },
  { label: "Activity Log", href: "/admin/activity", icon: ClipboardList, minRole: "super_admin" as AdminRole },
  { label: "Settings", href: "/admin/settings", icon: Settings, minRole: "super_admin" as AdminRole },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const role = useAdminRole();

  const filteredNavItems = navItems.filter(
    (item) => ROLE_LEVEL[role] >= ROLE_LEVEL[item.minRole]
  );

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scroll when open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Siraj Luxe</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Panel</p>
          </div>
        </Link>
        {/* Mobile close */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
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
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-lg bg-[#0a0a0f] border border-white/[0.06] text-gray-400 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
