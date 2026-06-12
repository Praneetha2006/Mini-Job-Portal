const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["candidate", "recruiter"],
      default: "candidate",
    },
    // Candidate Profile Info
    skills: {
      type: String,
      default: "",
    },
    experience: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: "",
    },
    // Saved jobs list
    savedJobs: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Hash the password before saving the user
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
