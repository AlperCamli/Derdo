import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMatch extends Document {
  problem: Types.ObjectId;
  owner: Types.ObjectId;
  helper: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    problem: { type: Schema.Types.ObjectId, ref: "ProblemPost", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    helper: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

MatchSchema.index(
  { problem: 1, owner: 1, helper: 1 },
  { unique: true }
);

export default mongoose.model<IMatch>("Match", MatchSchema);
