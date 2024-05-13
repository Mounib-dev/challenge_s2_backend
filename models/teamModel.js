const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: String,
  creationDate: Date,
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" }],
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
