import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  photo_url?: string | null;
  created_at: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo_url: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});


export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
