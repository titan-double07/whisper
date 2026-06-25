import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { verifyToken } from "@clerk/express";
import { Types } from "mongoose";
import { User } from "../models/User";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";

// This map stores online users in memory. Key: userId, Value: socketId
const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HttpServer) => {
  // Define allowed origins for CORS. Prioritizes production URL.
  const allowedOrigins = [
    process.env.FRONTEND_URL, // Deployed frontend
    "http://localhost:5173", // Local web dev
    "http://localhost:8081", // Expo mobile dev
  ].filter(Boolean) as string[];

  const io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  /**
   * Socket.IO authentication middleware.
   * This runs for every incoming connection before the 'connection' event is fired.
   * It verifies the Clerk JWT token sent by the client.
   */
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // Token sent from the client
    if (!token) {
      return next(new Error("Authentication error: No token provided."));
    }

    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      // Find the user in our database corresponding to the Clerk user
      const clerkId = session.sub;
      const user = await User.findOne({ clerkId });
      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }

      // Attach our internal user ID to the socket instance for use in event handlers
      socket.data.userId = user._id.toString();
      next(); // Proceed to the 'connection' event
    } catch (error: any) {
      // Log the error and deny the connection
      console.error("Socket authentication failed:", error.message);
      next(new Error("Authentication error: Invalid token."));
    }
  });

  /**
   * Main 'connection' event handler.
   * This is triggered after a client has successfully authenticated.
   */
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User connected: ${userId} (Socket: ${socket.id})`);

    // --- Online Status and Initial Setup ---

    // 1. Add user to the online users map
    onlineUsers.set(userId, socket.id);

    // 2. Join the user to their own private room for personal notifications
    socket.join(`user:${userId}`);

    // 3. Send the list of all currently online users to the newly connected client
    socket.emit("online-users", Array.from(onlineUsers.keys()));

    // 4. Notify all other clients that this user has come online
    socket.broadcast.emit("user-online", userId);

    // --- Event Listeners ---

    // Listens for a client joining a specific chat room
    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
      console.log(`User ${userId} joined chat room: ${chatId}`);
    });

    // Listens for a client leaving a specific chat room
    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${userId} left chat room: ${chatId}`);
    });

    // Handles incoming messages from a client
    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { chatId, text } = data;
          const senderId = socket.data.userId;

          // Security: Ensure the sender is actually a participant in the chat
          const chat = await Chat.findOne({
            _id: new Types.ObjectId(chatId),
            participants: new Types.ObjectId(senderId),
          });

          if (!chat) {
            socket.emit("socket-error", { message: "Chat not found or you are not a participant." });
            return;
          }

          // 1. Create the message in the database
          const message = await Message.create({
            chat: chat._id,
            sender: senderId,
            text,
          });

          // 2. Update the chat's last message for sorting and preview
          chat.lastMessage = message._id;
          chat.lastMessageAt = new Date();
          await chat.save();

          // 3. Populate sender details for the client
          const populatedMessage = await message.populate("sender", "name email avatar");

          // 4. Emit the new message to all clients in the chat room (for the active chat view)
          io.to(`chat:${chatId}`).emit("new-message", populatedMessage);

          // 5. Emit a notification to each participant's private room (for chat list updates and notifications)
          chat.participants.forEach((participantId) => {
            const participantStrId = participantId.toString();
            // Optimization: Don't send a notification to the sender
            if (participantStrId !== senderId) {
              io.to(`user:${participantStrId}`).emit(
                "new-message-notification",
                populatedMessage,
              );
            }
          });
        } catch (error) {
          console.error("Error in send-message:", error);
          socket.emit("socket-error", { message: "Failed to send message." });
        }
      },
    );

    // Handles typing indicators from clients
    socket.on("typing", (data: { chatId: string; isTyping: boolean }) => {
      // Broadcast to other users in the chat room that this user is typing
      socket.to(`chat:${data.chatId}`).emit("typing", {
        userId: socket.data.userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      });
    });

    // --- Disconnect Handler ---

    // This event is fired when a client disconnects
    socket.on("disconnect", () => {
      const userIdToDisconnect = socket.data.userId;
      if (userIdToDisconnect) {
        onlineUsers.delete(userIdToDisconnect);
        // Notify all other clients that this user has gone offline
        io.emit("user-offline", userIdToDisconnect);
        console.log(`❌ User disconnected: ${userIdToDisconnect}`);
      }
    });
  });

  console.log("🚀 Socket.IO server initialized successfully.");
  return io;
};
