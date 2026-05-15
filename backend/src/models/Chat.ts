// Chat model using Mongoose
import { Schema, model, Document, Types } from 'mongoose';

export interface IChat extends Document {
  participants: Types.ObjectId[]; // references to User
  lastMessage?: Types.ObjectId; // reference to Message
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for faster queries
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });

export const Chat = model<IChat>('Chat', ChatSchema);
