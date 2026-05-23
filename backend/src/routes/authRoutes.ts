import { Router } from "express";
import { protectedRoute } from "../middleware/auth";
import { getMe, authCallback } from "../controllers/authController";

const router = Router();

router.get("/me", protectedRoute, getMe);
router.post("/callback", authCallback);

export default router;
