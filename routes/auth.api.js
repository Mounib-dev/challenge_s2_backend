import express from "express";
import { ObjectId as ObjectID } from "mongodb";
import TeamMember from "../models/teamMemberModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js";
import { validateLogin } from "../middleware/validators.js";

const router = express.Router();

router.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const teamMember = await TeamMember.findOne({ email });
    if (!teamMember) {
      return res.status(404).json({
        message: "We couldn't find an account associated with this email.",
      });
    }
    const isMatch = await bcrypt.compare(password, teamMember.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: teamMember._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    res.status(200).json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Sorry, something went wrong with our server." });
  }
});

router.get("/user", auth, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving the user" });
  }
});

export default router;
