const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  uploadPhoto,
  deletePhoto,
  githubAuth,
  githubCallback,
  githubExchange,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { authValidators } = require("../validators");
const { authLimiter } = require("../middleware/rateLimiter.middleware");

router.post("/register", authLimiter, authValidators.register, register);
router.post("/login", authLimiter, authValidators.login, login);
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);
router.post("/github/exchange", githubExchange);
router.get("/me", protect, getMe);
router.post("/photo", protect, upload.single("photo"), uploadPhoto);
router.delete("/photo", protect, deletePhoto);

module.exports = router;
