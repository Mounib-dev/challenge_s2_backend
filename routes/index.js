import express from "express";

const router = express.Router();

/* API Portal */
router.get("/", function (req, res, next) {
  res.send("Welcome");
});

export default router;
