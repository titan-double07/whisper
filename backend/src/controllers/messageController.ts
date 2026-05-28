import type { NextFunction, Response } from "express";
import { Types } from "mongoose";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";

type GetMessagesRequest = AuthRequest & {
  params: {
    chatId: string;
  };
};

export const getMessages = async (
  req: GetMessagesRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Ensure auth middleware has attached the internal user id.
    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found in request" });
    }

    const { chatId } = req.params;

    // Validate chat id before using it in Mongo queries.
    if (!Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    // Restrict access: only chat participants can read messages.
    const chat = await Chat.findOne({
      _id: chatId,
      participants: new Types.ObjectId(req.userId),
    });

    if (!chat) {
      return res
        .status(404)
        .json({ message: "Chat not found or access denied" });
    }

    // Return messages oldest to newest for natural conversation order.
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
