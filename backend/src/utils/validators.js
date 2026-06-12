const { body, validationResult } = require("express-validator");

// Common middleware to handle validation results and format error response
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

exports.validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please include a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["candidate", "recruiter"])
    .withMessage("Role must be candidate or recruiter"),
];

exports.validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please include a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

exports.validateJob = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required"),
  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company name is required"),
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),
  body("salary")
    .isNumeric()
    .withMessage("Salary must be a number")
    .custom((val) => Number(val) > 0)
    .withMessage("Salary must be a positive number"),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Job type is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Job description is required"),
];

exports.validateApplication = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Applicant name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please include a valid email"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("resume")
    .trim()
    .notEmpty()
    .withMessage("Resume link is required"),
  body("coverLetter")
    .optional({ checkFalsy: true })
    .trim(),
];

exports.validateProfile = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("skills")
    .optional({ checkFalsy: true })
    .trim()
    .isString(),
  body("experience")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Experience must be a number")
    .custom((val) => Number(val) >= 0)
    .withMessage("Experience cannot be negative"),
  body("location")
    .optional({ checkFalsy: true })
    .trim()
    .isString(),
];
