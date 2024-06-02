const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectId;
const TeamMember = require("../models/teamMemberModel");
const Task = require("../models/taskModel");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res, next) => {
  console.log("req.query: ", req.query);
  if (Object.keys(req.query).length === 0) {
    try {
      const teamMembers = await TeamMember.find({}, { password: 0 });
      console.log(teamMembers);
      return res.status(200).json(teamMembers);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send(
          "Problème interne du serveur, nous nous excusons pour la gêne occasionnée"
        );
    }
  }
  if (req.query.id) {
    console.log(req.query.id);
    const id = req.query.id;
    try {
      const teamMember = await TeamMember.findOne(
        {
          _id: new ObjectID(id),
        },
        { password: 0 }
      );
      console.log(teamMember);
      if (!teamMember) {
        return res.status(404).json({ message: "Employee not found" });
      }
      return res.status(200).json(teamMember);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Sorry something went wrong with the server");
    }
  }
});

router.post("/", async (req, res, next) => {
  const { firstname, lastname, jobTitle, email, password, tasks } = req.body;
  const teamMember = { firstname, lastname, jobTitle, email, password, tasks };
  console.log("Team Member to add: ", teamMember);
  try {
    const newTeamMember = new TeamMember(teamMember);
    await newTeamMember.save();
    res.status(201).send("Team member successefuly added!");
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).send("The member you try to enter already exists");
    }
    return res.status(500).send("Sorry something went wrong with the server");
  }
});

router.put("/", async (req, res, next) => {
  const { firstname, lastname, jobTitle, email, password, tasks } = req.body;
  const editedTeamMember = {
    firstname,
    lastname,
    jobTitle,
    email,
    password,
    tasks,
  };
  const id = req.query.id;
  const edit = req.query.edit;
  if (edit) {
    try {
      if (editedTeamMember.password) {
        const salt = await bcrypt.genSalt(10);
        editedTeamMember.password = await bcrypt.hash(
          editedTeamMember.password,
          salt
        );
      }
      const updatedTeamMmember = await TeamMember.updateOne(
        { _id: new ObjectID(id) },
        {
          $set: editedTeamMember,
        },
        { runValidators: true }
      );
      if (!updatedTeamMmember) {
        return res
          .status(404)
          .send("Impossible de modifier ce membre, il n'existe pas");
      }
      return res.status(200).send("Votre modification a été prise en compte");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Sorry something went wrong with the server");
    }
  }
  return res.status(500).send("Sorry, server encountered an error");
});

router.delete("/", async (req, res, next) => {
  const id = req.query.id;
  try {
    await TeamMember.deleteOne({
      _id: new ObjectID(id),
    });
    return res.status(204).send("Membre d'équipe supprimé");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Sorry, something went wrong with the server");
  }
});

module.exports = router;
