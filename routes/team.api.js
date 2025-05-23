import express from "express";
import { ObjectId as ObjectID } from "mongodb";
import Team from "../models/teamModel.js";
import auth from "../middleware/auth.js";
import TeamMember from "../models/teamMemberModel.js";

const router = express.Router();

// Retrieve teams Endpoint
router.get("/", auth, async (req, res, next) => {
  if (req.query.getCount) {
    try {
      const teamsCount = await Team.countDocuments();
      console.log(teamsCount);
      return res.status(200).json(teamsCount);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  }
  try {
    const teams = await Team.find().populate(
      "members",
      "firstname lastname jobTitle _id"
    );
    if (teams.length > 0) {
      return res.status(200).json(teams);
    }
    return res.status(400).json({ message: "No teams found" });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Sorry, something went wrong with the server");
  }
});

// Route pour obtenir une équipe par son ID
router.get("/:id", auth, async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const team = await Team.findById(teamId).populate(
      "members",
      "firstname lastname"
    );
    if (team) {
      return res.status(200).json(team);
    } else {
      return res.status(404).send({ message: "Team not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Sorry, something went wrong with the server");
  }
});

// Route pour créer une équipe sans membres
router.post("/create", auth, async (req, res, next) => {
  const { name, creationDate, description } = req.body;

  try {
    const newTeam = new Team({
      name,
      creationDate,
      description,
      members: [],
    });

    await newTeam.save();

    return res
      .status(201)
      .json({ message: "Team created successfully", team: newTeam });
  } catch (err) {
    console.error(err);
    if (err.code == 11000) {
      return res.status(409).send("Team already exists");
    }
    return res.status(500).send("Sorry, something went wrong with the server");
  }
});
// Route pour éditer une équipe
router.put("/edit/:id", auth, async (req, res, next) => {
  const id = req.params.id;
  const { name, creationDate, description, members } = req.body;
  const updatedFields = {
    name,
    creationDate,
    description,
    members,
  };

  try {
    const result = await Team.updateOne(
      { _id: new ObjectID(id) },
      {
        $set: updatedFields,
      }
    );

    return res.status(204).send("Team successefuly edited");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Sorry, something went wrong with the server");
  }
});

// Route pour supprimer une équipe
router.delete("/delete/:id", auth, async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await Team.deleteOne({ _id: new ObjectID(id) });
    if (result.deletedCount === 1) {
      return res.status(200).send("Team deleted");
    } else {
      return res.status(404).send("Team not found");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Sorry, something went wrong with the server");
  }
});

export default router;
