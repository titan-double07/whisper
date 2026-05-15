import express, { type Express } from "express";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// test
app.get("/", (req, res) => {
  res.json({ message: "Hello via Bun!" });
});

// Routes

app.use("api/auth", authRoutes);
app.use("api/chat", chatRoutes);
app.use("api/messages", messageRoutes);
app.use('api/users', userRoutes)

export default app;
