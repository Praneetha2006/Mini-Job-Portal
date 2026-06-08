const Job = require("../models/Job");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper to decode token and get user if request contains auth headers
const getAuthUser = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "stikbook-secret-key-12345";
      const decoded = jwt.verify(token, secret);
      return await User.findById(decoded.id);
    } catch (err) {
      return null;
    }
  }
  return null;
};

exports.getJobs = async (req, res) => {
  try {
    let query = {};
    const user = await getAuthUser(req);
    
    // If the requester is a recruiter, restrict listings to their own posts
    if (user && user.role === "recruiter") {
      query = { postedBy: user._id };
    }

    const jobs = await Job.find(query).populate("postedBy", "name email");
    res.json(jobs);
  } catch (error) {
    console.error("getJobs Error:", error.message);
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await getAuthUser(req);
    
    // If the requester is a recruiter, prevent them from inspecting other recruiters' jobs
    if (user && user.role === "recruiter" && job.postedBy) {
      const jobPosterId = job.postedBy._id ? job.postedBy._id.toString() : job.postedBy.toString();
      if (jobPosterId !== user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to view other recruiter's job details" });
      }
    }

    res.json(job);
  } catch (error) {
    console.error("getJobById Error:", error.message);
    res.status(500).json({ message: "Error fetching job details" });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user.id, // Link to recruiter
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: "Error creating job posting" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Ownership check (only creator can edit)
    const jobPosterId = job.postedBy._id ? job.postedBy._id.toString() : job.postedBy.toString();
    if (jobPosterId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this job listing" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: "Error updating job posting" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Ownership check (only creator can delete)
    const jobPosterId = job.postedBy._id ? job.postedBy._id.toString() : job.postedBy.toString();
    if (jobPosterId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this job listing" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job posting" });
  }
};
