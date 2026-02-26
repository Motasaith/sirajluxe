import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number; // percentage (0-100) or fixed amount in pounds
  minOrderAmount: number; // minimum order amount in pounds
  maxUses: number;
  usedCount: number;
  expiresAt: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Note: code already has { unique: true } which creates an index — no need for duplicate
CouponSchema.index({ active: 1 });

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
