"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Trash2, Edit, Loader2, Package, Copy, Download, Upload, CheckSquare, Square } from "lucide-react";
import { Pagination } from "../components/pagination";
import { ConfirmDialog } from "../components/confirm-dialog";
import { toast } from "../components/toast";

interface Product {
  id: string;
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  inStock: boolean;
  featured: boolean;
  inventory: number;
  image: string;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/admin/products?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.docs || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    try {
      await fetch(`/api/admin/products/${confirmDelete.id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => (p.id || p._id) !== confirmDelete.id));
      setTotal((prev) => prev - 1);
      toast("Product deleted", "success");
    } catch (e) {
      console.error("Failed to delete:", e);
      toast("Failed to delete product", "error");
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id || product._id}`);
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, id, slug, createdAt, updatedAt, __v, ...rest } = data;
      const dupRes = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, name: `${rest.name} (Copy)`, slug: `${slug}-copy-${Date.now()}` }),
      });
      if (dupRes.ok) {
        toast("Product duplicated", "success");
        fetchProducts();
      }
    } catch {
      toast("Failed to duplicate product", "error");
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let count = 0;
    for (const id of selected) {
      try {
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        count++;
      } catch { /* skip */ }
    }
    toast(`Deleted ${count} product${count !== 1 ? "s" : ""}`, "success");
    setSelected(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    fetchProducts();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id || p._id)));
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "SKU", "Category", "Price", "Inventory", "In Stock", "Featured"];
    const rows = products.map((p) => [p.name, p.slug, p.category, p.price, p.inventory, p.inStock, p.featured]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("CSV exported", "success");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{total} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.06] text-gray-400 text-sm hover:text-white hover:bg-white/[0.03] transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link
            href="/admin/products/import"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.06] text-gray-400 text-sm hover:text-white hover:bg-white/[0.03] transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        {selected.size > 0 && (
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-600/10 text-red-400 text-sm font-medium hover:bg-red-600/20 border border-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-12 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No products found</p>
          <Link href="/admin/products/new" className="text-sm text-violet-400 hover:text-violet-300">
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-3 py-3 text-left">
                  <button onClick={toggleAll} className="text-gray-500 hover:text-white transition-colors">
                    {selected.size === products.length && products.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Featured</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {products.map((product) => {
                const pid = product.id || product._id;
                return (
                  <tr key={pid} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(pid)} className="text-gray-500 hover:text-white transition-colors">
                        {selected.has(pid) ? <CheckSquare className="w-4 h-4 text-violet-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover bg-white/[0.03]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 font-mono truncate">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 hidden md:table-cell">{product.category}</td>
                    <td className="px-5 py-3 text-sm text-white font-medium">£{product.price}</td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`text-sm ${product.inventory <= 5 && product.inStock ? "text-amber-400" : product.inStock ? "text-emerald-400" : "text-red-400"}`}>
                        {product.inStock ? `${product.inventory}` : "Out"}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      {product.featured && (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/products/${pid}/edit`}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete({ id: pid, name: product.name })}
                          disabled={deleting === pid}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === pid ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={!!deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Bulk Delete"
        message={`Delete ${selected.size} selected product${selected.size !== 1 ? "s" : ""}? This cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        loading={bulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}
