import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } },
);

export default mongoose.model("Owner", ownerSchema);
