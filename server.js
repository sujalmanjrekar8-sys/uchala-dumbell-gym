require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve all frontend HTML, CSS, and JS files
app.use(express.static(path.join(__dirname)));

// MongoDB Connection (Uses Cloud DB if provided, else local DB)
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/uchala_dumbell_gym";

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch((err) => console.log("MongoDB Connection Error: ", err.message));

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/trainers", require("./routes/trainerRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/workouts", require("./routes/workoutRoutes"));

// Fallback to homepage
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});