const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    role: {
      type: String,
      required: [true, "Role in project is required"],
      default: "Lead Contributor",
    },
    clientOrCompany: {
      type: String,
      trim: true,
      default: "",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    projectUrl: {
      type: String,
      default: "",
    },
    repoUrl: {
      type: String,
      default: "",
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isOngoing: {
      type: Boolean,
      default: false,
    },
    metrics: {
      type: String,
      default: "",
    },
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

ProjectSchema.index({ user: 1, verificationStatus: 1 });

module.exports =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
