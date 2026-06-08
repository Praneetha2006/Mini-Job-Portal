const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// API routes
const jobRoutes = require("./src/routes/jobRoutes");
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});

// Optional: seed sample jobs in development when DB is empty
const Job = require("./src/models/Job");

mongoose.connection.once("open", async () => {
  try {
    const count = await Job.countDocuments();
    if (count === 0) {
      const sampleJobs = [
        {
          title: "Frontend Developer",
          company: "Acme Co",
          location: "Remote",
          salary: 80000,
          type: "Full-time",
          description: "Build React applications.",
        },
        {
          title: "Backend Developer",
          company: "Beta Inc",
          location: "New York, NY",
          salary: 90000,
          type: "Full-time",
          description: "Design REST APIs with Node.js.",
        },
      ];

      await Job.insertMany(sampleJobs);
      console.log("Inserted sample jobs for development");
    }
  } catch (err) {
    console.error("Error seeding jobs:", err.message);
  }
});