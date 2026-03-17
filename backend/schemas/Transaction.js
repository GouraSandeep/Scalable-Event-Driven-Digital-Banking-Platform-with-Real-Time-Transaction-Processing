import mongoose from "mongoose";

export const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    index: true,
  },

  senderAccount: String,
  receiverAccount: String,

  amount: {
    type: Number,
    required: true,
  },

  type: {
    type: String,
    enum: ["deposit", "withdraw", "transfer"],
    required: true,
  },

  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "SUCCESS",
  },

  date: {
    type: Date,
    default: Date.now,
  },
});
