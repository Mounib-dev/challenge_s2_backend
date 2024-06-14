import express from "express";
import Task from "../models/taskModel.js";
import TeamMember from "../models/teamMemberModel.js";
import { ObjectId as ObjectID } from "mongodb";

const router = express.Router();

// Create a new task Endpoint
router.post("/", async (req, res) => {
  try {
    const task = new Task(req.body);
    const newTask = await task.save();
    //Update the employee tasks array
    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      newTask.assignedTo,
      {
        $addToSet: { tasks: newTask._id },
      }
    );
    if (!updatedTeamMember) {
      return res.status(201).json({
        message: "Task created but not synchronized with the team member",
      });
    }
    return res.status(201).json({
      message: `Successefuly created the task and it\'s assigned to ${updatedTeamMember.firstname} ${updatedTeamMember.lastname}`,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).send("Tâche déjà existante");
    }
    return res.status(500).json({ message: err.message });
  }
});

// Tasks list Endpoint
router.get("/", async (req, res) => {
  if (req.query.getCount) {
    try {
      const tasksCount = await Task.countDocuments();
      console.log(tasksCount);
      return res.status(200).json(tasksCount);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  }
  try {
    const tasks = await Task.find().populate(
      "assignedTo",
      "firstname lastname"
    );
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Task by ID Endpoint
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(task);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Update task Endpoint
router.put("/:id", async (req, res) => {
  console.log(req.body);
  const updatedTask = req.body;
  try {
    //À terminer demain
    const taskBeforeUpdate = await Task.findByIdAndUpdate(
      req.params.id,
      updatedTask,
      {
        new: false,
      }
    );
    if (!taskBeforeUpdate) {
      return res.status(404).json({ message: "Task not found" });
    }
    console.log(
      "taskBeforeUpdate ID ********************",
      taskBeforeUpdate._id
    );
    console.log(updatedTask.assignedTo);
    console.log(updatedTask._id);
    // const updatedTeamMember = await TeamMember.findByIdAndUpdate(
    //   newTask.assignedTo,
    //   {
    //     $addToSet: { tasks: newTask._id },
    //   }
    // );
    // if (!updatedTeamMember) {
    //   return res.status(201).json({
    //     message: "Task created but not synchronized with the team member",
    //   });
    // }
    //Update the employee tasks array
    //Il faut penser à détecter l'ancien ID de l'autre employé pr lui enlever la tâche
    //DONC IL FAUT METTRE EN PLACE L'UNICITÉ d'une tâche, qu'elle soit affectable qu'à un et un seul employé
    const teamMemberBeforeUpdate = await TeamMember.findByIdAndUpdate(
      updatedTask.assignedTo,
      { $addToSet: { tasks: updatedTask._id } },
      { fields: { password: 0 } }
    );
    console.log(
      "teamMemberBeforeUpdate ********************",
      teamMemberBeforeUpdate
    );

    const updatedTeamMemberAfterRemovingTask =
      await TeamMember.findByIdAndUpdate(
        taskBeforeUpdate.assignedTo,
        { $pull: { tasks: updatedTask._id } },
        { new: true, fields: { password: 0 } }
      );
    console.log(
      "updatedTeamMemberAfterRemovingTask **********************",
      updatedTeamMemberAfterRemovingTask
    );

    // if (!updatedTeamMemberAfterRemovingTask) {
    //   return res.status(200).json({
    //     message: "Task updated but not team members tasks not synced",
    //   });
    // }
    return res.status(201).json({
      message: `Task updated successfuly and team members tasks synced, ${teamMemberBeforeUpdate.firstname} ${teamMemberBeforeUpdate.lastname} is now the responsible of the task instead of ${updatedTeamMemberAfterRemovingTask.firstname} ${updatedTeamMemberAfterRemovingTask.lastname}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// Delete task Endpoint
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    console.log("DELETED TASK ******************", deletedTask);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    await TeamMember.updateMany(
      { tasks: deletedTask._id },
      { $pull: { tasks: deletedTask._id } }
    );
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
