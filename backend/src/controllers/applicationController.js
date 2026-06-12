const Application = require("../models/Application");
const Job = require("../models/Job");
const { sendApplicationEmail } = require("../utils/emailService");

// @desc    Apply for a job
// @route   POST /api/jobs/:id/applications
// @access  Private (Candidate only)
exports.applyJob = async (req, res) => {
  try {
    // Verify job exists
    const job = await Job.findById(req.params.id).populate("postedBy");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found." });
    }

    // Check if candidate already applied to this job to prevent duplicates
    const alreadyApplied = await Application.findOne({
      jobId: req.params.id,
      candidateId: req.user.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    const application = await Application.create({
      jobId: req.params.id,
      candidateId: req.user.id, // Link to candidate profile
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      resume: req.body.resume,
      coverLetter: req.body.coverLetter,
    });

    // Send email alert to recruiter if job has poster details
    if (job.postedBy && job.postedBy.email) {
      // Trigger async send email
      sendApplicationEmail({
        recruiterEmail: job.postedBy.email,
        recruiterName: job.postedBy.name,
        candidateName: req.body.name,
        candidateEmail: req.body.email,
        candidatePhone: req.body.phone,
        coverLetter: req.body.coverLetter,
        jobTitle: job.title,
      });
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("applyJob Error:", error.message);
    res.status(400).json({ success: false, message: "Error submitting application." });
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/jobs/:id/applications
// @access  Private (Recruiter only)
exports.getApplications = async (req, res) => {
  try {
    // Verify job exists
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found." });
    }

    // Only the job poster can view applications
    const jobPosterId = job.postedBy._id
      ? job.postedBy._id.toString()
      : job.postedBy.toString();
    if (jobPosterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applicants for this job listing.",
      });
    }

    const applications = await Application.find({
      jobId: req.params.id,
    });

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("getApplications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving candidate application list.",
    });
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

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("getMyApplications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving your job applications.",
    });
  }
};
