import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  stripeSessionId: string;
  paymentIntentId?: string;
  clerkUserId: string;
  customerEmail: string;
  customerName: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  couponCode: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber: string;
  adminNotes: string;
  returnStatus: "none" | "requested" | "approved" | "denied";
  returnReason: string;
  returnRequestedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    stripeSessionId: { type: String, default: "", index: true },
    paymentIntentId: { type: String, default: "", index: true },
    clerkUserId: { type: String, required: true, index: true },
    customerEmail: { type: String, required: true },
    customerName: { type: String, default: "" },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, default: "" },
      },
    ],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    shippingAddress: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    trackingNumber: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    returnStatus: {
      type: String,
      enum: ["none", "requested", "approved", "denied"],
      default: "none",
    },
    returnReason: { type: String, default: "" },
    returnRequestedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
