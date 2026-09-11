const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "Gym Owner" }
}, { timestamps: true });

module.exports = mongoose.model("Owner", ownerSchema);