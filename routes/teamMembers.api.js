const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectId;
const TeamMember = require("../models/teamMemberModel");
const Task = require("../models/taskModel");
// import { TeamMember } from "../models/teamMemberModel";

router.get("/", async (req, res, next) => {
  try {
    const teamMembers = await TeamMember.find({});
    console.log(teamMembers);
    res.status(200).json(teamMembers);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Problème interne du serveur, nous nous excusons pour la gêne occasionnée"
      );
  }
});

module.exports = router;
