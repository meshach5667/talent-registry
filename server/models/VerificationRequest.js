const mongoose = require("mongoose");
const crypto = require("crypto");

const VerificationRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["experience", "project"],
      required: true,
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    targetOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    verifierEmail: {
      type: String,
      required: [true, "Verifier email is required"],
      trim: true,
      lowercase: true,
    },
    verifierName: {
      type: String,
      trim: true,
      default: "",
    },
    verifierTitle: {
      type: String,
      trim: true,
      default: "Engineering Manager / Lead",
    },
    token: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending",
    },
    requestMessage: {
      type: String,
      default: "Please verify my role and contributions on Talent Registry.",
    },
    responseNotes: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

VerificationRequestSchema.pre("save", function () {
  if (!this.token) {
    this.token = crypto.randomBytes(24).toString("hex");
  }
});

module.exports =
  mongoose.models.VerificationRequest ||
  mongoose.model("VerificationRequest", VerificationRequestSchema);
