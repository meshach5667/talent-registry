const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getUserFeedbacks,
} = require("../controllers/feedback.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, createFeedback);
router.get("/user/:userId", getUserFeedbacks);

module.exports = router;
