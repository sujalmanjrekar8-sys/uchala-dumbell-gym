const express = require("express");
const router = express.Router();
const Owner = require("../models/Owner");
const Trainer = require("../models/Trainer");
const Member = require("../models/member");

async function seedOwner() {
    try {
        const count = await Owner.countDocuments();
        if (count === 0) {
            await Owner.create({
                username: "admin",
                password: "admin123",
                name: "Gym Owner"
            });
            console.log("Default owner account seeded to MongoDB Atlas!");
        }
    } catch (err) {}
}
seedOwner();

router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Please enter both username and password" });
        }

        const cleanUser = username.trim();

        if (role === "owner") {
            const owner = await Owner.findOne({ username: cleanUser });

            if (!owner) {
                return res.status(401).json({ success: false, message: "Owner username not found!" });
            }

            if (owner.password !== password) {
                return res.status(401).json({ success: false, message: "Incorrect Owner password!" });
            }

            return res.json({
                success: true,
                message: "Owner login successful",
                user: { username: owner.username, name: owner.name, role: "owner" }
            });
        }

        if (role === "trainer") {
            const trainer = await Trainer.findOne({
                $or: [
                    { trainerId: cleanUser },
                    { phone: cleanUser },
                    { name: new RegExp(`^${cleanUser}$`, "i") }
                ]
            });

            if (!trainer) {
                return res.status(401).json({ success: false, message: "Trainer ID, Name, or Phone not found!" });
            }

            const trainerPass = trainer.password || "trainer123";
            if (trainerPass !== password) {
                return res.status(401).json({ success: false, message: "Incorrect Trainer password!" });
            }

            return res.json({
                success: true,
                message: "Trainer login successful",
                user: {
                    username: trainer.trainerId,
                    name: trainer.name,
                    role: "trainer"
                }
            });
        }

        if (role === "member") {
            const member = await Member.findOne({
                $or: [
                    { memberId: cleanUser },
                    { phone: cleanUser },
                    { name: new RegExp(`^${cleanUser}$`, "i") }
                ]
            });

            if (!member) {
                return res.status(401).json({ success: false, message: "Member ID, Name, or Phone not found!" });
            }

            if (member.password !== password) {
                return res.status(401).json({ success: false, message: "Incorrect Member password!" });
            }

            return res.json({
                success: true,
                message: "Member login successful",
                user: {
                    username: member.memberId,
                    name: member.name,
                    role: "member",
                    plan: member.plan
                }
            });
        }

        res.status(400).json({ success: false, message: "Invalid role specified" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;