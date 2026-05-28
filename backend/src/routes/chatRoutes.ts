import { Router } from "express";
import { getChats, getOrCreateChat } from "../controllers/chatController";
import { protectedRoute } from "../middleware/auth";

const router = Router();

router.get("/", protectedRoute, getChats);
router.get("/with/:participantId", protectedRoute, getOrCreateChat);

export default router;
