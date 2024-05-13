const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  jobTitle: String,
  email: { type: String, unique: true },
  password: String,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tasks" }],
});

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

module.exports = TeamMember;
// export default TeamMember;
