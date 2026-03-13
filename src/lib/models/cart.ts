import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

export interface ICart extends Document {
  clerkUserId?: string;
  sessionId?: string;
  email?: string;
  items: ICartItem[];
  abandonedEmailSent: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    clerkUserId: { type: String, index: true },
    sessionId: { type: String, index: true },
    email: { type: String, default: "" },
    items: { type: [CartItemSchema], default: [] },
    abandonedEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CartSchema.index({ updatedAt: 1 });
CartSchema.index({ clerkUserId: 1 });
CartSchema.index({ sessionId: 1 });

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
