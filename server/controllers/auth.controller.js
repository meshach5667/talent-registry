const User = require("../models/User");
const Profile = require("../models/Profile");
const Organization = require("../models/Organization");
const { uploadImageBuffer, deleteImage } = require("../services/upload.service");
const { logAudit } = require("../services/audit.service");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = "professional",
      country = "Nigeria",
      city = "Lagos",
      organizationName,
      headline,
      profession,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    let organization = null;

    // If employer registers with organization name
    if (role === "employer" && organizationName) {
      let orgSlug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      organization = await Organization.findOne({
        $or: [{ name: organizationName }, { slug: orgSlug }],
      });

      if (!organization) {
        organization = await Organization.create({
          name: organizationName,
          slug: orgSlug,
          country,
          city,
          industry: "Technology",
          verified: false,
        });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      country,
      city,
      organization: organization ? organization._id : undefined,
    });

    // Create profile if professional
    if (role === "professional") {
      let baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Profile.findOne({ passportSlug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      await Profile.create({
        user: user._id,
        headline: headline || "Professional",
        profession: profession || "Software Engineer",
        country,
        city,
        passportSlug: uniqueSlug,
        skills: [
          { name: "JavaScript", category: "Technical" },
          { name: "Problem Solving", category: "General" },
        ],
      });
    }

    // Attach admin to organization if employer
    if (organization && role === "employer") {
      organization.adminUser = user._id;
      organization.members.push({ user: user._id, role: "owner" });
      await organization.save();
    }

    const token = user.getSignedJwtToken();

    await logAudit({
      userId: user._id,
      action: "USER_REGISTERED",
      targetType: "User",
      targetId: user._id.toString(),
      req,
      details: { role, email: user.email },
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        country: user.country,
        city: user.city,
        organization: organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password")
      .populate("organization");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials.",
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = user.getSignedJwtToken();

    // Fetch user profile if professional
    let profile = null;
    if (user.role === "professional") {
      profile = await Profile.findOne({ user: user._id });
    }

    await logAudit({
      userId: user._id,
      action: "USER_LOGIN",
      targetType: "User",
      targetId: user._id.toString(),
      req,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        country: user.country,
        city: user.city,
        organization: user.organization,
        profile: profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("organization");
    let profile = null;

    if (user.role === "professional") {
      profile = await Profile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        country: user.country,
        city: user.city,
        organization: user.organization,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload or replace profile photo
// @route   POST /api/v1/auth/photo
// @access  Private
exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please choose an image file to upload.",
      });
    }

    const user = await User.findById(req.user._id);

    // Delete existing photo if exists
    if (user.avatar) {
      await deleteImage(user.avatar);
    }

    // Upload new image
    const imageUrl = await uploadImageBuffer(
      req.file.buffer,
      req.file.originalname,
      "avatars"
    );

    user.avatar = imageUrl;
    await user.save();

    await logAudit({
      userId: user._id,
      action: "PROFILE_PHOTO_UPLOADED",
      targetType: "User",
      targetId: user._id.toString(),
      req,
      details: { avatarUrl: imageUrl },
    });

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully.",
      avatar: imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile photo
// @route   DELETE /api/v1/auth/photo
// @access  Private
exports.deletePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.avatar) {
      await deleteImage(user.avatar);
      user.avatar = "";
      await user.save();
    }

    await logAudit({
      userId: user._id,
      action: "PROFILE_PHOTO_DELETED",
      targetType: "User",
      targetId: user._id.toString(),
      req,
    });

    res.status(200).json({
      success: true,
      message: "Profile photo removed successfully.",
      avatar: "",
    });
  } catch (error) {
    next(error);
  }
};
