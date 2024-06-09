const { check, validationResult } = require("express-validator");

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

module.exports = { validateLogin };
