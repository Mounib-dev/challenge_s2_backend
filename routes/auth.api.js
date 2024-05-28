const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectId;
const TeamMember = require("../models/teamMemberModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const teamMember = await TeamMember.findOne({ email });
    if (!teamMember) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, teamMember.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: teamMember._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/user", auth, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
});

module.exports = router;
