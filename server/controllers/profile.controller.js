const Profile = require("../models/Profile");
const User = require("../models/User");
const Experience = require("../models/Experience");
const Project = require("../models/Project");
const Feedback = require("../models/Feedback");
const { updateReputationScore } = require("../services/reputation.service");
const { logAudit } = require("../services/audit.service");

// @desc    Get public Professional Passport by slug or user ID
// @route   GET /api/v1/profiles/passport/:slug
// @access  Public
exports.getPublicPassport = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Check if slug is MongoDB ObjectId or slug string
    let profileQuery = { passportSlug: slug };
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      profileQuery = { $or: [{ passportSlug: slug }, { user: slug }, { _id: slug }] };
    }

    const profile = await Profile.findOne(profileQuery).populate(
      "user",
      "name email avatar country city role githubUsername"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Professional Passport not found.",
      });
    }

    // Increment view count asynchronously
    Profile.findByIdAndUpdate(profile._id, { $inc: { passportViews: 1 } }).exec();

    // Fetch experiences, projects, and feedbacks
    const experiences = await Experience.find({ user: profile.user._id })
      .populate("organization", "name logo verified")
      .sort({ startDate: -1 });

    const projects = await Project.find({ user: profile.user._id })
      .populate("organization", "name logo verified")
      .sort({ startDate: -1 });

    const feedbacks = await Feedback.find({ professional: profile.user._id })
      .populate("author", "name avatar organization role")
      .populate("organization", "name logo verified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      passport: {
        profile,
        experiences,
        projects,
        feedbacks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's full profile and items
// @route   GET /api/v1/profiles/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate(
      "user",
      "name email avatar country city role"
    );

    if (!profile) {
      // Auto-create initial profile if missing
      const baseSlug = req.user.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Profile.findOne({ passportSlug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      profile = await Profile.create({
        user: req.user._id,
        passportSlug: uniqueSlug,
        headline: "Professional",
        country: req.user.country || "Nigeria",
        city: req.user.city || "Lagos",
      });
    }

    const experiences = await Experience.find({ user: req.user._id })
      .populate("organization", "name logo verified")
      .sort({ startDate: -1 });

    const projects = await Project.find({ user: req.user._id })
      .populate("organization", "name logo verified")
      .sort({ startDate: -1 });

    const feedbacks = await Feedback.find({ professional: req.user._id })
      .populate("author", "name avatar organization")
      .populate("organization", "name logo verified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      profile,
      experiences,
      projects,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/v1/profiles/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      headline,
      bio,
      profession,
      country,
      city,
      skills,
      languages,
      socialLinks,
      education,
      certifications,
      availability,
      passportSlug,
    } = req.body;

    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check slug uniqueness if changed
    if (passportSlug && passportSlug !== profile.passportSlug) {
      const cleanSlug = passportSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "")
        .trim();
      const existing = await Profile.findOne({
        passportSlug: cleanSlug,
        _id: { $ne: profile._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "This passport URL slug is already taken. Please choose another.",
        });
      }
      profile.passportSlug = cleanSlug;
    }

    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (profession !== undefined) profile.profession = profession;
    if (country !== undefined) profile.country = country;
    if (city !== undefined) profile.city = city;
    if (skills !== undefined) profile.skills = skills;
    if (languages !== undefined) profile.languages = languages;
    if (socialLinks !== undefined) profile.socialLinks = socialLinks;
    if (education !== undefined) profile.education = education;
    if (certifications !== undefined) profile.certifications = certifications;
    if (availability !== undefined) profile.availability = availability;

    await profile.save();

    // Recalculate reputation
    await updateReputationScore(req.user._id);

    // Refresh profile
    profile = await Profile.findOne({ user: req.user._id }).populate(
      "user",
      "name email avatar country city"
    );

    await logAudit({
      userId: req.user._id,
      action: "PROFILE_UPDATED",
      targetType: "Profile",
      targetId: profile._id.toString(),
      req,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Talent Discovery / Search
// @route   GET /api/v1/profiles/search
// @access  Public
exports.searchProfiles = async (req, res, next) => {
  try {
    const {
      q,
      country,
      profession,
      skill,
      minScore,
      verifiedOnly,
      page = 1,
      limit = 12,
      sort = "score_desc",
    } = req.query;

    const query = { isPublic: true };

    if (country && country !== "All") {
      query.country = new RegExp(`^${country}$`, "i");
    }

    if (profession && profession !== "All") {
      query.profession = new RegExp(profession, "i");
    }

    if (skill && skill !== "All") {
      query["skills.name"] = new RegExp(`^${skill}$`, "i");
    }

    if (minScore) {
      query["reputation.score"] = { $gte: Number(minScore) };
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [
        { headline: searchRegex },
        { bio: searchRegex },
        { profession: searchRegex },
        { "skills.name": searchRegex },
        { city: searchRegex },
      ];
    }

    let sortObj = { "reputation.score": -1, createdAt: -1 };
    if (sort === "score_asc") sortObj = { "reputation.score": 1 };
    if (sort === "newest") sortObj = { createdAt: -1 };
    if (sort === "rating") sortObj = { "reputation.averageRating": -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Profile.countDocuments(query);
    const profiles = await Profile.find(query)
      .populate("user", "name avatar country city email githubUsername")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      profiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform stats and spotlight
// @route   GET /api/v1/profiles/spotlight
// @access  Public
exports.getSpotlight = async (req, res, next) => {
  try {
    const spotlightPros = await Profile.find({
      isPublic: true,
    })
      .populate("user", "name avatar country city githubUsername")
      .sort({ "reputation.score": -1 })
      .limit(6);

    const totalTalent = await Profile.countDocuments();
    const totalExperiences = await Experience.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();

    res.status(200).json({
      success: true,
      spotlight: spotlightPros,
      stats: {
        totalTalent,
        totalExperiences,
        totalProjects,
        totalFeedbacks,
      },
    });
  } catch (error) {
    next(error);
  }
};
