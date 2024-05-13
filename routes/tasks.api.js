const express = require("express");
const router = express.Router();
const Task = require("../models/taskModel");

router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({});
    console.log(tasks);
    res.status(200).json(tasks);
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
