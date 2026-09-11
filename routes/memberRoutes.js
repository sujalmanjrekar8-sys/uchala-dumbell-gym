const express = require("express");
const router = express.Router();
const Member = require("../models/member");

router.get("/", async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        res.json({ success: true, data: members });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, phone, plan, joinDate, password } = req.body;

        const count = await Member.countDocuments();
        const memberId = `UDG-${101 + count}`;

        const newMember = new Member({
            memberId,
            name,
            phone,
            plan,
            password: password || "123456",
            joinDate: joinDate || new Date().toISOString().split("T")[0],
            status: "Active"
        });

        const savedMember = await newMember.save();
        res.status(201).json({ success: true, data: savedMember });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Member.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }
        res.json({ success: true, message: "Member deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;