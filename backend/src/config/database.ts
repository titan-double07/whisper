import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function connectDatabase(): Promise<void> {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined");
    throw new Error("MONGODB_URI is not defined");  
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}
