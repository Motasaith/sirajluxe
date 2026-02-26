import mongoose, { Schema, Document } from "mongoose";

export interface ISiteContent extends Document {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  enabled: boolean;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SiteContent =
  mongoose.models.SiteContent ||
  mongoose.model<ISiteContent>("SiteContent", SiteContentSchema);
