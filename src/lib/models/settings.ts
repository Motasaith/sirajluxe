import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITaxRule {
  country: string;  // ISO 2-letter code, e.g. "GB"
  rate: number;     // percentage, e.g. 20 for 20%
  name: string;     // e.g. "UK VAT", "DE MwSt"
}

export interface IWeightTier {
  maxWeight: number;  // kg — orders up to this weight
  rate: number;       // £ — shipping cost for this tier
}

export interface IShippingZone {
  name: string;
  countries: string[];
  rate: number;
  minOrderFree: number; // 0 = never free
  weightTiers: IWeightTier[]; // optional weight-based rate overrides
}

export interface ISettings extends Document {
  key: string;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  currency: string;
  taxRate: number;
  enableStripeTax: boolean;
  taxRules: ITaxRule[];
  freeShippingThreshold: number;
  shippingFlatRate: number;
  lowStockThreshold: number;
  orderPrefix: string;
  shippingZones: IShippingZone[];
  socialLinks: {
    instagram: string;
    twitter: string;
    facebook: string;
    tiktok: string;
  };
  updatedAt: Date;
}

const TaxRuleSchema = new Schema<ITaxRule>(
  {
    country: { type: String, required: true },
    rate: { type: Number, required: true, min: 0, max: 100 },
    name: { type: String, required: true },
  },
  { _id: true }
);

const WeightTierSchema = new Schema<IWeightTier>(
  {
    maxWeight: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingZoneSchema = new Schema<IShippingZone>(
  {
    name: { type: String, required: true },
    countries: { type: [String], default: [] },
    rate: { type: Number, required: true },
    minOrderFree: { type: Number, default: 0 },
    weightTiers: { type: [WeightTierSchema], default: [] },
  },
  { _id: true }
);

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, default: "global", unique: true },
    storeName: { type: String, default: "Siraj Luxe" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    currency: { type: String, default: "GBP" },
    taxRate: { type: Number, default: 0 },
    enableStripeTax: { type: Boolean, default: false },
    taxRules: { type: [TaxRuleSchema], default: [] },
    freeShippingThreshold: { type: Number, default: 10 },
    shippingFlatRate: { type: Number, default: 4.99 },
    lowStockThreshold: { type: Number, default: 5 },
    orderPrefix: { type: String, default: "SL" },
    shippingZones: { type: [ShippingZoneSchema], default: [] },
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
