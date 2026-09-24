const express = require("express");
const router = express.Router();
const {
  getAdminOverview,
  getUsers,
  updateUserStatus,
  toggleOrganizationVerification,
  getDisputes,
  resolveDispute,
  createDispute,
  getAuditLogs,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Public/Member dispute filing
router.post("/disputes", protect, createDispute);

// Admin-only endpoints
router.use(protect, authorize("admin"));

router.get("/overview", getAdminOverview);
router.get("/users", getUsers);
router.put("/users/:id/status", updateUserStatus);
router.put("/organizations/:id/verify", toggleOrganizationVerification);
router.get("/disputes", getDisputes);
router.put("/disputes/:id", resolveDispute);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
