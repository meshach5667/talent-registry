const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    technicalCompetence: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    review: {
      type: String,
      required: [true, "Feedback comment is required"],
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    relationship: {
      type: String,
      enum: [
        "Direct Manager",
        "Team Lead / CTO",
        "Client / Stakeholder",
        "Colleague / Peer",
      ],
      default: "Direct Manager",
    },
    isVerifiedEmployer: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ professional: 1, author: 1 });

module.exports =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
