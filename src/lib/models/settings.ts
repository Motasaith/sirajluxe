import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  key: string;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  shippingFlatRate: number;
  lowStockThreshold: number;
  orderPrefix: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    facebook: string;
    tiktok: string;
  };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, default: "global", unique: true },
    storeName: { type: String, default: "Siraj Luxe" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    currency: { type: String, default: "GBP" },
    taxRate: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 10 },
    shippingFlatRate: { type: Number, default: 4.99 },
    lowStockThreshold: { type: Number, default: 5 },
    orderPrefix: { type: String, default: "SL" },
    socialLinks: {
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
