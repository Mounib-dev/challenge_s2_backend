const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectId;
const Team = require("../models/teamModel");

router.get("/", async (req, res, next) => {
  try {
    const teams = await Team.find({});
    console.log(teams);
    res.status(200).json(teams);
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
