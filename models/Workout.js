const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
    athleteName: { type: String, required: true },
    exercise: { type: String, required: true },
    category: { type: String, required: true },
    setsReps: { type: String, required: true },
    weight: { type: String, default: "—" },
    duration: { type: String, default: "30 min" },
    date: { type: String, default: () => new Date().toISOString().split("T")[0] }
}, { timestamps: true });

module.exports = mongoose.model("Workout", workoutSchema);