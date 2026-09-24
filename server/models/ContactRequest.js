const mongoose = require("mongoose");

const ContactRequestSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [150, "Subject cannot exceed 150 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2500, "Message cannot exceed 2500 characters"],
    },
    roleOffered: {
      type: String,
      trim: true,
      default: "",
    },
    engagementType: {
      type: String,
      enum: [
        "full-time",
        "contract",
        "freelance",
        "consulting",
        "advisory",
      ],
      default: "full-time",
    },
    budgetRange: {
      type: String,
      trim: true,
      default: "Competitive / Market Rate",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "archived"],
      default: "pending",
    },
    responseMessage: {
      type: String,
      default: "",
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ContactRequestSchema.index({ professional: 1, employer: 1, status: 1 });

module.exports =
  mongoose.models.ContactRequest ||
  mongoose.model("ContactRequest", ContactRequestSchema);
