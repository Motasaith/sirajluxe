import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
  productId: mongoose.Types.ObjectId;
  clerkUserId: string;
  userName: string;
  question: string;
  answer?: string;
  answeredAt?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    clerkUserId: { type: String, required: true },
    userName: { type: String, required: true },
    question: { type: String, required: true, maxlength: 500 },
    answer: { type: String, default: "", maxlength: 1000 },
    answeredAt: { type: Date },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ productId: 1, createdAt: -1 });
QuestionSchema.index({ isPublished: 1 });

export const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
