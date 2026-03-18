import express from "express";
import argon2 from "argon2";
import User from "../models/User.js";
import { UserSchema } from "../validators/User.js";
import { loginSchema } from "../validators/Login.js";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { error, value } = UserSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (error) {
      console.log(error.details);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, role } = value;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).json({ message: "User already exists" });
    }

    const hashedPassword = await argon2.hash(password);

    await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: "signup successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.details[0].message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (error) return res.status(400).json({ message: "validation error" });
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "user not found" });
    const valid = await argon2.verify(user.password, password);
    if (!valid) return res.status(401).json({ message: "invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "login success", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const user = await User.findById(req.user._id);

    const valid = await argon2.verify(user.password, oldPassword);

    if (!valid) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }

    const hashed = await argon2.hash(newPassword);

    user.password = hashed;

    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;
