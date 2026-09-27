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

// Helper to create unique passport slug
async function generateUniqueSlug(name) {
  let baseSlug = (name || "developer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  let uniqueSlug = baseSlug || "talent";
  let counter = 1;
  while (await Profile.findOne({ passportSlug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

// @desc    Initiate GitHub OAuth
// @route   GET /api/v1/auth/github
// @access  Public
exports.githubAuth = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    `${req.protocol}://${req.get("host")}/api/v1/auth/github/callback`;

  if (!clientId) {
    return res.redirect(
      `${clientUrl}/auth/login?error=${encodeURIComponent(
        "GitHub OAuth is not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env or use the Quick GitHub Demo."
      )}`
    );
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,user:email&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}`;
  res.redirect(githubAuthUrl);
};

// @desc    GitHub OAuth callback
// @route   GET /api/v1/auth/github/callback
// @access  Public
exports.githubCallback = async (req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(
        `${clientUrl}/auth/login?error=${encodeURIComponent(
          "No authorization code returned from GitHub."
        )}`
      );
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const callbackUrl =
      process.env.GITHUB_CALLBACK_URL ||
      `${req.protocol}://${req.get("host")}/api/v1/auth/github/callback`;

    // 1. Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.redirect(
        `${clientUrl}/auth/login?error=${encodeURIComponent(
          tokenData.error_description || "Failed to obtain access token from GitHub."
        )}`
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch GitHub profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "TalentRegistry-App",
      },
    });
    const ghUser = await userRes.json();

    // 3. Fetch primary email if needed
    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "TalentRegistry-App",
        },
      });
      const emails = await emailRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e) => e.primary && e.verified) || emails[0];
        if (primary) email = primary.email;
      }
    }

    if (!email) {
      email = `${ghUser.login}@users.noreply.github.com`;
    }

    // 4. Find or create user
    let user = await User.findOne({
      $or: [{ githubId: String(ghUser.id) }, { email: email.toLowerCase() }],
    });

    if (user) {
      user.githubId = String(ghUser.id);
      user.githubUsername = ghUser.login || user.githubUsername;
      if (!user.avatar && ghUser.avatar_url) {
        user.avatar = ghUser.avatar_url;
      }
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        name: ghUser.name || ghUser.login || "GitHub Engineer",
        email: email.toLowerCase(),
        githubId: String(ghUser.id),
        githubUsername: ghUser.login || "",
        avatar: ghUser.avatar_url || "",
        role: "professional",
        country: "Nigeria",
        city: ghUser.location || "Lagos",
        status: "active",
        lastLogin: Date.now(),
      });

      const uniqueSlug = await generateUniqueSlug(user.name);
      await Profile.create({
        user: user._id,
        headline: ghUser.bio || "Open Source Software Engineer",
        profession: "Software Engineer",
        country: user.country,
        city: user.city,
        passportSlug: uniqueSlug,
        skills: [
          { name: "Git", category: "Technical" },
          { name: "GitHub", category: "Technical" },
          { name: "Open Source", category: "Technical" },
          { name: "JavaScript", category: "Technical" },
        ],
      });
    }

    const token = user.getSignedJwtToken();

    await logAudit({
      userId: user._id,
      action: "USER_LOGIN_GITHUB",
      targetType: "User",
      targetId: user._id.toString(),
      req,
      details: { githubUsername: ghUser.login },
    });

    return res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("[GitHub OAuth Error]:", error);
    return res.redirect(
      `${clientUrl}/auth/login?error=${encodeURIComponent(
        error.message || "GitHub authentication failed"
      )}`
    );
  }
};

// @desc    Direct / Client Exchange for GitHub or Mock Developer Login
// @route   POST /api/v1/auth/github/exchange
// @access  Public
exports.githubExchange = async (req, res, next) => {
  try {
    const { code, demo } = req.body;

    // Handle instant mock/demo test login if user requested demo test
    if (demo) {
      let demoUser = await User.findOne({ email: "octocat.dev@github.talentregistry.africa" });
      if (!demoUser) {
        demoUser = await User.create({
          name: "Amara Okonkwo (GitHub Pro)",
          email: "octocat.dev@github.talentregistry.africa",
          githubId: "gh_8829141",
          githubUsername: "amara-rust",
          avatar: "https://avatars.githubusercontent.com/u/583231?v=4",
          role: "professional",
          country: "Nigeria",
          city: "Lagos",
          status: "active",
          lastLogin: Date.now(),
        });

        const slug = await generateUniqueSlug(demoUser.name);
        await Profile.create({
          user: demoUser._id,
          headline: "Distributed Systems Architect & Core Contributor",
          profession: "Systems Engineer",
          country: "Nigeria",
          city: "Lagos",
          passportSlug: slug,
          skills: [
            { name: "Rust", category: "Technical" },
            { name: "Go", category: "Technical" },
            { name: "Kubernetes", category: "Technical" },
            { name: "Distributed Systems", category: "Technical" },
          ],
        });
      }

      const token = demoUser.getSignedJwtToken();
      const profile = await Profile.findOne({ user: demoUser._id });

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          avatar: demoUser.avatar,
          githubUsername: demoUser.githubUsername,
          country: demoUser.country,
          city: demoUser.city,
          profile,
        },
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required.",
      });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        message: "GitHub credentials not configured on the server.",
      });
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.status(400).json({
        success: false,
        message: tokenData.error_description || "Invalid authorization code",
      });
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "TalentRegistry-App",
      },
    });
    const ghUser = await userRes.json();

    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "TalentRegistry-App",
        },
      });
      const emails = await emailRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e) => e.primary && e.verified) || emails[0];
        if (primary) email = primary.email;
      }
    }

    if (!email) {
      email = `${ghUser.login}@users.noreply.github.com`;
    }

    let user = await User.findOne({
      $or: [{ githubId: String(ghUser.id) }, { email: email.toLowerCase() }],
    });

    if (user) {
      user.githubId = String(ghUser.id);
      user.githubUsername = ghUser.login || user.githubUsername;
      if (!user.avatar && ghUser.avatar_url) {
        user.avatar = ghUser.avatar_url;
      }
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        name: ghUser.name || ghUser.login || "GitHub Developer",
        email: email.toLowerCase(),
        githubId: String(ghUser.id),
        githubUsername: ghUser.login || "",
        avatar: ghUser.avatar_url || "",
        role: "professional",
        country: "Nigeria",
        city: ghUser.location || "Lagos",
        status: "active",
        lastLogin: Date.now(),
      });

      const uniqueSlug = await generateUniqueSlug(user.name);
      await Profile.create({
        user: user._id,
        headline: ghUser.bio || "Open Source Software Engineer",
        profession: "Software Engineer",
        country: user.country,
        city: user.city,
        passportSlug: uniqueSlug,
        skills: [
          { name: "Git", category: "Technical" },
          { name: "GitHub", category: "Technical" },
          { name: "Open Source", category: "Technical" },
        ],
      });
    }

    const token = user.getSignedJwtToken();
    let profile = await Profile.findOne({ user: user._id });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        githubUsername: user.githubUsername,
        country: user.country,
        city: user.city,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};
