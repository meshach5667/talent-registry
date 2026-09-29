const crypto = require("crypto");
const VerificationRequest = require("../models/VerificationRequest");
const Experience = require("../models/Experience");
const Project = require("../models/Project");
const Organization = require("../models/Organization");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const { updateReputationScore } = require("../services/reputation.service");
const { createNotification } = require("../services/notification.service");
const { logAudit } = require("../services/audit.service");
const {
  sendVerificationEmail,
  sendVerificationDecisionEmail,
} = require("../services/email.service");

// @desc    Submit verification request for experience or project
// @route   POST /api/v1/verifications/request
// @access  Private (Professional)
exports.requestVerification = async (req, res, next) => {
  try {
    const {
      type, // 'experience' or 'project'
      experienceId,
      projectId,
      verifierEmail,
      verifierName,
      verifierTitle,
      targetOrganizationId,
      requestMessage,
    } = req.body;

    let targetItem = null;
    let targetOrg = targetOrganizationId;

    if (type === "experience") {
      targetItem = await Experience.findOne({
        _id: experienceId,
        user: req.user._id,
      });
      if (!targetItem) {
        return res.status(404).json({
          success: false,
          message: "Experience record not found or not owned by you.",
        });
      }
      if (!targetOrg && targetItem.organization) {
        targetOrg = targetItem.organization;
      }
    } else if (type === "project") {
      targetItem = await Project.findOne({
        _id: projectId,
        user: req.user._id,
      });
      if (!targetItem) {
        return res.status(404).json({
          success: false,
          message: "Project record not found or not owned by you.",
        });
      }
      if (!targetOrg && targetItem.organization) {
        targetOrg = targetItem.organization;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'experience' or 'project'.",
      });
    }

    // Check if there is already a pending request
    const existingPending = await VerificationRequest.findOne({
      type,
      experience: experienceId,
      project: projectId,
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "A verification request for this item is already pending review.",
        request: existingPending,
      });
    }

    // Generate unique verification token
    const token = crypto.randomBytes(24).toString("hex");

    const verification = await VerificationRequest.create({
      type,
      professional: req.user._id,
      experience: type === "experience" ? experienceId : undefined,
      project: type === "project" ? projectId : undefined,
      targetOrganization: targetOrg,
      verifierEmail: verifierEmail.toLowerCase().trim(),
      verifierName: verifierName || "",
      verifierTitle: verifierTitle || "Engineering Lead / Manager",
      requestMessage:
        requestMessage ||
        `Please verify ${req.user.name}'s contributions on Talent Registry.`,
      token,
      status: "pending",
    });

    // Mark item status as pending
    targetItem.verificationStatus = "pending";
    await targetItem.save();

    // Check if verifier is an existing user or org admin
    const verifierUser = await User.findOne({
      email: verifierEmail.toLowerCase().trim(),
    });

    if (verifierUser) {
      await createNotification({
        recipient: verifierUser._id,
        sender: req.user._id,
        type: "verification_request",
        title: "New Verification Request",
        message: `${req.user.name} has requested you verify their ${type} as ${targetItem.title || "contributor"}.`,
        actionUrl: `/verification/${token}`,
        metadata: { verificationId: verification._id, token },
      });
    }

    // Resolve frontend base URL for verification link
    const clientUrl =
      process.env.CLIENT_URL ||
      (req.get("origin") && !req.get("origin").includes("localhost:5000")
        ? req.get("origin")
        : null) ||
      (process.env.NODE_ENV === "production"
        ? "https://talent-registry-azure.vercel.app"
        : "http://localhost:3000");
    const cleanClientUrl = clientUrl.replace(/\/+$/, "");
    const fullVerificationUrl = `${cleanClientUrl}/verification/${token}`;

    const itemTitle = targetItem.title || targetItem.role || "Engineering Contributor";
    const companyOrClient =
      targetItem.company || targetItem.clientOrCompany || "Organization";

    // Send verification email to the verifier
    const emailResult = await sendVerificationEmail({
      verifierEmail: verifierEmail.toLowerCase().trim(),
      verifierName: verifierName || "",
      verifierTitle: verifierTitle || "Engineering Lead / Manager",
      professionalName: req.user.name,
      professionalEmail: req.user.email,
      itemType: type,
      itemTitle,
      companyOrClient,
      requestMessage,
      verificationUrl: fullVerificationUrl,
    });

    await logAudit({
      userId: req.user._id,
      action: "VERIFICATION_REQUESTED",
      targetType: "VerificationRequest",
      targetId: verification._id.toString(),
      req,
      details: {
        type,
        targetItemId: (experienceId || projectId).toString(),
        verifierEmail,
        emailSent: emailResult?.success ?? false,
      },
    });

    res.status(201).json({
      success: true,
      message: `Verification request email dispatched to ${verifierEmail.toLowerCase().trim()}.`,
      verification,
      verificationUrl: `/verification/${token}`,
      fullVerificationUrl,
      emailSent: emailResult?.success ?? false,
      previewUrl: emailResult?.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verification details by token (Public or Authenticated)
// @route   GET /api/v1/verifications/review/:token
// @access  Public
exports.getVerificationByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const verification = await VerificationRequest.findOne({ token })
      .populate("professional", "name email avatar country city")
      .populate("experience")
      .populate("project")
      .populate("targetOrganization", "name logo verified website");

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found or link has expired.",
      });
    }

    res.status(200).json({
      success: true,
      verification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit verification decision (Approve or Reject)
// @route   POST /api/v1/verifications/review/:token
// @access  Public / Authenticated
exports.submitVerificationDecision = async (req, res, next) => {
  try {
    const { token } = req.params;
    const {
      status, // 'approved' or 'rejected'
      responseNotes,
      rating = 5,
      technicalCompetence = 5,
      communication = 5,
      reliability = 5,
      relationship = "Direct Manager",
      verifierName,
      verifierOrganization,
    } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'.",
      });
    }

    const verification = await VerificationRequest.findOne({ token })
      .populate("professional")
      .populate("experience")
      .populate("project")
      .populate("targetOrganization");

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found.",
      });
    }

    if (verification.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This verification request has already been ${verification.status}.`,
      });
    }

    const reviewerUser = req.user ? req.user : null;
    const finalVerifierName =
      verifierName ||
      reviewerUser?.name ||
      verification.verifierName ||
      "Verified Employer Representative";
    const finalOrgName =
      verifierOrganization ||
      verification.targetOrganization?.name ||
      verification.experience?.company ||
      verification.project?.clientOrCompany ||
      "Verified Organization";

    verification.status = status;
    verification.responseNotes = responseNotes || "";
    verification.rating = rating;
    verification.reviewedBy = reviewerUser ? reviewerUser._id : undefined;
    verification.reviewedAt = new Date();
    await verification.save();

    const refCode = `VER-${verification.type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    if (status === "approved") {
      if (verification.type === "experience" && verification.experience) {
        const exp = await Experience.findById(verification.experience._id);
        if (exp) {
          exp.verificationStatus = "verified";
          exp.verifiedBy = {
            verifierUser: reviewerUser ? reviewerUser._id : undefined,
            verifierName: finalVerifierName,
            verifierEmail: verification.verifierEmail,
            verifierRole: verification.verifierTitle,
            verifierOrganization: finalOrgName,
            verifiedAt: new Date(),
            verificationNotes: responseNotes || "Employment and duties confirmed.",
            verificationReferenceCode: refCode,
          };
          await exp.save();
        }
      } else if (verification.type === "project" && verification.project) {
        const proj = await Project.findById(verification.project._id);
        if (proj) {
          proj.verificationStatus = "verified";
          proj.verifiedBy = {
            verifierUser: reviewerUser ? reviewerUser._id : undefined,
            verifierName: finalVerifierName,
            verifierEmail: verification.verifierEmail,
            verifierRole: verification.verifierTitle,
            verifierOrganization: finalOrgName,
            verifiedAt: new Date(),
            verificationNotes: responseNotes || "Project delivery and key contributions verified.",
            verificationReferenceCode: refCode,
          };
          await proj.save();
        }
      }

      // Automatically create verified feedback if notes or rating was supplied
      if (responseNotes || rating) {
        await Feedback.create({
          professional: verification.professional._id,
          author: reviewerUser ? reviewerUser._id : verification.professional._id,
          organization: verification.targetOrganization?._id,
          experience: verification.experience?._id,
          project: verification.project?._id,
          rating: rating || 5,
          technicalCompetence: technicalCompetence || 5,
          communication: communication || 5,
          reliability: reliability || 5,
          review:
            responseNotes ||
            `Verified ${verification.type} credentials for ${verification.professional.name}. Outstanding commitment to high engineering standards.`,
          relationship,
          isVerifiedEmployer: true,
        });
      }

      // Recalculate reputation score
      await updateReputationScore(verification.professional._id);

      // Send positive notification to professional
      await createNotification({
        recipient: verification.professional._id,
        sender: reviewerUser ? reviewerUser._id : null,
        type: "verification_approved",
        title: "Verification Approved!",
        message: `Your ${verification.type} at ${finalOrgName} has been officially verified by ${finalVerifierName}. A Verified badge was added to your passport.`,
        actionUrl: `/passport/${verification.professional._id}`,
      });

      if (verification.professional?.email) {
        const clientUrl =
          process.env.CLIENT_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://talent-registry-azure.vercel.app"
            : "http://localhost:3000");
        const passportUrl = `${clientUrl.replace(/\/+$/, "")}/passport/${verification.professional._id}`;
        sendVerificationDecisionEmail({
          professionalEmail: verification.professional.email,
          professionalName: verification.professional.name,
          itemTitle:
            verification.experience?.title ||
            verification.project?.title ||
            "Engineering Claim",
          companyOrClient: finalOrgName,
          status: "approved",
          verifierName: finalVerifierName,
          responseNotes,
          passportUrl,
        }).catch((err) =>
          console.error("[Decision Email Error]", err.message)
        );
      }
    } else {
      // Rejected
      if (verification.type === "experience" && verification.experience) {
        await Experience.findByIdAndUpdate(verification.experience._id, {
          verificationStatus: "rejected",
          rejectionReason: responseNotes || "Information could not be verified.",
        });
      } else if (verification.type === "project" && verification.project) {
        await Project.findByIdAndUpdate(verification.project._id, {
          verificationStatus: "rejected",
          rejectionReason: responseNotes || "Information could not be verified.",
        });
      }

      // Notify professional
      await createNotification({
        recipient: verification.professional._id,
        sender: reviewerUser ? reviewerUser._id : null,
        type: "verification_rejected",
        title: "Verification Update",
        message: `Your ${verification.type} verification request at ${finalOrgName} was not approved: "${responseNotes || "Details could not be confirmed"}".`,
        actionUrl: "/dashboard",
      });

      if (verification.professional?.email) {
        sendVerificationDecisionEmail({
          professionalEmail: verification.professional.email,
          professionalName: verification.professional.name,
          itemTitle:
            verification.experience?.title ||
            verification.project?.title ||
            "Engineering Claim",
          companyOrClient: finalOrgName,
          status: "rejected",
          verifierName: finalVerifierName,
          responseNotes,
        }).catch((err) =>
          console.error("[Decision Email Error]", err.message)
        );
      }
    }

    await logAudit({
      userId: reviewerUser ? reviewerUser._id : null,
      action: status === "approved" ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
      targetType: "VerificationRequest",
      targetId: verification._id.toString(),
      req,
      details: {
        status,
        verifierEmail: verification.verifierEmail,
        professionalId: verification.professional._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      message: `Verification request ${status} successfully.`,
      referenceCode: refCode,
      status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's verifications (sent by professional OR received by employer)
// @route   GET /api/v1/verifications/list
// @access  Private
exports.getMyVerifications = async (req, res, next) => {
  try {
    let requests = [];

    if (req.user.role === "professional") {
      requests = await VerificationRequest.find({ professional: req.user._id })
        .populate("experience")
        .populate("project")
        .populate("targetOrganization", "name logo verified")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "employer") {
      // Find requests matching employer's email or organization
      const orgId = req.user.organization?._id || req.user.organization;
      const conditions = [{ verifierEmail: req.user.email.toLowerCase() }];
      if (orgId) {
        conditions.push({ targetOrganization: orgId });
      }

      requests = await VerificationRequest.find({ $or: conditions })
        .populate("professional", "name email avatar country city")
        .populate("experience")
        .populate("project")
        .populate("targetOrganization", "name logo verified")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "admin") {
      requests = await VerificationRequest.find()
        .populate("professional", "name email avatar country city")
        .populate("experience")
        .populate("project")
        .populate("targetOrganization", "name logo verified")
        .sort({ createdAt: -1 })
        .limit(100);
    }

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email for a pending request
// @route   POST /api/v1/verifications/:id/resend
// @access  Private (Professional)
exports.resendVerification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const verification = await VerificationRequest.findOne({
      _id: id,
      professional: req.user._id,
    })
      .populate("experience")
      .populate("project");

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found or not owned by you.",
      });
    }

    if (verification.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot resend. Verification request has already been ${verification.status}.`,
      });
    }

    const clientUrl =
      process.env.CLIENT_URL ||
      (req.get("origin") && !req.get("origin").includes("localhost:5000")
        ? req.get("origin")
        : null) ||
      (process.env.NODE_ENV === "production"
        ? "https://talent-registry-azure.vercel.app"
        : "http://localhost:3000");
    const cleanClientUrl = clientUrl.replace(/\/+$/, "");
    const fullVerificationUrl = `${cleanClientUrl}/verification/${verification.token}`;

    const targetItem = verification.experience || verification.project;
    const itemTitle = targetItem?.title || targetItem?.role || "Engineering Contributor";
    const companyOrClient =
      targetItem?.company || targetItem?.clientOrCompany || "Organization";

    const emailResult = await sendVerificationEmail({
      verifierEmail: verification.verifierEmail,
      verifierName: verification.verifierName || "",
      verifierTitle: verification.verifierTitle || "Engineering Lead",
      professionalName: req.user.name,
      professionalEmail: req.user.email,
      itemType: verification.type,
      itemTitle,
      companyOrClient,
      requestMessage: verification.requestMessage,
      verificationUrl: fullVerificationUrl,
    });

    res.status(200).json({
      success: true,
      message: `Verification email resent to ${verification.verifierEmail}.`,
      fullVerificationUrl,
      emailSent: emailResult?.success ?? false,
      previewUrl: emailResult?.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

