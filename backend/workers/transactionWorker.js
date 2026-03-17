import { Worker } from "bullmq";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import connection from "../queue/redisConnection.js";
import BankService from "../services/BankService.js";
import Transaction from "../models/Transaction.js";
import "dotenv/config";

await connectDB();

console.log(" Transaction Worker Started");

new Worker(
  "transactionQueue",
  async (job) => {
    const { transactionId, senderAccount, receiverAccount, amount } = job.data;

    const txn = await Transaction.findOneAndUpdate(
      { transactionId, status: "PENDING" },
      { status: "PROCESSING" },
    );

    if (!txn) {
      console.log(" Already processing / processed");
      return;
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await BankService.transfer(
          senderAccount,
          receiverAccount,
          amount,
          session,
        );

        await Transaction.updateOne(
          { transactionId },
          { status: "SUCCESS", completedAt: new Date() },
          { session },
        );
      });

      await connection.del(`txn:${transactionId}`);

      console.log(" TRANSFER SUCCESS");
    } catch (err) {
      await Transaction.updateOne({ transactionId }, { status: "FAILED" });

      throw err;
    } finally {
      session.endSession();
    }
  },
  { connection, concurrency: 5 },
);

setInterval(() => {}, 1000);
