const mongoose = require("mongoose");

const DisputeSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["experience", "project", "profile", "feedback", "organization"],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    targetTitle: {
      type: String,
      default: "",
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "Fraudulent Experience",
        "False Role Claim",
        "Impersonation",
        "Fabricated Project",
        "Inaccurate Verification",
        "Unprofessional Conduct",
        "Other",
      ],
    },
    details: {
      type: String,
      required: true,
      maxlength: [2000, "Details cannot exceed 2000 characters"],
    },
    evidenceLinks: [String],
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "dismissed"],
      default: "open",
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

DisputeSchema.index({ status: 1, createdAt: -1 });

module.exports =
  mongoose.models.Dispute || mongoose.model("Dispute", DisputeSchema);
