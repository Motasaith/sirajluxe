import mongoose, { Schema, Document } from "mongoose";

export interface ITicketMessage {
  sender: "customer" | "admin";
  content: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  ticketNumber: string;
  clerkUserId: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  category: "order" | "product" | "shipping" | "return" | "payment" | "other";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  messages: ITicketMessage[];
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    sender: { type: String, enum: ["customer", "admin"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    clerkUserId: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ["order", "product", "shipping", "return", "payment", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    messages: [TicketMessageSchema],
    orderId: { type: String, default: "" },
  },
  { timestamps: true }
);

TicketSchema.index({ clerkUserId: 1, createdAt: -1 });
TicketSchema.index({ status: 1, createdAt: -1 });

export const Ticket =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);
