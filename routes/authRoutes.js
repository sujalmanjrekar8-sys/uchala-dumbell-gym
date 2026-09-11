const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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
    } catch (err) {
        console.log("Owner seed log:", err.message);
    }
}
setTimeout(seedOwner, 1500);

router.get("/test-owner", async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const colNames = collections.map(c => c.name);
        
        let allOwners = [];
        for (const colName of ["owners", "Owner", "users", "User", "admins", "Admin"]) {
            if (colNames.includes(colName)) {
                const docs = await db.collection(colName).find({}).toArray();
                allOwners.push({ collection: colName, docs });
            }
        }
        res.json({ success: true, collections: colNames, ownersFound: allOwners });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Universal helper to find Owner across any collection name in MongoDB Atlas
async function findOwnerDocument(cleanUser) {
    const regex = new RegExp(`^${cleanUser}$`, "i");
    const query = {
        $or: [
            { username: cleanUser },
            { username: regex },
            { name: regex }
        ]
    };

    // 1. Try Mongoose Owner Model
    try {
        const owner = await Owner.findOne(query);
        if (owner) return owner;
    } catch (e) {}

    // 2. Try raw MongoDB collections in Atlas
    try {
        const db = mongoose.connection.db;
        if (db) {
            const collections = await db.listCollections().toArray();
            const colNames = collections.map(c => c.name);
            for (const colName of ["owners", "Owner", "users", "User", "admins", "Admin"]) {
                if (colNames.includes(colName)) {
                    const doc = await db.collection(colName).findOne(query);
                    if (doc) return doc;
                }
            }
        }
    } catch (e) {}

    return null;
}

// Universal helper to find Trainer across collections
async function findTrainerDocument(cleanUser) {
    const regex = new RegExp(`^${cleanUser}$`, "i");
    const query = {
        $or: [
            { trainerId: cleanUser },
            { trainerId: regex },
            { phone: cleanUser },
            { name: regex },
            { username: regex }
        ]
    };

    try {
        const trainer = await Trainer.findOne(query);
        if (trainer) return trainer;
    } catch (e) {}

    try {
        const db = mongoose.connection.db;
        if (db) {
            const collections = await db.listCollections().toArray();
            const colNames = collections.map(c => c.name);
            for (const colName of ["trainers", "Trainer", "users", "User"]) {
                if (colNames.includes(colName)) {
                    const doc = await db.collection(colName).findOne(query);
                    if (doc) return doc;
                }
            }
        }
    } catch (e) {}

    return null;
}

// Universal helper to find Member across collections
async function findMemberDocument(cleanUser) {
    const regex = new RegExp(`^${cleanUser}$`, "i");
    const query = {
        $or: [
            { memberId: cleanUser },
            { memberId: regex },
            { phone: cleanUser },
            { name: regex },
            { username: regex }
        ]
    };

    try {
        const member = await Member.findOne(query);
        if (member) return member;
    } catch (e) {}

    try {
        const db = mongoose.connection.db;
        if (db) {
            const collections = await db.listCollections().toArray();
            const colNames = collections.map(c => c.name);
            for (const colName of ["members", "Member", "users", "User"]) {
                if (colNames.includes(colName)) {
                    const doc = await db.collection(colName).findOne(query);
                    if (doc) return doc;
                }
            }
        }
    } catch (e) {}

    return null;
}

router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Please enter both username and password" });
        }

        const cleanUser = username.toString().trim();
        const cleanPass = password.toString().trim();

        // 1. OWNER LOGIN
        if (role === "owner") {
            const owner = await findOwnerDocument(cleanUser);

            if (!owner) {
                return res.status(401).json({ 
                    success: false, 
                    message: `Owner "${cleanUser}" not found in MongoDB database!` 
                });
            }

            const storedPass = (owner.password || "").toString().trim();
            if (storedPass !== cleanPass) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Incorrect Owner password! Please check uppercase/lowercase." 
                });
            }

            return res.json({
                success: true,
                message: "Owner login successful",
                user: { 
                    username: owner.username || cleanUser, 
                    name: owner.name || "Gym Owner", 
                    role: "owner" 
                }
            });
        }

        // 2. TRAINER LOGIN
        if (role === "trainer") {
            const trainer = await findTrainerDocument(cleanUser);

            if (!trainer) {
                return res.status(401).json({ 
                    success: false, 
                    message: `Trainer "${cleanUser}" not found in MongoDB database!` 
                });
            }

            const trainerPass = (trainer.password || "trainer123").toString().trim();
            if (trainerPass !== cleanPass) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Incorrect Trainer password!" 
                });
            }

            return res.json({
                success: true,
                message: "Trainer login successful",
                user: {
                    username: trainer.trainerId || cleanUser,
                    name: trainer.name,
                    role: "trainer"
                }
            });
        }

        // 3. MEMBER LOGIN
        if (role === "member") {
            const member = await findMemberDocument(cleanUser);

            if (!member) {
                return res.status(401).json({ 
                    success: false, 
                    message: `Member "${cleanUser}" not found in MongoDB database!` 
                });
            }

            const memberPass = (member.password || "123456").toString().trim();
            if (memberPass !== cleanPass) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Incorrect Member password!" 
                });
            }

            return res.json({
                success: true,
                message: "Member login successful",
                user: {
                    username: member.memberId || cleanUser,
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