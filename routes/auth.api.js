const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectId;
const TeamMember = require("../models/teamMemberModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const { validateLogin } = require("../middleware/validators");

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
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
});

module.exports = router;
