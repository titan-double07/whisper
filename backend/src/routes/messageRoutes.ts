import { Router } from "express";
import { getMessages } from "../controllers/messageController";
import { protectedRoute } from "../middleware/auth";

const router = Router();

router.get("/chat/:chatId", protectedRoute, getMessages);

export default router;
