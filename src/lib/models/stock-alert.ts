import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStockAlert extends Document {
  email: string;
  productId: string;
  productName: string;
  notified: boolean;
  createdAt: Date;
}

const StockAlertSchema = new Schema<IStockAlert>(
  {
    email: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, default: "" },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

StockAlertSchema.index({ productId: 1, email: 1 }, { unique: true });
StockAlertSchema.index({ notified: 1 });

export const StockAlert: Model<IStockAlert> =
  mongoose.models.StockAlert || mongoose.model<IStockAlert>("StockAlert", StockAlertSchema);
