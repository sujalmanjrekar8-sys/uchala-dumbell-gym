const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
    trainerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    specialization: { type: String, required: true },
    salary: { type: Number, required: true },
    shift: { type: String, required: true },
    password: { type: String, default: "trainer123" },
    traineesCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Trainer", trainerSchema);