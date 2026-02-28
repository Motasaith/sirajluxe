"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  Loader2,
  MapPin,
  CreditCard,
  Shield,
  Tag,
  X,
  CheckCircle2,
  Truck,
  BookMarked,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "next-themes";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Types ───────────────────────────────────────────────────────────────────
interface OrderSummary {
  items: { productId: string; name: string; price: number; quantity: number; image: string; color?: string; size?: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingReason: string | null;
  coupon: string | null;
}

// ─── Payment Form (inside Elements provider) ────────────────────────────────
function PaymentForm({
  orderNumber,
  orderSummary,
}: {
  orderNumber: string;
  orderSummary: OrderSummary;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setPayError("");

    const baseUrl = window.location.origin;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/checkout/success?order=${orderNumber}`,
      },
    });

    if (error) {
      setPayError(error.message || "Payment failed. Please try again.");
      setPaying(false);
    } else {
      clearCart();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card input */}
      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-neon-violet" />
          <h2 className="text-lg font-semibold text-heading">Payment</h2>
        </div>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {/* Error */}
      {payError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {payError}
        </div>
      )}

      {/* Order total & pay button */}
      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span className="text-heading">£{orderSummary.subtotal.toFixed(2)}</span>
          </div>
          {orderSummary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400">Discount ({orderSummary.coupon})</span>
              <span className="text-emerald-400">-£{orderSummary.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Shipping</span>
            <span className="text-heading">
              {orderSummary.shipping === 0 ? (
                <span className="text-emerald-400">Free</span>
              ) : (
                `£${orderSummary.shipping.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="border-t border-[var(--border)] pt-2 flex justify-between">
            <span className="font-semibold text-heading">Total</span>
            <span className="text-xl font-bold text-heading">£{orderSummary.total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={paying || !stripe || !elements}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-neon-violet to-neon-purple text-white font-semibold hover:shadow-lg hover:shadow-neon-violet/25 focus:outline-none focus:ring-2 focus:ring-neon-violet/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
        >
          {paying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Pay £{orderSummary.total.toFixed(2)}
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-3 text-[var(--dim)] text-xs">
          <Shield className="w-3.5 h-3.5" />
          256-bit TLS encrypted · Powered by Stripe
        </div>
      </div>
    </form>
  );
}

// ─── Main Checkout Page ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { items, total: cartTotal, itemCount, clearCart } = useCart();
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Coupon validation state
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Checkout state
  const [clientSecret, setClientSecret] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"details" | "payment">("details");

  // Address book state
  const [savedAddresses, setSavedAddresses] = useState<{ _id: string; label: string; line1: string; line2?: string; city: string; postalCode: string; country: string; isDefault?: boolean }[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");

  // Pre-fill user info
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user]);

  // Fetch saved addresses
  useEffect(() => {
    if (!user) return;
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        const addrs = data.addresses || [];
        setSavedAddresses(addrs);
        // Auto-fill default address if no address is entered
        const defaultAddr = addrs.find((a: { isDefault?: boolean }) => a.isDefault) || addrs[0];
        if (defaultAddr && !line1) {
          setLine1(defaultAddr.line1);
          setLine2(defaultAddr.line2 || "");
          setCity(defaultAddr.city);
          setPostalCode(defaultAddr.postalCode);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSelectAddress = (addr: typeof savedAddresses[0]) => {
    setLine1(addr.line1);
    setLine2(addr.line2 || "");
    setCity(addr.city);
    setPostalCode(addr.postalCode);
  };

  const handleSaveAddress = async () => {
    if (!line1.trim() || !city.trim() || !postalCode.trim()) return;
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: addressLabel.trim() || "Home",
          line1: line1.trim(),
          line2: line2.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: "GB",
          isDefault: savedAddresses.length === 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedAddresses(data.addresses || []);
        setSaveAddress(false);
      }
    } catch {
      /* ignore */
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  // Suppress unused toast warning — used for future enhancements
  void toast;

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;

    setCouponValidating(true);
    setCouponError("");
    setCouponApplied(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: cartTotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon code");
        return;
      }

      setCouponApplied({
        code: data.code,
        discount: data.discount,
        description: data.description,
      });
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setCouponValidating(false);
    }
  }, [couponCode, cartTotal]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponCode("");
    setCouponApplied(null);
    setCouponError("");
  }, []);

  const handleProceedToPayment = useCallback(async () => {
    if (!line1.trim() || !city.trim() || !postalCode.trim()) {
      setError("Please fill in all required address fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            color: i.color,
            size: i.size,
          })),
          customerEmail: email,
          customerName: `${firstName} ${lastName}`.trim(),
          couponCode: couponCode.trim() || undefined,
          shippingAddress: {
            line1: line1.trim(),
            line2: line2.trim() || undefined,
            city: city.trim(),
            postalCode: postalCode.trim(),
            country: "GB",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create payment. Please try again.");
        return;
      }

      // Free order (100% discount or total below Stripe minimum)
      if (data.freeOrder) {
        clearCart();
        router.push(`/checkout/success?order=${data.orderNumber}`);
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderNumber(data.orderNumber);
      setOrderSummary(data.orderSummary);
      setStep("payment");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [items, email, firstName, lastName, couponCode, line1, line2, city, postalCode, clearCart, router]);

  // Empty cart
  if (isLoaded && items.length === 0 && step === "details") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-16 h-16 rounded-full bg-[var(--overlay)] flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-[var(--subtle)]" />
        </div>
        <h1 className="text-2xl font-bold text-heading mb-2">Your Cart is Empty</h1>
        <p className="text-[var(--muted)] mb-6 text-center max-w-md">
          Add some products to your cart before checking out.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-gradient-to-r from-neon-violet to-neon-purple text-white rounded-xl font-medium hover:shadow-lg hover:shadow-neon-violet/25 transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-violet/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => step === "payment" ? setStep("details") : router.back()}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--hover)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--muted)]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-heading">Checkout</h1>
            <p className="text-sm text-[var(--muted)]">
              {step === "details" ? "Shipping details" : "Complete payment"}
            </p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === "details" ? "bg-neon-violet/10 text-neon-violet border border-neon-violet/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
            {step === "payment" ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            1. Shipping
          </div>
          <div className="w-8 h-px bg-[var(--border)]" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === "payment" ? "bg-neon-violet/10 text-neon-violet border border-neon-violet/20" : "bg-[var(--elevated)] text-[var(--dim)] border border-[var(--border)]"}`}>
            <CreditCard className="w-4 h-4" />
            2. Payment
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left column — Form */}
          <div className="lg:col-span-3">
            {step === "details" ? (
              <div className="space-y-6">
                {/* Contact info */}
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6">
                  <h2 className="text-lg font-semibold text-heading mb-4">Contact Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">First name *</label>
                      <input
                        type="text"
                        name="given-name"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Last name *</label>
                      <input
                        type="text"
                        name="family-name"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Email *</label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                    />
                  </div>
                </div>

                {/* Shipping address */}
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-neon-violet" />
                    <h2 className="text-lg font-semibold text-heading">Shipping Address</h2>
                  </div>

                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookMarked className="w-4 h-4 text-muted-fg" />
                        <span className="text-xs font-medium text-[var(--muted)]">Saved Addresses</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr._id}
                            type="button"
                            onClick={() => handleSelectAddress(addr)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                              line1 === addr.line1 && postalCode === addr.postalCode
                                ? "border-neon-violet/40 bg-neon-violet/10 text-neon-violet"
                                : "border-[var(--border)] bg-[var(--elevated)] text-body hover:border-neon-violet/20"
                            }`}
                          >
                            <span className="font-semibold">{addr.label}</span>
                            <br />
                            <span className="text-[var(--dim)]">{addr.line1}, {addr.city} {addr.postalCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Address line 1 *</label>
                      <input
                        type="text"
                        name="address-line1"
                        autoComplete="address-line1"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        placeholder="123 High Street"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Address line 2</label>
                      <input
                        type="text"
                        name="address-line2"
                        autoComplete="address-line2"
                        value={line2}
                        onChange={(e) => setLine2(e.target.value)}
                        placeholder="Flat 4B (optional)"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">City *</label>
                        <input
                          type="text"
                          name="address-level2"
                          autoComplete="address-level2"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="London"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Postcode *</label>
                        <input
                          type="text"
                          name="postal-code"
                          autoComplete="postal-code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="SW1A 1AA"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Country</label>
                      <div className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm flex items-center gap-2">
                        <span>🇬🇧</span> United Kingdom
                      </div>
                    </div>

                    {/* Save address toggle */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSaveAddress(!saveAddress)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          saveAddress
                            ? "bg-neon-violet border-neon-violet"
                            : "border-[var(--border)] hover:border-neon-violet/40"
                        }`}
                      >
                        {saveAddress && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </button>
                      <span className="text-sm text-body">Save this address for next time</span>
                    </div>

                    {saveAddress && (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          placeholder="Label (e.g. Home, Office)"
                          maxLength={30}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={!line1.trim() || !city.trim() || !postalCode.trim()}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neon-violet/10 border border-neon-violet/20 text-neon-violet text-sm font-medium hover:bg-neon-violet/20 disabled:opacity-40 transition-all"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coupon */}
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-neon-violet" />
                    <h2 className="text-lg font-semibold text-heading">Coupon Code</h2>
                  </div>

                  {couponApplied ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-sm font-semibold text-emerald-400">{couponApplied.code}</span>
                          <span className="text-xs text-emerald-400/70 ml-2">{couponApplied.description}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      >
                        <X className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                          placeholder="Enter code"
                          className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all uppercase tracking-wider"
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || couponValidating}
                          className="px-5 py-3 rounded-xl bg-neon-violet/10 border border-neon-violet/20 text-neon-violet text-sm font-medium hover:bg-neon-violet/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {couponValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="mt-2 text-sm text-red-400">{couponError}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Continue to payment */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-neon-violet to-neon-purple text-white font-semibold hover:shadow-lg hover:shadow-neon-violet/25 focus:outline-none focus:ring-2 focus:ring-neon-violet/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Setting up payment...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <CreditCard className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            ) : clientSecret && orderSummary ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: resolvedTheme === "light" ? {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#8b5cf6",
                      colorBackground: "#ffffff",
                      colorText: "#1a1a1f",
                      colorTextSecondary: "#5f616e",
                      colorDanger: "#ef4444",
                      fontFamily: "Inter, system-ui, sans-serif",
                      borderRadius: "0.75rem",
                      spacingUnit: "4px",
                    },
                    rules: {
                      ".Input": {
                        border: "1px solid rgba(0,0,0,0.08)",
                        boxShadow: "none",
                        padding: "12px 16px",
                      },
                      ".Input:focus": {
                        border: "1px solid rgba(139,92,246,0.5)",
                        boxShadow: "0 0 0 1px rgba(139,92,246,0.25)",
                      },
                      ".Tab": {
                        border: "1px solid rgba(0,0,0,0.08)",
                        backgroundColor: "#ffffff",
                      },
                      ".Tab--selected": {
                        border: "1px solid rgba(139,92,246,0.5)",
                        backgroundColor: "rgba(139,92,246,0.1)",
                      },
                      ".Label": {
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      },
                    },
                  } : {
                    theme: "night",
                    variables: {
                      colorPrimary: "#8b5cf6",
                      colorBackground: "#0a0a0f",
                      colorText: "#e1e2e6",
                      colorTextSecondary: "#71717a",
                      colorDanger: "#ef4444",
                      fontFamily: "Inter, system-ui, sans-serif",
                      borderRadius: "0.75rem",
                      spacingUnit: "4px",
                    },
                    rules: {
                      ".Input": {
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "none",
                        padding: "12px 16px",
                      },
                      ".Input:focus": {
                        border: "1px solid rgba(139,92,246,0.5)",
                        boxShadow: "0 0 0 1px rgba(139,92,246,0.25)",
                      },
                      ".Tab": {
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "#0a0a0f",
                      },
                      ".Tab--selected": {
                        border: "1px solid rgba(139,92,246,0.5)",
                        backgroundColor: "rgba(139,92,246,0.1)",
                      },
                      ".Label": {
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      },
                    },
                  },
                }}
              >
                <PaymentForm orderNumber={orderNumber} orderSummary={orderSummary} />
              </Elements>
            ) : null}
          </div>

          {/* Right column — Order summary */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-heading mb-4">
                Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
              </h2>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.color || ""}-${item.size || ""}`}
                    className="flex gap-3 p-3 rounded-xl bg-[var(--elevated)] border border-[var(--border)]"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="w-[60px] h-[60px] rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-lg bg-[var(--overlay)] flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-6 h-6 text-[var(--dim)]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-heading truncate">{item.name}</p>
                      {(item.color || item.size) && (
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          {[item.color, item.size].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-xs text-[var(--muted)]">Qty: {item.quantity}</span>
                        <span className="text-sm font-semibold text-neon-violet">
                          £{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border)] mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Subtotal</span>
                  <span className="text-heading">£{cartTotal.toFixed(2)}</span>
                </div>
                {couponApplied && !orderSummary && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Discount ({couponApplied.code})</span>
                    <span className="text-emerald-400">-£{couponApplied.discount.toFixed(2)}</span>
                  </div>
                )}
                {orderSummary?.discount && orderSummary.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Discount{orderSummary.coupon ? ` (${orderSummary.coupon})` : ""}</span>
                    <span className="text-emerald-400">-£{orderSummary.discount.toFixed(2)}</span>
                  </div>
                )}
                {orderSummary ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Shipping</span>
                    <span className="text-heading">
                      {orderSummary.shipping === 0 ? (
                        <span className="text-emerald-400">Free</span>
                      ) : (
                        `£${orderSummary.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Shipping</span>
                    <span className="text-[var(--dim)]">Calculated next step</span>
                  </div>
                )}
              </div>

              {orderSummary?.freeShippingReason && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  {orderSummary.freeShippingReason}
                </div>
              )}

              <div className="border-t border-[var(--border)] mt-4 pt-4 flex justify-between">
                <span className="font-semibold text-heading">
                  {orderSummary ? "Total" : "Estimated Total"}
                </span>
                <span className="text-xl font-bold text-heading">
                  £{(orderSummary?.total ?? (couponApplied ? Math.max(0, cartTotal - couponApplied.discount) : cartTotal)).toFixed(2)}
                </span>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-xs text-[var(--dim)]">
                  <Shield className="w-3.5 h-3.5" />
                  Secure 256-bit TLS encryption
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--dim)]">
                  <Truck className="w-3.5 h-3.5" />
                  UK delivery in 3-5 business days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
