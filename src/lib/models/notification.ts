import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType =
  | "new_order"
  | "return_request"
  | "low_stock"
  | "new_review"
  | "new_question"
  | "refund_issued";

export interface INotification extends Document {
  type: NotificationType;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ["new_order", "return_request", "low_stock", "new_review", "new_question", "refund_issued"],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// TTL: auto-delete after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
NotificationSchema.index({ read: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
