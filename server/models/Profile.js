const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      default: "Professional",
      maxlength: [140, "Headline cannot exceed 140 characters"],
    },
    bio: {
      type: String,
      default: "",
      maxlength: [2000, "Bio cannot exceed 2000 characters"],
    },
    profession: {
      type: String,
      default: "Software Engineer",
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    country: {
      type: String,
      required: true,
      default: "Nigeria",
    },
    city: {
      type: String,
      default: "Lagos",
    },
    passportSlug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    skills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: "Technical" },
        verifiedCount: { type: Number, default: 0 },
      },
    ],
    languages: [
      {
        type: String,
      },
    ],
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      dribbble: { type: String, default: "" },
    },
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
        current: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
        verifiedBy: { type: String },
      },
    ],
    certifications: [
      {
        title: { type: String, required: true },
        issuer: { type: String, required: true },
        issueDate: { type: Date },
        expirationDate: { type: Date },
        credentialId: { type: String },
        credentialUrl: { type: String },
        verified: { type: Boolean, default: false },
      },
    ],
    reputation: {
      score: { type: Number, default: 35, min: 0, max: 100 },
      tier: {
        type: String,
        enum: ["Unverified", "Emerging", "Verified Pro", "Pro Talent", "Elite Talent"],
        default: "Emerging",
      },
      completedJobs: { type: Number, default: 0 },
      clientConfirmations: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      feedbackCount: { type: Number, default: 0 },
      reliabilityIndex: { type: Number, default: 75, min: 0, max: 100 },
    },
    availability: {
      status: {
        type: String,
        enum: ["available", "open_to_offers", "unavailable"],
        default: "open_to_offers",
      },
      hourlyRate: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      remoteOnly: { type: Boolean, default: true },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    passportViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ProfileSchema.index({ country: 1, profession: 1, "reputation.score": -1 });
ProfileSchema.index({ "skills.name": 1 });

module.exports =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
