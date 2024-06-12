const { check, validationResult, body } = require("express-validator");

const validateLogin = [
  check("email").isEmail().withMessage("Email must be a valid email address"),
  check("password").custom((value) => {
    if (typeof value !== "string") {
      throw new Error("Password must be a string");
    }
    // Protection from common SQL injections
    const sqlInjectionPattern =
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b|--|;|\/\*)/i;
    if (sqlInjectionPattern.test(value)) {
      throw new Error("Password contains forbidden characters or patterns");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateNewEmployee = [
  body("firstname").isString(),
  body("lastname").isString(),
  body("jobTitle").isString(),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage(
      'Password must contain at least one special character: !@#$%^&*(),.?":{}|<>'
    )
    .trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateLogin, validateNewEmployee };
