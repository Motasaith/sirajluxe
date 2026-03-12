import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventoryReservation extends Document {
  productId: mongoose.Types.ObjectId;
  variantKey: string; // "color:size" or "" for global
  quantity: number;
  sessionId: string; // clerkUserId or anonymous session ID
  expiresAt: Date;
  createdAt: Date;
}

const InventoryReservationSchema = new Schema<IInventoryReservation>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantKey: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    sessionId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — MongoDB automatically removes documents when expiresAt passes
InventoryReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
InventoryReservationSchema.index({ sessionId: 1 });
InventoryReservationSchema.index({ productId: 1, variantKey: 1 });

export const InventoryReservation: Model<IInventoryReservation> =
  mongoose.models.InventoryReservation ||
  mongoose.model<IInventoryReservation>("InventoryReservation", InventoryReservationSchema);
