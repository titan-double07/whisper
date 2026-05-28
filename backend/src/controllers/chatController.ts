import type { NextFunction, Response } from "express";
import { Types } from "mongoose";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../models/Chat";
import { User } from "../models/User";

type GetOrCreateChatRequest = AuthRequest & {
  params: {
    participantId: string;
  };
};

export const getChats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Verify that the auth middleware attached a userId
    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found in request" });
    }

    // Find all chats where the requester is a participant
    const chats = await Chat.find({
      participants: new Types.ObjectId(req.userId),
    })
      // Populate participant details (name, email, avatar)
      .populate("participants", "name email avatar")
      // Populate the last message and its sender details
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email avatar" },
      })
      // Sort newest activity first (by lastMessageAt, then updatedAt)
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    // Return the list of chats
    res.status(200).json(chats);
  } catch (error) {
    // Forward errors to the global error handler
    next(error);
  }
};

export const getOrCreateChat = async (
  req: GetOrCreateChatRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Ensure the request is authenticated
    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found in request" });
    }

    const { participantId } = req.params;

    // Validate that the provided participantId is a valid Mongo ObjectId
    if (!Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participantId" });
    }

    if (!Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ message: "Invalid authenticated userId" });
    }

    const currentUserObjectId = new Types.ObjectId(req.userId);
    const participantObjectId = new Types.ObjectId(participantId);

    // Prevent a user from creating a chat with themselves
    if (participantId === req.userId) {
      return res
        .status(400)
        .json({ message: "Cannot create a chat with yourself" });
    }

    // Verify that the participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Try to find an existing one‑to‑one chat between the two users
    let chat = await Chat.findOne({
      participants: {
        // Both user IDs must be present in the participants array
        $all: [currentUserObjectId, participantObjectId],
      },
      // Ensure the chat contains exactly two participants
      $expr: { $eq: [{ $size: "$participants" }, 2] },
    })
      .populate("participants", "name email avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name email avatar" },
      });

    // If no chat exists, create a new one
    if (!chat) {
      const createdChat = await Chat.create({
        participants: [currentUserObjectId, participantObjectId],
      });

      // Populate the newly created chat before sending it back
      chat = await Chat.findById(createdChat._id)
        .populate("participants", "name email avatar")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "name email avatar" },
        });
    }

    if (!chat) {
      return res.status(500).json({ message: "Failed to load created chat" });
    }

    // Return the found or newly created chat
    res.status(200).json(chat);
  } catch (error) {
    // Pass unexpected errors to the error‑handling middleware
    next(error);
  }
};
