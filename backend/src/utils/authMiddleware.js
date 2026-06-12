const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes and verify JWT tokens
exports.protect = async (req, res, next) => {
  let token;

  // Check headers for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const secret = process.env.JWT_SECRET || "stikbook-secret-key-12345";
      const decoded = jwt.verify(token, secret);

      // Get user from the token payload (excluding password)
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

// Middleware to restrict access to specific user roles (e.g., 'recruiter' or 'candidate')
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Role (${req.user.role}) is not authorized to access this resource` 
      });
    }
    
    next();
  };
};
