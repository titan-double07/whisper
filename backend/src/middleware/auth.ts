import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User";

 export interface AuthRequest extends Request {
  userId?: string;
}

export const protectedRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized: No Clerk ID found" });
      return;
    }

    // Find the internal user by their Clerk ID
    const user = await User.findOne({ clerkId });

    if (!user) {
      res.status(404).json({ message: "User not found in database" });
      return;
    }

    // Attach the database _id to the request
    req.userId = user._id.toString();
    next();
  } catch (error) {
    next(error);
  }
};
