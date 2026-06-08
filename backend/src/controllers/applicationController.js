const Application = require("../models/Application");
const Job = require("../models/Job");

exports.applyJob = async (req, res) => {
  try {
    // Check if candidate already applied to this job to prevent duplicates
    const alreadyApplied = await Application.findOne({
      jobId: req.params.id,
      candidateId: req.user.id
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    const application = await Application.create({
      jobId: req.params.id,
      candidateId: req.user.id, // Link to candidate profile
      ...req.body,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: "Error submitting application." });
  }
};

exports.getApplications = async (req, res) => {
  try {
    // Verify job exists
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job listing not found." });
    }

    // Only the job poster can view applications
    if (job.postedBy && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Not authorized to view applicants for this job listing." 
      });
    }

    const applications = await Application.find({
      jobId: req.params.id,
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving candidate application list." });
  }
};

// @desc    Get logged in candidate's applications
// @route   GET /api/jobs/my-applications
// @access  Private (Candidate only)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      candidateId: req.user.id,
    }).populate("jobId", "title company location type salary");
    
    res.json(applications);
  } catch (error) {
    console.error("getMyApplications Error:", error.message);
    res.status(500).json({ message: "Error retrieving your job applications." });
  }
};
