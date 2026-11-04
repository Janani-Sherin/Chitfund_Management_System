import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in the .env file.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}
