const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../utils/authMiddleware");
const {
  validateRegister,
  validateLogin,
  validateProfile,
  validate,
} = require("../utils/validators");

const router = express.Router();

router.post("/register", validateRegister, validate, register);
router.post("/login", validateLogin, validate, login);
router.get("/me", protect, getMe);
router.put("/profile", protect, validateProfile, validate, updateProfile);

module.exports = router;
