const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teamMemberSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  jobTitle: String,
  email: { type: String, unique: true },
  password: String,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tasks" }],
});

teamMemberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

module.exports = TeamMember;
// export default TeamMember;
