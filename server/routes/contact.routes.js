const express = require("express");
const router = express.Router();
const {
  createContactRequest,
  getMyContactRequests,
  respondToContactRequest,
} = require("../controllers/contact.controller");
const { protect } = require("../middleware/auth.middleware");
const { contactValidators } = require("../validators");

router.post("/", protect, contactValidators.create, createContactRequest);
router.get("/", protect, getMyContactRequests);
router.put("/:id/respond", protect, respondToContactRequest);

module.exports = router;
