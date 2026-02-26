"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

interface Customer {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/customers/${id}`).then((r) => r.json()),
      fetch(`/api/admin/customers/${id}/orders`).then((r) => r.json()),
    ])
      .then(([custData, orderData]) => {
        setCustomer(custData);
        setOrders(orderData.docs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Customer not found</h2>
        <button onClick={() => router.push("/admin/customers")} className="text-violet-400 hover:underline text-sm">
          Back to Customers
        </button>
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`.trim() || "Unnamed Customer";

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push("/admin/customers")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </button>

      {/* Customer Card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center">
            <User className="w-7 h-7 text-violet-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {customer.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(customer.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Orders</span>
            </div>
            <p className="text-xl font-bold text-white">{customer.orderCount}</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Total Spent</span>
            </div>
            <p className="text-xl font-bold text-white">£{customer.totalSpent.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Avg Order</span>
            </div>
            <p className="text-xl font-bold text-white">
              £{customer.orderCount > 0 ? (customer.totalSpent / customer.orderCount).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Order History</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No orders yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-violet-400 font-mono">
                    <Link href={`/admin/orders/${o._id}`} className="hover:underline">{o.orderNumber}</Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-white font-medium">£{o.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${statusColors[o.status] || statusColors.pending}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
