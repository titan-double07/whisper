import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

export const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Ensure the authenticated user ID was attached by the auth middleware
    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found in request" });
    }

    // Retrieve the user document from the database using the ID from the request
    const user = await User.findById(req.userId);

    // If no user matches the ID, respond with 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Successful lookup – return the user data (JSON excludes password by schema settings)
    res.status(200).json(user);
  } catch (error) {
    // Forward any unexpected errors to the global error handler
    next(error);
  }
};
