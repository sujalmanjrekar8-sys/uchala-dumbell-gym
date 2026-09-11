const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    memberId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        required: true
    },
    joinDate: {
        type: String,
        default: () => new Date().toISOString().split("T")[0]
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true });

module.exports = mongoose.model("Member", memberSchema);