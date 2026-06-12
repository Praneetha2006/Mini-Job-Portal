const express = require("express");

const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterStats,
  saveJob,
  unsaveJob,
  getSavedJobs,
} = require("../controllers/jobController");

const {
  applyJob,
  getApplications,
  getMyApplications,
} = require("../controllers/applicationController");

const { protect, restrictTo } = require("../utils/authMiddleware");
const { validateJob, validateApplication, validate } = require("../utils/validators");

const router = express.Router();

// Specific routes first to avoid route parameter collision
router.route("/my-applications")
  .get(protect, restrictTo("candidate"), getMyApplications);

router.route("/saved")
  .get(protect, restrictTo("candidate"), getSavedJobs);

router.route("/recruiter/stats")
  .get(protect, restrictTo("recruiter"), getRecruiterStats);

router.route("/")
  .get(getJobs)
  .post(protect, restrictTo("recruiter"), validateJob, validate, createJob);

router.route("/:id")
  .get(getJobById)
  .put(protect, restrictTo("recruiter"), validateJob, validate, updateJob)
  .delete(protect, restrictTo("recruiter"), deleteJob);

router.route("/:id/save")
  .post(protect, restrictTo("candidate"), saveJob)
  .delete(protect, restrictTo("candidate"), unsaveJob);

router.route("/:id/applications")
  .get(protect, restrictTo("recruiter"), getApplications)
  .post(protect, restrictTo("candidate"), validateApplication, validate, applyJob);

module.exports = router;