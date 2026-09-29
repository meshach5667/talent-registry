const express = require("express");
const router = express.Router();
const {
  requestVerification,
  getVerificationByToken,
  submitVerificationDecision,
  getMyVerifications,
  resendVerification,
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

// Protected routes for requesting, resending and listing
router.post(
  "/request",
  protect,
  verificationValidators.request,
  requestVerification
);
router.post("/:id/resend", protect, resendVerification);
router.get("/list", protect, getMyVerifications);

module.exports = router;
