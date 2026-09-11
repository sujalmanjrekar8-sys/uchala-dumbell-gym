const express = require("express");
const router = express.Router();
const Trainer = require("../models/Trainer");

// GET all trainers
router.get("/", async (req, res) => {
    try {
        const trainers = await Trainer.find().sort({ createdAt: -1 });
        res.json({ success: true, data: trainers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST register a new trainer
router.post("/", async (req, res) => {
    try {
        const { name, phone, specialization, salary, shift } = req.body;
        const count = await Trainer.countDocuments();
        const trainerId = `TRN-${101 + count}`;

        const newTrainer = new Trainer({
            trainerId,
            name,
            phone,
            specialization,
            salary: Number(salary) || 20000,
            shift: shift || "Morning Shift"
        });

        const saved = await newTrainer.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE a trainer
router.delete("/:id", async (req, res) => {
    try {
        await Trainer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Trainer deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;