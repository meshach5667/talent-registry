const express = require("express");
const router = express.Router();
const {
  addProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");
const { protect } = require("../middleware/auth.middleware");
const { projectValidators } = require("../validators");

router.post("/", protect, projectValidators.create, addProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

module.exports = router;
