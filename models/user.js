const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["owner", "trainer", "member"],
        required: true
    },
    name: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);