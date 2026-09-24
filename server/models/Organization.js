const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
    },
    logo: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    industry: {
      type: String,
      required: true,
      default: "Technology",
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
    description: {
      type: String,
      default: "",
    },
    workEmailDomain: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationDocuments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stats: {
      verificationsCompleted: { type: Number, default: 0 },
      activeProfessionalsHired: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

OrganizationSchema.pre("save", function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});

module.exports =
  mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);
