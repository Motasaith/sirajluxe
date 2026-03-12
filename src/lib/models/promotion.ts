import mongoose, { Schema, Document } from "mongoose";

export type PromotionType =
  | "spend_x_get_pct"   // spend £X, get Y% off
  | "spend_x_get_off"   // spend £X, get £Y off
  | "buy_x_get_pct";    // buy X items, get Y% off

export interface IPromotion extends Document {
  name: string;
  type: PromotionType;
  minimumSpend: number;     // minimum cart total (£)
  minimumItems?: number;    // minimum item count (for buy_x)
  discountValue: number;    // % off (for pct) or £ off (for off)
  active: boolean;
  stackable: boolean;       // can combine with coupon codes
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["spend_x_get_pct", "spend_x_get_off", "buy_x_get_pct"],
      required: true,
    },
    minimumSpend: { type: Number, default: 0 },
    minimumItems: { type: Number, default: 0 },
    discountValue: { type: Number, required: true },
    active: { type: Boolean, default: true },
    stackable: { type: Boolean, default: false },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

PromotionSchema.index({ active: 1 });

export const Promotion =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", PromotionSchema);
