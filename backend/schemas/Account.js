import mongoose from "mongoose";

export const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  accountNumber: { type: String, unique: true },
  accountType: {
    type: String,
    enum: ["savings", "current"],
    default: "savings",
  },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "frozen"], default: "active" },
  mpin: { type: String, required: true },
});
