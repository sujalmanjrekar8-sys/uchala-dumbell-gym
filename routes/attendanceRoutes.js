const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// GET today's attendance logs
router.get("/", async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const dateQuery = req.query.date || today;
        const records = await Attendance.find({ date: dateQuery }).sort({ createdAt: -1 });
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST mark attendance
router.post("/", async (req, res) => {
    try {
        const { memberId, memberName, status, time } = req.body;
        const today = new Date().toISOString().split("T")[0];

        // Update if already marked today, or create new
        let record = await Attendance.findOne({ memberId, date: today });
        if (record) {
            record.status = status;
            record.time = time || record.time;
            await record.save();
        } else {
            record = new Attendance({
                memberId,
                memberName,
                date: today,
                time: time || "--:--",
                status: status || "Present"
            });
            await record.save();
        }

        res.json({ success: true, data: record });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;