const express = require("express");
const router = express.Router();
const {
  getOrganizations,
  getOrganization,
  updateOrganization,
  uploadLogo,
  getOrganizationDashboard,
} = require("../controllers/organization.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.get("/", getOrganizations);
router.get("/:idOrSlug", getOrganization);
router.put("/:id", protect, authorize("employer", "admin"), updateOrganization);
router.post(
  "/:id/logo",
  protect,
  authorize("employer", "admin"),
  upload.single("logo"),
  uploadLogo
);
router.get(
  "/:id/dashboard",
  protect,
  authorize("employer", "admin"),
  getOrganizationDashboard
);

module.exports = router;
