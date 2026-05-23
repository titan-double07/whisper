import { getAuth, clerkClient } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import type { AuthRequest } from "../middleware/auth";

// Controller to handle authentication callback from Clerk
export const authCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No Clerk ID found" });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      // Fetch full user details from Clerk to sync with our database
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      let name =
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

      if (!name && email) {
        name = email.split("@")[0] ?? "Anonymous";
      }

      user = await User.create({
        clerkId,
        email,
        name: name ,
        avatar: clerkUser.imageUrl,
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Controller to get the authenticated user's details
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found in request" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error); // Pass errors to the error handling middleware
  }
};
