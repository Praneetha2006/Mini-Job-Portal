const express = require("express");

const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

const {
  applyJob,
  getApplications,
  getMyApplications,
} = require("../controllers/applicationController");

const { protect, restrictTo } = require("../utils/authMiddleware");

const router = express.Router();

router.route("/")
  .get(getJobs)
  .post(protect, restrictTo("recruiter"), createJob);

router.route("/my-applications")
  .get(protect, restrictTo("candidate"), getMyApplications);

router.route("/:id")
  .get(getJobById)
  .put(protect, restrictTo("recruiter"), updateJob)
  .delete(protect, restrictTo("recruiter"), deleteJob);

router.route("/:id/applications")
  .get(protect, restrictTo("recruiter"), getApplications)
  .post(protect, restrictTo("candidate"), applyJob);

module.exports = router;