import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import Transaction from "../models/Transaction.js";
import BankService from "../services/BankService.js";
import Account from "../models/Account.js";
import { TransactionSchema } from "../validators/Transaction.js";
import { depositSchema } from "../validators/Deposite.js";
import { WithdrawSchema } from "../validators/Withdraw.js";
import argon2 from "argon2";
import { transactionQueue } from "../queue/transactionQueue.js";
import { v4 as uuid } from "uuid";
import redis from "../queue/redisConnection.js";

const router = express.Router();

router.post("/deposit", requireAuth, async (req, res) => {
  try {
    const { error, value } = depositSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details[0].message,
      });
    }

    const { amount, mpin } = value;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!mpin) {
      return res.status(400).json({ message: "MPIN required" });
    }

    const acc = await Account.findOne({ userId: req.user._id });

    if (!acc) {
      return res.status(404).json({ message: "Account not found" });
    }

    //  VERIFY MPIN
    const validMpin = await argon2.verify(acc.mpin, mpin);

    if (!validMpin) {
      return res.status(401).json({ message: "Invalid MPIN" });
    }

    const updated = await BankService.deposit(
      acc.accountNumber,
      Number(amount),
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/withdraw", requireAuth, async (req, res) => {
  try {
    const { error, value } = WithdrawSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details[0].message,
      });
    }

    const { amount, mpin } = value;

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid Amount",
      });
    }

    const acc = await Account.findOne({ userId: req.user._id });

    if (!acc) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (acc.balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const validMpin = await argon2.verify(acc.mpin, mpin);

    if (!validMpin) {
      return res.status(401).json({ message: "Invalid MPIN" });
    }

    const updated = await BankService.withdraw(
      acc.accountNumber,
      Number(amount),
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/transfer", requireAuth, async (req, res) => {
  const txnId = uuid();
  console.log(" TRANSFER API HIT", txnId);

  const lockKey = `txn:${txnId}`;

  const lock = await redis.set(lockKey, "LOCKED", "NX", "EX", 120);

  if (!lock) {
    return res.status(409).json({
      message: "Duplicate transaction request",
    });
  }

  try {
    const { error, value } = TransactionSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details[0].message,
      });
    }

    const { receiverAccount, amount, mpin } = value;

    if (!receiverAccount) {
      return res.status(400).json({ message: "Receiver account is required" });
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const senderAcc = await Account.findOne({ userId: req.user._id });
    if (!senderAcc) {
      return res.status(404).json({ message: "Sender account not found" });
    }

    if (senderAcc.balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    if (senderAcc.accountNumber === receiverAccount) {
      return res.status(400).json({
        message: "Sender and receiver account cannot be same",
      });
    }

    const receiverExists = await Account.findOne({
      accountNumber: receiverAccount,
    });

    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver account not found" });
    }

    if (senderAcc.accountType == "current") {
      if (senderAcc.balance - amount < 5000) {
        const amm = senderAcc.balance - 5000;
        return res.status(400).json({
          message: "limit overdraft",
        });
      }
    }

    const validMpin = await argon2.verify(senderAcc.mpin, mpin);

    if (!validMpin) {
      return res.status(401).json({ message: "Invalid MPIN" });
    }

    await Transaction.create({
      transactionId: txnId,
      senderAccount: senderAcc.accountNumber,
      receiverAccount,
      amount,
      type: "transfer",
      status: "PENDING",
    });

    await transactionQueue.add("transferJob", {
      transactionId: txnId,
      senderAccount: senderAcc.accountNumber,
      receiverAccount,
      amount: Number(amount),
    });

    res.status(202).json({
      message: "Transaction initiated",
      transactionId: txnId,
      status: "PENDING",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const acc = await Account.findOne({ userId: req.user._id });

    if (!acc) {
      return res.status(404).json({ message: "Account not found" });
    }

    const history = await Transaction.find({
      $or: [
        { senderAccount: acc.accountNumber },
        { receiverAccount: acc.accountNumber },
      ],
    }).sort({ date: -1 });

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
