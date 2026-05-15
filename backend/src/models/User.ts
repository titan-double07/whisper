// User model using Mongoose
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
 