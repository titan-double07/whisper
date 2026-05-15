// Message model using Mongoose
import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  chat: Types.ObjectId; // reference to Chat
  sender: Types.ObjectId; // reference to User
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for fast lookup
//find the newest messages of a chat quickly
MessageSchema.index({ chat: 1, createdAt: -1 });
// find all messages sent by a particular user fast
MessageSchema.index({ sender: 1 });

export const Message = model<IMessage>('Message', MessageSchema);
