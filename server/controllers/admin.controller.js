const User = require("../models/User");
const Profile = require("../models/Profile");
const Organization = require("../models/Organization");
const Experience = require("../models/Experience");
const Project = require("../models/Project");
const Feedback = require("../models/Feedback");
const AuditLog = require("../models/AuditLog");
const Dispute = require("../models/Dispute");
const { createNotification } = require("../services/notification.service");
const { logAudit } = require("../services/audit.service");

// @desc    Get Admin Overview & Key Metrics
// @route   GET /api/v1/admin/overview
// @access  Private (Admin)
exports.getAdminOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const professionalsCount = await User.countDocuments({ role: "professional" });
    const employersCount = await User.countDocuments({ role: "employer" });
    const totalOrganizations = await Organization.countDocuments();
    const verifiedOrganizations = await Organization.countDocuments({ verified: true });
    
    const totalExperiences = await Experience.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();

    const openDisputes = await Dispute.countDocuments({ status: "open" });

    const recentLogs = await AuditLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        professionalsCount,
        employersCount,
        totalOrganizations,
        verifiedOrganizations,
        totalExperiences,
        totalProjects,
        totalFeedbacks,
        openDisputes,
      },
      recentLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all users with filters
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, q, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== "All") query.role = role;
    if (status && status !== "All") query.status = status;
    if (q) {
      query.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { country: new RegExp(q, "i") },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate("organization", "name verified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (suspend/activate)
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await logAudit({
      userId: req.user._id,
      action: "USER_STATUS_UPDATED",
      targetType: "User",
      targetId: user._id.toString(),
      req,
      details: { newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle organization verified status
// @route   PUT /api/v1/admin/organizations/:id/verify
// @access  Private (Admin)
exports.toggleOrganizationVerification = async (req, res, next) => {
  try {
    const { verified } = req.body;
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    org.verified = verified;
    if (verified) {
      org.verifiedAt = new Date();
      org.verifiedBy = req.user._id;
    } else {
      org.verifiedAt = null;
      org.verifiedBy = null;
    }
    await org.save();

    if (org.adminUser) {
      await createNotification({
        recipient: org.adminUser,
        sender: req.user._id,
        type: "organization_verified",
        title: verified ? "Organization Verified!" : "Organization Verification Revoked",
        message: verified
          ? `Your organization '${org.name}' has been verified by the Registry Admin team.`
          : `Verification badge for '${org.name}' has been revoked.`,
        actionUrl: "/organization/dashboard",
      });
    }

    await logAudit({
      userId: req.user._id,
      action: verified ? "ORGANIZATION_VERIFIED" : "ORGANIZATION_UNVERIFIED",
      targetType: "Organization",
      targetId: org._id.toString(),
      req,
    });

    res.status(200).json({
      success: true,
      message: `Organization is now ${verified ? "Verified" : "Unverified"}.`,
      organization: org,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Disputes and Reports
// @route   GET /api/v1/admin/disputes
// @access  Private (Admin)
exports.getDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find()
      .populate("reporter", "name email")
      .populate("reportedUser", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve dispute
// @route   PUT /api/v1/admin/disputes/:id
// @access  Private (Admin)
exports.resolveDispute = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found.",
      });
    }

    dispute.status = status;
    dispute.resolutionNotes = resolutionNotes || "";
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    await logAudit({
      userId: req.user._id,
      action: "DISPUTE_RESOLVED",
      targetType: "Dispute",
      targetId: dispute._id.toString(),
      req,
      details: { status, resolutionNotes },
    });

    res.status(200).json({
      success: true,
      message: `Dispute updated to ${status}.`,
      dispute,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    File a new dispute (Public / Authenticated users)
// @route   POST /api/v1/admin/disputes
// @access  Private
exports.createDispute = async (req, res, next) => {
  try {
    const {
      targetType,
      targetId,
      targetTitle,
      reportedUserId,
      reason,
      details,
      evidenceLinks,
    } = req.body;

    const dispute = await Dispute.create({
      reporter: req.user._id,
      targetType,
      targetId,
      targetTitle,
      reportedUser: reportedUserId,
      reason,
      details,
      evidenceLinks: evidenceLinks || [],
    });

    await logAudit({
      userId: req.user._id,
      action: "DISPUTE_FILED",
      targetType: "Dispute",
      targetId: dispute._id.toString(),
      req,
      details: { reason, targetType, targetId },
    });

    res.status(201).json({
      success: true,
      message: "Dispute report submitted. The administration team will investigate.",
      dispute,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Platform Audit Logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, limit = 50 } = req.query;
    const query = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
