import mongoose from "mongoose";

export const withdrawSchema = new mongoose.Schema({
  account: { type: String, required: true },
  amount: { type: Number },
  date: { type: Date, default: Date.now },
});
