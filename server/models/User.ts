import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  pseudonym: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    pseudonym: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
