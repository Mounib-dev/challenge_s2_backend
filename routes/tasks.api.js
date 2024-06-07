const express = require("express");
const router = express.Router();
const Task = require("../models/taskModel");

// Contrôleur pour créer une nouvelle tâche
router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const task = new Task(req.body);

    const newTask = await task.save();
    return res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).send("Tâche déjà existante");
    }
    return res.status(500).json({ message: err.message });
  }
});

// Contrôleur pour obtenir toutes les tâches
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Contrôleur pour obtenir une tâche par son ID
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

// Contrôleur pour mettre à jour une tâche
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(204).json(updatedTask);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

// Contrôleur pour supprimer une tâche
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(204).json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
