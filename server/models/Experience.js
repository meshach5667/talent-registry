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
    projectUrl: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

ExperienceSchema.index({ user: 1, startDate: -1 });

module.exports =
  mongoose.models.Experience || mongoose.model("Experience", ExperienceSchema);
