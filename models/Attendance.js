const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, default: "--:--" },
    status: { type: String, enum: ["Present", "Absent"], default: "Present" }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);