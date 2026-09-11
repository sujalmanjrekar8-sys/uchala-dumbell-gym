const express = require("express");
const router = express.Router();
const User = require("../models/user");

async function seedDefaultUsers() {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            await User.create([
                { username: "admin", password: "admin123", role: "owner", name: "Gym Owner" },
                { username: "trainer", password: "trainer123", role: "trainer", name: "Coach Rajesh" },
                { username: "member", password: "member123", role: "member", name: "Rahul Sharma" }
            ]);
            console.log("Default users created in MongoDB Atlas successfully!");
        }
    } catch (err) {
        console.log("Seed error:", err.message);
    }
}

router.get("/seed", async (req, res) => {
    try {
        await User.deleteMany({});
        const users = await User.create([
            { username: "admin", password: "admin123", role: "owner", name: "Gym Owner" },
            { username: "trainer", password: "trainer123", role: "trainer", name: "Coach Rajesh" },
            { username: "member", password: "member123", role: "member", name: "Rahul Sharma" }
        ]);
        res.json({ success: true, message: "Users seeded to MongoDB Atlas!", users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Please enter both username and password" });
        }

        const user = await User.findOne({ username: username.trim(), role });

        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        res.json({
            success: true,
            message: "Login successful",
            user: {
                username: user.username,
                role: user.role,
                name: user.name
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

setTimeout(seedDefaultUsers, 1500);

module.exports = router;