const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const jwt = require("jsonwebtoken");

// Helper to decode token and get user if request contains auth headers
const getAuthUser = async (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
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

// @desc    Get jobs with filters, search, pagination, and sorting
// @route   GET /api/jobs
// @access  Public (Candidate sees all, Recruiter filtering supported via postedBy=me)
exports.getJobs = async (req, res) => {
  try {
    let query = {};
    const user = await getAuthUser(req);

    // If query postedBy=me and requester is a recruiter, filter by recruiter id
    if (req.query.postedBy === "me" && user && user.role === "recruiter") {
      query.postedBy = user._id;
    }

    // Advanced Search: by title or company
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ title: searchRegex }, { company: searchRegex }];
    }

    // Filters: Location
    if (req.query.location) {
      query.location = new RegExp(req.query.location, "i");
    }

    // Filters: Job Type (Full-time / Contract / Part-time)
    if (req.query.type && req.query.type !== "All") {
      // Clean query value (e.g. "Full-Time" -> "Full Time")
      const cleanType = req.query.type.replace("-", " ");
      query.type = new RegExp(cleanType, "i");
    }

    // Filters: Salary Range (min / max)
    if (req.query.minSalary || req.query.maxSalary) {
      query.salary = {};
      if (req.query.minSalary) {
        query.salary.$gte = Number(req.query.minSalary);
      }
      if (req.query.maxSalary) {
        query.salary.$lte = Number(req.query.maxSalary);
      }
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // default: newest first
    if (req.query.sort) {
      switch (req.query.sort) {
        case "createdAt":
          sortOption = { createdAt: 1 }; // oldest first
          break;
        case "-createdAt":
          sortOption = { createdAt: -1 }; // newest first
          break;
        case "salary":
          sortOption = { salary: 1 }; // salary low to high
          break;
        case "-salary":
          sortOption = { salary: -1 }; // salary high to low
          break;
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "name email");

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      data: jobs,
    });
  } catch (error) {
    console.error("getJobs Error:", error.message);
    res.status(500).json({ success: false, message: "Error fetching jobs" });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name email"
    );
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const user = await getAuthUser(req);

    // Ownership check for recruiters
    if (user && user.role === "recruiter" && job.postedBy) {
      const jobPosterId = job.postedBy._id
        ? job.postedBy._id.toString()
        : job.postedBy.toString();
      if (jobPosterId !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view other recruiter's job details",
        });
      }
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("getJobById Error:", error.message);
    res.status(500).json({ success: false, message: "Error fetching job details" });
  }
};

// @desc    Create a new job post
// @route   POST /api/jobs
// @access  Private (Recruiter only)
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("createJob Error:", error.message);
    res.status(400).json({ success: false, message: "Error creating job posting" });
  }
};

// @desc    Update a job post
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only, creator only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Ownership check (only creator can edit)
    const jobPosterId = job.postedBy._id
      ? job.postedBy._id.toString()
      : job.postedBy.toString();
    if (jobPosterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job listing",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    console.error("updateJob Error:", error.message);
    res.status(400).json({ success: false, message: "Error updating job posting" });
  }
};

// @desc    Delete a job post
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only, creator only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Ownership check (only creator can delete)
    const jobPosterId = job.postedBy._id
      ? job.postedBy._id.toString()
      : job.postedBy.toString();
    if (jobPosterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job listing",
      });
    }

    await Job.findByIdAndDelete(req.params.id);
    // Also clean up applications associated with this job
    await Application.deleteMany({ jobId: req.params.id });

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("deleteJob Error:", error.message);
    res.status(500).json({ success: false, message: "Error deleting job posting" });
  }
};

// @desc    Bookmark/Save a job post
// @route   POST /api/jobs/:id/save
// @access  Private (Candidate only)
exports.saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const user = await User.findById(req.user.id);

    // Check if already saved
    const isAlreadySaved = user.savedJobs.some(
      (saved) => saved.jobId && saved.jobId.toString() === req.params.id
    );

    if (isAlreadySaved) {
      return res.status(400).json({
        success: false,
        message: "Job is already saved",
      });
    }

    user.savedJobs.push({ jobId: req.params.id, savedAt: new Date() });
    await user.save();

    res.json({
      success: true,
      message: "Job saved successfully",
      data: user.savedJobs,
    });
  } catch (error) {
    console.error("saveJob Error:", error.message);
    res.status(500).json({ success: false, message: "Error saving job" });
  }
};

// @desc    Unsave/Remove a bookmarked job post
// @route   DELETE /api/jobs/:id/save
// @access  Private (Candidate only)
exports.unsaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.savedJobs = user.savedJobs.filter(
      (saved) => saved.jobId && saved.jobId.toString() !== req.params.id
    );

    await user.save();

    res.json({
      success: true,
      message: "Job removed from bookmarks",
      data: user.savedJobs,
    });
  } catch (error) {
    console.error("unsaveJob Error:", error.message);
    res.status(500).json({ success: false, message: "Error unsaving job" });
  }
};

// @desc    Get candidate saved jobs
// @route   GET /api/jobs/saved
// @access  Private (Candidate only)
exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedJobs.jobId",
      select: "title company location salary type description",
    });

    res.json({
      success: true,
      data: user.savedJobs,
    });
  } catch (error) {
    console.error("getSavedJobs Error:", error.message);
    res.status(500).json({ success: false, message: "Error retrieving saved jobs" });
  }
};

// @desc    Get recruiter dashboard statistics
// @route   GET /api/jobs/recruiter/stats
// @access  Private (Recruiter only)
exports.getRecruiterStats = async (req, res) => {
  try {
    const myJobs = await Job.find({ postedBy: req.user.id });
    const jobIds = myJobs.map((j) => j._id);

    const jobsPostedCount = myJobs.length;

    // Count applications for the recruiter's jobs
    const applicationsCount = await Application.countDocuments({
      jobId: { $in: jobIds },
    });

    // Most Applied Job calculations
    let mostAppliedJobTitle = "None";
    let mostAppliedCount = 0;

    if (jobIds.length > 0) {
      const aggregateResult = await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]);

      if (aggregateResult.length > 0) {
        const topJob = await Job.findById(aggregateResult[0]._id);
        if (topJob) {
          mostAppliedJobTitle = topJob.title;
          mostAppliedCount = aggregateResult[0].count;
        }
      }
    }

    res.json({
      success: true,
      data: {
        jobsPosted: jobsPostedCount,
        totalApplications: applicationsCount,
        mostApplied: {
          title: mostAppliedJobTitle,
          count: mostAppliedCount,
        },
      },
    });
  } catch (error) {
    console.error("getRecruiterStats Error:", error.message);
    res.status(500).json({ success: false, message: "Error retrieving recruiter statistics" });
  }
};
