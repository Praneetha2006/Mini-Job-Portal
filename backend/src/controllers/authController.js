const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token helper
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "stikbook-secret-key-12345";
  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // Populate savedJobs.jobId to have job details for candidate on startup
    const user = await User.findById(req.user.id).select("-password").populate("savedJobs.jobId");
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("getMe Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, skills, experience, location } = req.body;

    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
      user.email = email;
    }

    // Update candidate specific profile details
    if (user.role === "candidate") {
      if (skills !== undefined) user.skills = skills;
      if (experience !== undefined) user.experience = Number(experience);
      if (location !== undefined) user.location = location;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password").populate("savedJobs.jobId");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("updateProfile Error:", error.message);
    res.status(500).json({ success: false, message: "Server error during profile update" });
  }
};
