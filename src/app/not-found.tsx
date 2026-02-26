import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center px-6">
        <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-2xl font-bold text-heading mb-2">Page Not Found</h2>
        <p className="text-body mb-8 max-w-md">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 glass rounded-xl font-medium text-heading hover:bg-[var(--overlay)] transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
