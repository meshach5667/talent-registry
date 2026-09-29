const Experience = require("../models/Experience");
const Organization = require("../models/Organization");
const { updateReputationScore } = require("../services/reputation.service");
const { logAudit } = require("../services/audit.service");

// @desc    Add work experience
// @route   POST /api/v1/experiences
// @access  Private (Professional)
exports.addExperience = async (req, res, next) => {
  try {
    const {
      title,
      company,
      organizationId,
      location,
      locationType,
      employmentType,
      startDate,
      endDate,
      isCurrent,
      description,
      skillsUsed,
      projectUrl,
      link,
      portfolioUrl,
    } = req.body;

    let orgId = organizationId;
    if (!orgId && company) {
      const existingOrg = await Organization.findOne({
        name: { $regex: new RegExp(`^${company.trim()}$`, "i") },
      });
      if (existingOrg) {
        orgId = existingOrg._id;
      }
    }

    const experienceLink = (projectUrl || link || portfolioUrl || "").trim();

    const experience = await Experience.create({
      user: req.user._id,
      title,
      company,
      organization: orgId,
      location,
      locationType,
      employmentType,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent: Boolean(isCurrent),
      description,
      skillsUsed: Array.isArray(skillsUsed)
        ? skillsUsed
        : skillsUsed
        ? skillsUsed.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      projectUrl: experienceLink,
      link: experienceLink,
    });

    await updateReputationScore(req.user._id);

    await logAudit({
      userId: req.user._id,
      action: "EXPERIENCE_CREATED",
      targetType: "Experience",
      targetId: experience._id.toString(),
      req,
      details: { title, company },
    });

    res.status(201).json({
      success: true,
      message: "Work history entry added successfully.",
      experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update work experience
// @route   PUT /api/v1/experiences/:id
// @access  Private (Owner)
exports.updateExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience record not found.",
      });
    }

    if (
      experience.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this experience.",
      });
    }

    const {
      title,
      company,
      organizationId,
      location,
      locationType,
      employmentType,
      startDate,
      endDate,
      isCurrent,
      description,
      skillsUsed,
      projectUrl,
      link,
      portfolioUrl,
    } = req.body;

    if (title) experience.title = title;
    if (company) experience.company = company;
    if (organizationId !== undefined) experience.organization = organizationId;
    if (location !== undefined) experience.location = location;
    if (locationType) experience.locationType = locationType;
    if (employmentType) experience.employmentType = employmentType;
    if (startDate) experience.startDate = startDate;
    if (endDate !== undefined) experience.endDate = isCurrent ? null : endDate;
    if (isCurrent !== undefined) experience.isCurrent = Boolean(isCurrent);
    if (description !== undefined) experience.description = description;
    if (skillsUsed !== undefined) {
      experience.skillsUsed = Array.isArray(skillsUsed)
        ? skillsUsed
        : skillsUsed.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const experienceLink = projectUrl !== undefined ? projectUrl : link !== undefined ? link : portfolioUrl;
    if (experienceLink !== undefined) {
      experience.projectUrl = experienceLink.trim();
      experience.link = experienceLink.trim();
    }

    await experience.save();
    await updateReputationScore(experience.user);

    res.status(200).json({
      success: true,
      message: "Experience updated successfully.",
      experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work experience
// @route   DELETE /api/v1/experiences/:id
// @access  Private (Owner)
exports.deleteExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience record not found.",
      });
    }

    if (
      experience.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this experience.",
      });
    }

    await experience.deleteOne();
    await updateReputationScore(req.user._id);

    await logAudit({
      userId: req.user._id,
      action: "EXPERIENCE_DELETED",
      targetType: "Experience",
      targetId: req.params.id,
      req,
    });

    res.status(200).json({
      success: true,
      message: "Experience deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
