const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectId;
const Team = require("../models/teamModel");
const TeamMember = require("../models/teamMemberModel");

// Route pour obtenir toutes les équipes
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

// Route pour afficher la liste des équipes sans type
router.get("/teams", async (req, res, next) => {
  try {
    const teams = await Team.find({ type: { $exists: false } });
    if (teams.length > 0) {
      return res.status(200).json(teams);
    }
    return res.status(400).json({ message: "No teams found" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Sorry, something went wrong with the server");
  }
});


// Route pour créer une équipe avec les membres
router.post("/create", async (req, res, next) => {
  const { name, creationDate, description, members } = req.body;

  try {
    // Récupérer les membres à partir de leurs id
    // const members = await TeamMember.find({ _id: { $in: members } });

    const newTeam = new Team({
      name,
      creation_date: creationDate,
      description,
      members: members, 
    });

    await newTeam.save();

    return res.status(201).json({ message: "Team created successfully", team: newTeam });
  } catch (err) {
    console.error(err);
    if (err.code == 11000) {
      return res.status(409).send("Team already exists");
    }
    return res.status(500).send("Sorry, something went wrong with the server");
  }
});


// Route pour éditer une équipe
router.put("/edit/:id", async (req, res, next) => {
  const id = req.params.id;
  const { name, creationDate, description, type } = req.body;

  const updatedFields = {
    name,
    creation_date: creationDate,
    description,
  };

  if (type) {
    updatedFields.type = type;
  }

  try {
    const result = await Team.updateOne(
      { _id: new ObjectID(id) },
      {
        $set: updatedFields,
      }
    );
    if (result.matchedCount > 0) {
      res.status(200).send("Team edited");
    } else {
      res.status(404).send("Team not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Sorry, something went wrong with the server");
  }
});

// Route pour supprimer une équipe
router.delete("/delete/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await Team.deleteOne({ _id: new ObjectID(id) });
    if (result.deletedCount === 1) {
      res.status(200).send("Team deleted");
    } else {
      res.status(404).send("Team not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Sorry, something went wrong with the server");
  }
});

module.exports = router;
