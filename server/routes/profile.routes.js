const express = require("express");
const router = express.Router();
const {
  getPublicPassport,
  getMyProfile,
  updateProfile,
  searchProfiles,
  getSpotlight,
} = require("../controllers/profile.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/spotlight", getSpotlight);
router.get("/search", searchProfiles);
router.get("/passport/:slug", getPublicPassport);
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateProfile);

module.exports = router;
