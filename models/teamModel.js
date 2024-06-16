import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  creationDate: Date,
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" }],
});

const Team = mongoose.model("Team", teamSchema);

export default Team;
