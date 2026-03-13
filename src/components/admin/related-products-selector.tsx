import { useState, useEffect } from "react";
import { Loader2, X, Plus, Search } from "lucide-react";
import Image from "next/image";
import { blurDataURL } from "@/lib/blur-placeholder";

interface RelatedProduct {
    _id: string;
    name: string;
    image: string;
    price: number;
}

interface Props {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    currentProductId?: string;
}

export function RelatedProductsSelector({ selectedIds, onChange, currentProductId }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<RelatedProduct[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<RelatedProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);

    // Load initially selected products
    useEffect(() => {
        const loadSelected = async () => {
            if (!selectedIds || selectedIds.length === 0) {
                setInitLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/admin/products?limit=100`);
                const data = await res.json();
                const docs = data.docs || [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const matched = docs.filter((d: any) => selectedIds.includes(d._id));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setSelectedProducts(matched.map((p: any) => ({ _id: p._id, name: p.name, image: p.image, price: p.price })));
            } catch (e) {
                console.error("Failed to load selected related products", e);
            } finally {
                setInitLoading(false);
            }
        };
        loadSelected();
    }, [selectedIds]);

    // Search products
    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/products?search=${encodeURIComponent(query)}&limit=10`);
                const data = await res.json();
                const docs = data.docs || [];
                setResults(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    docs
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((d: any) => d._id !== currentProductId && !selectedIds.includes(d._id))
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((p: any) => ({ _id: p._id, name: p.name, image: p.image, price: p.price }))
                );
            } catch (e) {
                console.error("Failed to search products", e);
            } finally {
                setLoading(false);
            }
        };
        const timeout = setTimeout(search, 300);
        return () => clearTimeout(timeout);
    }, [query, currentProductId, selectedIds]);

    const addProduct = (product: RelatedProduct) => {
        if (!selectedIds.includes(product._id)) {
            const newSelected = [...selectedProducts, product];
            setSelectedProducts(newSelected);
            onChange(newSelected.map((p) => p._id));
            setQuery("");
        }
    };

    const removeProduct = (id: string) => {
        const newSelected = selectedProducts.filter((p) => p._id !== id);
        setSelectedProducts(newSelected);
        onChange(newSelected.map((p) => p._id));
    };

    if (initLoading) {
        return <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-500" /></div>;
    }

    return (
        <div className="space-y-4">
            {/* Selected Products list */}
            {selectedProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {selectedProducts.map((p) => (
                        <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-[#1a1a24]">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/20 shrink-0">
                                <Image src={p.image || "/placeholder.jpg"} alt={p.name} fill className="object-cover" sizes="48px" blurDataURL={blurDataURL} placeholder="blur" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                                <p className="text-xs text-gray-500">£{p.price}</p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); removeProduct(p._id); }}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                title="Remove"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products to add..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-violet-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                )}

                {/* Search Results Dropdown */}
                {query.trim().length > 0 && results.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-[#1a1a24] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                        {results.map((p) => (
                            <button
                                key={p._id}
                                type="button"
                                onClick={(e) => { e.preventDefault(); addProduct(p); }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.04] last:border-0"
                            >
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/20 shrink-0">
                                    <Image src={p.image || "/placeholder.jpg"} alt={p.name} fill className="object-cover" sizes="40px" blurDataURL={blurDataURL} placeholder="blur" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                                    <p className="text-xs text-gray-500">£{p.price}</p>
                                </div>
                                <Plus className="w-4 h-4 text-gray-400 shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
                {query.trim().length > 0 && !loading && results.length === 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4 text-center text-sm text-gray-400">
                        No products found matching &quot;{query}&quot;
                    </div>
                )}
            </div>
        </div>
    );
}
