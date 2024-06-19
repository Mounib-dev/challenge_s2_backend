import express from "express";
import auth from "../middleware/auth.js";

const router = express.Router();

/* API Portal */
router.get("/", auth, function (req, res, next) {
  res.send("Welcome to API Portal");
});

export default router;
