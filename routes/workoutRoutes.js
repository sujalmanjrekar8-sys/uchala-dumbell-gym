const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");

// GET all workouts
router.get("/", async (req, res) => {
    try {
        const workouts = await Workout.find().sort({ createdAt: -1 });
        res.json({ success: true, data: workouts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST log a workout
router.post("/", async (req, res) => {
    try {
        const { athleteName, exercise, category, setsReps, weight, duration } = req.body;

        const newWorkout = new Workout({
            athleteName,
            exercise,
            category,
            setsReps,
            weight: weight || "—",
            duration: duration || "30 min"
        });

        const saved = await newWorkout.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;