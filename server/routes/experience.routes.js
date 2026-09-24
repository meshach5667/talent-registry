const express = require("express");
const router = express.Router();
const {
  addExperience,
  updateExperience,
  deleteExperience,
} = require("../controllers/experience.controller");
const { protect } = require("../middleware/auth.middleware");
const { experienceValidators } = require("../validators");

router.post("/", protect, experienceValidators.create, addExperience);
router.put("/:id", protect, updateExperience);
router.delete("/:id", protect, deleteExperience);

module.exports = router;
