import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface ICustomer extends Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  orderCount: number;
  totalSpent: number;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "GB" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true }
);

CustomerSchema.index({ email: 1 });

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
