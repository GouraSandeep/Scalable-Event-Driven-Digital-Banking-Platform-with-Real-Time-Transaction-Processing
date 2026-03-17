import express from "express";
import Account from "../models/Account.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { AccountSchema } from "../validators/Account.js";
import argon2 from "argon2";

const router = express.Router();

router.get("/my", requireAuth, async (req, res) => {
  try {
    const account = await Account.findOne({
      userId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const user = await User.findById(req.user._id).select("-password");

    res.json({
      username: user.username,
      email: user.email,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
    });
  } catch (err) {
    console.log("PROFILE ERROR:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
});

// CREATE ACCOUNT
router.post("/create", requireAuth, async (req, res) => {
  try {
    const { error, value } = AccountSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { accountType, mpin } = value;

    const hashed = await argon2.hash(mpin);

    let accountNumber;
    let exists = true;

    while (exists) {
      accountNumber = "ACC" + Math.floor(10000000 + Math.random() * 90000000);
      exists = await Account.findOne({ accountNumber });
    }

    const acc = await Account.create({
      userId: req.user._id,
      accountNumber,
      accountType,
      mpin: hashed,
    });

    res.status(201).json(acc);
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
});

router.post("/change-mpin", requireAuth, async (req, res) => {
  try {
    const { oldMpin, newMpin } = req.body;

    if (!oldMpin || !newMpin) {
      return res.status(400).json({ message: "All fields required" });
    }

    const account = await Account.findOne({ userId: req.user._id });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const valid = await argon2.verify(account.mpin, oldMpin);

    if (!valid) {
      return res.status(401).json({ message: "Incorrect MPIN" });
    }

    const hashed = await argon2.hash(newMpin);

    account.mpin = hashed;
    await account.save();

    res.json({ message: "MPIN changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
