const ContactRequest = require("../models/ContactRequest");
const User = require("../models/User");
const { createNotification } = require("../services/notification.service");
const { logAudit } = require("../services/audit.service");

// @desc    Send contact request to professional
// @route   POST /api/v1/contacts
// @access  Private (Employer / Verified Client)
exports.createContactRequest = async (req, res, next) => {
  try {
    const {
      professionalId,
      subject,
      message,
      roleOffered,
      engagementType = "full-time",
      budgetRange,
    } = req.body;

    const professional = await User.findById(professionalId);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: "Professional not found.",
      });
    }

    if (professionalId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a contact inquiry to yourself.",
      });
    }

    const orgId = req.user.organization?._id || req.user.organization;

    const contact = await ContactRequest.create({
      professional: professionalId,
      employer: req.user._id,
      organization: orgId,
      subject,
      message,
      roleOffered,
      engagementType,
      budgetRange,
      status: "pending",
    });

    // Send notification
    await createNotification({
      recipient: professionalId,
      sender: req.user._id,
      type: "contact_request",
      title: "New Opportunity / Employer Inquiry",
      message: `${req.user.name} from ${req.user.organization?.name || "Verified Organization"} sent you an inquiry: "${subject}".`,
      actionUrl: "/dashboard",
      metadata: { contactRequestId: contact._id },
    });

    await logAudit({
      userId: req.user._id,
      action: "CONTACT_REQUEST_SENT",
      targetType: "ContactRequest",
      targetId: contact._id.toString(),
      req,
      details: { professionalId },
    });

    res.status(201).json({
      success: true,
      message: "Inquiry sent successfully to candidate.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contacts list for current user
// @route   GET /api/v1/contacts
// @access  Private
exports.getMyContactRequests = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "professional") {
      query = { professional: req.user._id };
    } else if (req.user.role === "employer") {
      query = { employer: req.user._id };
    } else if (req.user.role === "admin") {
      query = {};
    }

    const contacts = await ContactRequest.find(query)
      .populate("professional", "name email avatar country city")
      .populate("employer", "name email avatar organization")
      .populate("organization", "name logo verified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to contact request (Accept/Decline)
// @route   PUT /api/v1/contacts/:id/respond
// @access  Private (Professional)
exports.respondToContactRequest = async (req, res, next) => {
  try {
    const { status, responseMessage } = req.body;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'accepted' or 'declined'.",
      });
    }

    const contact = await ContactRequest.findById(req.params.id)
      .populate("employer")
      .populate("professional");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    if (
      contact.professional._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to respond to this inquiry.",
      });
    }

    contact.status = status;
    contact.responseMessage = responseMessage || "";
    contact.respondedAt = new Date();
    await contact.save();

    // Notify employer
    await createNotification({
      recipient: contact.employer._id,
      sender: req.user._id,
      type: "contact_response",
      title: `Candidate ${status === "accepted" ? "Accepted" : "Declined"} Inquiry`,
      message: `${contact.professional.name} ${status} your inquiry for "${contact.subject}".`,
      actionUrl: "/dashboard",
    });

    res.status(200).json({
      success: true,
      message: `Inquiry marked as ${status}.`,
      contact,
    });
  } catch (error) {
    next(error);
  }
};
