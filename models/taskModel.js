import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  priority: { type: String, enum: ["Low", "Medium", "High"] },
  deadline: Date,
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" }],
});

const Task = mongoose.model("Tasks", taskSchema);

export default Task;
