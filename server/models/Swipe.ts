import mongoose, { Document, Schema, Types } from "mongoose";

export type SwipeDirection = "left" | "right";

export interface ISwipe extends Document {
  swiper: Types.ObjectId;
  problem: Types.ObjectId;
  direction: SwipeDirection;
  createdAt: Date;
}

const SwipeSchema = new Schema<ISwipe>(
  {
    swiper: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "ProblemPost", required: true },
    direction: { type: String, enum: ["left", "right"], required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SwipeSchema.index({ swiper: 1, problem: 1 }, { unique: true });

export default mongoose.model<ISwipe>("Swipe", SwipeSchema);
