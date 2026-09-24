const Feedback = require("../models/Feedback");
const Profile = require("../models/Profile");
const { updateReputationScore } = require("../services/reputation.service");
const { createNotification } = require("../services/notification.service");
const { logAudit } = require("../services/audit.service");

// @desc    Submit client or employer feedback
// @route   POST /api/v1/feedbacks
// @access  Private (Employer / Verified Client)
exports.createFeedback = async (req, res, next) => {
  try {
    const {
      professionalId,
      experienceId,
      projectId,
      organizationId,
      rating,
      technicalCompetence = 5,
      communication = 5,
      reliability = 5,
      review,
      relationship,
    } = req.body;

    if (!professionalId || !review || !rating) {
      return res.status(400).json({
        success: false,
        message: "Professional ID, rating, and review text are required.",
      });
    }

    if (professionalId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot submit feedback for yourself.",
      });
    }

    const feedback = await Feedback.create({
      professional: professionalId,
      author: req.user._id,
      organization: organizationId || req.user.organization?._id,
      experience: experienceId,
      project: projectId,
      rating,
      technicalCompetence,
      communication,
      reliability,
      review,
      relationship: relationship || "Direct Manager",
      isVerifiedEmployer: req.user.role === "employer",
    });

    await updateReputationScore(professionalId);

    // Notify professional
    await createNotification({
      recipient: professionalId,
      sender: req.user._id,
      type: "feedback_received",
      title: "New Verified Endorsement & Feedback",
      message: `${req.user.name} posted a ${rating}-star verified review on your profile.`,
      actionUrl: `/passport/${professionalId}`,
    });

    await logAudit({
      userId: req.user._id,
      action: "FEEDBACK_CREATED",
      targetType: "Feedback",
      targetId: feedback._id.toString(),
      req,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedbacks for a professional
// @route   GET /api/v1/feedbacks/user/:userId
// @access  Public
exports.getUserFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ professional: req.params.userId })
      .populate("author", "name avatar organization role")
      .populate("organization", "name logo verified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
