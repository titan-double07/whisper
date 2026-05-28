import { Router } from "express";
import { protectedRoute } from "../middleware/auth";
import { getUser } from "../controllers/userController";

const router = Router();

router.get("/", protectedRoute, getUser);

export default router;
