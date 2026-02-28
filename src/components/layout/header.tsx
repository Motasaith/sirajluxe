"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Sun,
  Moon,
  Heart,
  Package,
  Star,
} from "lucide-react";
import { useTheme } from "next-themes";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useSiteContent } from "@/components/providers/site-content-provider";
import { AnnouncementBar } from "@/components/ui/announcement-bar";
import { PromoBanner } from "@/components/ui/promo-banner";
import { SearchDrawer } from "@/components/ui/search-drawer";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const defaultNavLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Header() {
  const { data: cms } = useSiteContent("header");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, toggleCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navLinks = Array.isArray(cms?.navLinks) && cms.navLinks.length > 0 ? cms.navLinks : defaultNavLinks;

  useKeyboardShortcuts({
    onSearch: () => setIsSearchOpen(true),
    onEscape: () => {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Magnetic button effect
  const handleMagnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    btn.style.transition = "transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)";
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.transform = "translate(0, 0)";
    target.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
  };

  return (
    <>
      <AnnouncementBar />
      <motion.header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass py-3"
            : "bg-transparent py-5"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="ultra-wide-padding flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-10 group">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-violet to-neon-purple flex items-center justify-center shadow-neon">
                <span className="text-white font-bold text-lg">{cms?.logoLetter || "S"}</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-heading hidden sm:block">
                {cms?.logoText || "SIRAJ"}<span className="neon-text">{cms?.logoAccent || " LUXE"}</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-5 py-2 text-sm font-medium text-body hover:text-heading transition-colors duration-300 group"
              >
                <span className="relative z-10">{link.label}</span>
                <motion.div
                  className="absolute inset-0 rounded-full bg-[var(--overlay)]"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-neon-violet group-hover:w-6 transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              onMouseMove={handleMagnetic}
              onMouseLeave={handleMagneticLeave}
              className="relative p-2.5 rounded-full text-body hover:text-heading hover:bg-[var(--hover)] transition-all duration-300"
              aria-label="Search"
              title="Search (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full text-body hover:text-heading hover:bg-[var(--hover)] transition-all duration-300 hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center min-w-[18px] h-[18px]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                onMouseMove={handleMagnetic}
                onMouseLeave={handleMagneticLeave}
                className="relative p-2.5 rounded-full text-body hover:text-heading hover:bg-[var(--hover)] transition-all duration-300 hidden sm:flex"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* User */}
            <SignedIn>
              <div className="hidden sm:flex items-center">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link label="My Orders" labelIcon={<Package className="w-4 h-4" />} href="/orders" />
                    <UserButton.Link label="My Reviews" labelIcon={<Star className="w-4 h-4" />} href="/my-reviews" />
                    <UserButton.Link label="Wishlist" labelIcon={<Heart className="w-4 h-4" />} href="/wishlist" />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="relative p-2.5 rounded-full text-body hover:text-heading hover:bg-[var(--hover)] transition-all duration-300 hidden sm:flex"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            </SignedOut>

            {/* Cart */}
            <button
              onClick={toggleCart}
              onMouseMove={handleMagnetic}
              onMouseLeave={handleMagneticLeave}
              className="relative p-2.5 rounded-full text-body hover:text-heading hover:bg-[var(--hover)] transition-all duration-300"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-neon-violet text-white text-[10px] font-bold flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative p-2.5 rounded-full text-body hover:text-heading hover:bg-[var(--hover)] transition-all duration-300 lg:hidden"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Promo Banner */}
        <PromoBanner />
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              className="absolute top-20 left-0 right-0 px-6 py-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-4 px-4 text-2xl font-display font-medium text-body hover:text-heading hover:bg-[var(--hover)] rounded-2xl transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              {/* Account Links */}
              <div className="mt-6 pt-6 border-t border-[var(--border)] flex flex-col gap-1">
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-medium text-body hover:text-heading hover:bg-[var(--hover)] rounded-xl transition-all duration-300"
                >
                  My Orders
                </Link>
                <Link
                  href="/my-reviews"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-medium text-body hover:text-heading hover:bg-[var(--hover)] rounded-xl transition-all duration-300"
                >
                  My Reviews
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4">
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-3 rounded-full glass text-body hover:text-heading"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                )}
                <Link href="/wishlist" className="relative p-3 rounded-full glass text-body hover:text-heading">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center min-w-[18px] h-[18px]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <Link href="/sign-in" className="p-3 rounded-full glass text-body hover:text-heading">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </Link>
                </SignedOut>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
