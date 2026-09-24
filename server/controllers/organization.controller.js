const Organization = require("../models/Organization");
const Experience = require("../models/Experience");
const VerificationRequest = require("../models/VerificationRequest");
const { uploadImageBuffer, deleteImage } = require("../services/upload.service");
const { logAudit } = require("../services/audit.service");

// @desc    Get all organizations
// @route   GET /api/v1/organizations
// @access  Public
exports.getOrganizations = async (req, res, next) => {
  try {
    const { q, country, verified } = req.query;
    const query = {};

    if (q) {
      query.name = new RegExp(q.trim(), "i");
    }
    if (country && country !== "All") {
      query.country = new RegExp(`^${country}$`, "i");
    }
    if (verified === "true") {
      query.verified = true;
    }

    const organizations = await Organization.find(query)
      .sort({ verified: -1, name: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization by slug or ID
// @route   GET /api/v1/organizations/:idOrSlug
// @access  Public
exports.getOrganization = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let query = { slug: idOrSlug };
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ slug: idOrSlug }, { _id: idOrSlug }] };
    }

    const organization = await Organization.findOne(query).populate(
      "adminUser",
      "name email avatar"
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    // Find verified alumni / current professionals
    const verifiedExperiences = await Experience.find({
      organization: organization._id,
      verificationStatus: "verified",
    })
      .populate("user", "name avatar country city")
      .limit(20);

    res.status(200).json({
      success: true,
      organization,
      verifiedAlumni: verifiedExperiences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization profile (for owner/admin)
// @route   PUT /api/v1/organizations/:id
// @access  Private (Employer / Admin)
exports.updateOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    // Check ownership
    const isOwner =
      organization.adminUser &&
      organization.adminUser.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this organization.",
      });
    }

    const {
      name,
      website,
      industry,
      country,
      city,
      description,
      workEmailDomain,
    } = req.body;

    if (name) organization.name = name;
    if (website !== undefined) organization.website = website;
    if (industry) organization.industry = industry;
    if (country) organization.country = country;
    if (city !== undefined) organization.city = city;
    if (description !== undefined) organization.description = description;
    if (workEmailDomain !== undefined)
      organization.workEmailDomain = workEmailDomain;

    await organization.save();

    await logAudit({
      userId: req.user._id,
      action: "ORGANIZATION_UPDATED",
      targetType: "Organization",
      targetId: organization._id.toString(),
      req,
    });

    res.status(200).json({
      success: true,
      message: "Organization updated successfully.",
      organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload organization logo
// @route   POST /api/v1/organizations/:id/logo
// @access  Private (Employer / Admin)
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please choose an image file to upload.",
      });
    }

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    if (organization.logo) {
      await deleteImage(organization.logo);
    }

    const logoUrl = await uploadImageBuffer(
      req.file.buffer,
      req.file.originalname,
      "org-logos"
    );

    organization.logo = logoUrl;
    await organization.save();

    res.status(200).json({
      success: true,
      message: "Organization logo updated successfully.",
      logo: logoUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization dashboard metrics and requests
// @route   GET /api/v1/organizations/:id/dashboard
// @access  Private (Employer / Admin)
exports.getOrganizationDashboard = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    const pendingRequests = await VerificationRequest.find({
      $or: [{ targetOrganization: org._id }, { verifierEmail: req.user.email }],
      status: "pending",
    })
      .populate("professional", "name email avatar country city")
      .populate("experience")
      .populate("project");

    const completedVerifications = await VerificationRequest.find({
      $or: [{ targetOrganization: org._id }, { verifierEmail: req.user.email }],
      status: { $in: ["approved", "rejected"] },
    })
      .populate("professional", "name email avatar")
      .populate("experience")
      .populate("project")
      .sort({ updatedAt: -1 })
      .limit(10);

    const verifiedEmployeesCount = await Experience.countDocuments({
      organization: org._id,
      verificationStatus: "verified",
    });

    res.status(200).json({
      success: true,
      organization: org,
      metrics: {
        pendingRequestsCount: pendingRequests.length,
        verifiedEmployeesCount,
        totalVerificationsReviewed: completedVerifications.length,
      },
      pendingRequests,
      recentActivity: completedVerifications,
    });
  } catch (error) {
    next(error);
  }
};
