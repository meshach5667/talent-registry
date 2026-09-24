const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    location: {
      type: String,
      default: "Lagos, Nigeria",
    },
    locationType: {
      type: String,
      enum: ["remote", "hybrid", "on-site"],
      default: "remote",
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "freelance", "internship"],
      default: "full-time",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
    skillsUsed: [
      {
        type: String,
        trim: true,
      },
    ],
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    verifiedBy: {
      verifierUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifierName: String,
      verifierEmail: String,
      verifierRole: String,
      verifierOrganization: String,
      verifiedAt: Date,
      verificationNotes: String,
      verificationReferenceCode: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ExperienceSchema.index({ user: 1, verificationStatus: 1 });

module.exports =
  mongoose.models.Experience || mongoose.model("Experience", ExperienceSchema);
