const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    email: String,
    phone: String,
    resume: String,
    coverLetter: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
