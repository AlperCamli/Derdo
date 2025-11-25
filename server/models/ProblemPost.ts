import mongoose, { Document, Schema, Types } from "mongoose";

export type ProblemCategory =
  | "financial"
  | "relationship"
  | "career"
  | "daily"
  | "other";

export interface IProblemPost extends Document {
  owner: Types.ObjectId;
  title: string;
  description: string;
  category: ProblemCategory;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemPostSchema = new Schema<IProblemPost>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 80 },
    description: { type: String, required: true, maxlength: 500 },
    category: {
      type: String,
      required: true,
      enum: ["financial", "relationship", "career", "daily", "other"]
    },
    isOpen: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IProblemPost>("ProblemPost", ProblemPostSchema);
