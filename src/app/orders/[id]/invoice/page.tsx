"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  couponCode?: string;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

const currency = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn, isLoaded } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetch(`/api/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isSignedIn, isLoaded]);

  const handlePrint = () => window.print();

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>

      {/* Action bar (hidden during print) */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link
          href={`/orders/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* Invoice content */}
      <div ref={printRef} className="max-w-3xl mx-auto bg-white px-8 py-10 text-gray-900" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#8b5cf6" }}>
              SIRAJ LUXE
            </h1>
            <p className="text-sm text-gray-500 mt-1">UK Premium E-Commerce</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-sm text-gray-500 mt-1">{order.orderNumber}</p>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Bill to / Status */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.customerEmail}</p>
            {order.shippingAddress && (
              <div className="text-sm text-gray-600 mt-2">
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state && `, ${order.shippingAddress.state}`}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Status</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : order.paymentStatus === "refunded"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Item</th>
              <th className="text-center py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">Qty</th>
              <th className="text-right py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Price</th>
              <th className="text-right py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-900">{item.name}</td>
                <td className="py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                <td className="py-3 text-sm text-gray-600 text-right">{currency(item.price)}</td>
                <td className="py-3 text-sm text-gray-900 font-medium text-right">{currency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{currency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-emerald-600">Discount{order.couponCode && ` (${order.couponCode})`}</span>
                <span className="text-emerald-600">-{currency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">Tax</span>
              <span className="text-gray-900">{currency(order.tax)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-900">{order.shipping === 0 ? "Free" : currency(order.shipping)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">{currency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Thank you for shopping with Siraj Luxe. For questions about this invoice, contact us at binacodesecommercestore@gmail.com
          </p>
          <p className="text-xs text-gray-400 mt-1">
            sirajluxe.com &middot; UK Premium E-Commerce
          </p>
        </div>
      </div>
    </>
  );
}
