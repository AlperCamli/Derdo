import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReport extends Document {
  reporter: Types.ObjectId;
  targetProblem?: Types.ObjectId;
  targetMessage?: Types.ObjectId;
  reason: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetProblem: { type: Schema.Types.ObjectId, ref: "ProblemPost" },
    targetMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    reason: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IReport>("Report", ReportSchema);
