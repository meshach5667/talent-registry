const express = require("express");
const router = express.Router();
const {
  requestVerification,
  getVerificationByToken,
  submitVerificationDecision,
  getMyVerifications,
} = require("../controllers/verification.controller");
const { protect } = require("../middleware/auth.middleware");
const { verificationValidators } = require("../validators");

// Review routes (token-based or authenticated)
router.get("/review/:token", getVerificationByToken);
router.post(
  "/review/:token",
  verificationValidators.decision,
  submitVerificationDecision
);

// Protected routes for requesting and listing
router.post(
  "/request",
  protect,
  verificationValidators.request,
  requestVerification
);
router.get("/list", protect, getMyVerifications);

module.exports = router;
