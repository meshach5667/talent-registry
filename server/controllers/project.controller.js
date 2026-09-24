const Project = require("../models/Project");
const Organization = require("../models/Organization");
const { updateReputationScore } = require("../services/reputation.service");
const { logAudit } = require("../services/audit.service");

// @desc    Add project
// @route   POST /api/v1/projects
// @access  Private (Professional)
exports.addProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      role = "Contributor",
      clientOrCompany,
      organizationId,
      projectUrl,
      repoUrl,
      technologies,
      startDate,
      endDate,
      isOngoing,
      metrics,
    } = req.body;

    let orgId = organizationId;
    if (!orgId && clientOrCompany) {
      const existingOrg = await Organization.findOne({
        name: { $regex: new RegExp(`^${clientOrCompany.trim()}$`, "i") },
      });
      if (existingOrg) orgId = existingOrg._id;
    }

    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      role,
      clientOrCompany,
      organization: orgId,
      projectUrl,
      repoUrl,
      technologies: Array.isArray(technologies)
        ? technologies
        : technologies
        ? technologies.split(",").map((t) => t.trim())
        : [],
      startDate,
      endDate: isOngoing ? null : endDate,
      isOngoing: Boolean(isOngoing),
      metrics,
      verificationStatus: "unverified",
    });

    await updateReputationScore(req.user._id);

    await logAudit({
      userId: req.user._id,
      action: "PROJECT_CREATED",
      targetType: "Project",
      targetId: project._id.toString(),
      req,
      details: { title },
    });

    res.status(201).json({
      success: true,
      message: "Project added successfully.",
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private (Owner)
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project record not found.",
      });
    }

    if (
      project.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this project.",
      });
    }

    const {
      title,
      description,
      role,
      clientOrCompany,
      organizationId,
      projectUrl,
      repoUrl,
      technologies,
      startDate,
      endDate,
      isOngoing,
      metrics,
    } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (role) project.role = role;
    if (clientOrCompany !== undefined)
      project.clientOrCompany = clientOrCompany;
    if (organizationId) project.organization = organizationId;
    if (projectUrl !== undefined) project.projectUrl = projectUrl;
    if (repoUrl !== undefined) project.repoUrl = repoUrl;
    if (startDate) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = isOngoing ? null : endDate;
    if (isOngoing !== undefined) project.isOngoing = Boolean(isOngoing);
    if (metrics !== undefined) project.metrics = metrics;
    if (technologies !== undefined) {
      project.technologies = Array.isArray(technologies)
        ? technologies
        : technologies.split(",").map((t) => t.trim());
    }

    await project.save();
    await updateReputationScore(project.user);

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Private (Owner)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project record not found.",
      });
    }

    if (
      project.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this project.",
      });
    }

    await project.deleteOne();
    await updateReputationScore(req.user._id);

    await logAudit({
      userId: req.user._id,
      action: "PROJECT_DELETED",
      targetType: "Project",
      targetId: req.params.id,
      req,
    });

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
