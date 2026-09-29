const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/User");

async function createAdmin() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/talent_registry";
  console.log("[Create Admin] Connecting to database...");
  await mongoose.connect(uri);
  console.log("[Create Admin] Connected to MongoDB.");

  const adminEmail = "admin@talentregistry.africa";
  const adminPassword = "AdminPassword2026!";
  const adminName = "System Administrator";

  let admin = await User.findOne({ email: adminEmail }).select("+password");

  if (admin) {
    console.log(`[Create Admin] Existing admin found: ${admin.email}. Updating credentials...`);
    admin.name = adminName;
    admin.role = "admin";
    admin.password = adminPassword;
    admin.status = "active";
    await admin.save();
    console.log("[Create Admin] Admin password and role updated successfully.");
  } else {
    console.log(`[Create Admin] Creating new admin account for ${adminEmail}...`);
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      country: "Nigeria",
      city: "Lagos",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    });
    console.log("[Create Admin] Admin account created successfully.");
  }

  // Verify login by comparing password
  const verifyUser = await User.findOne({ email: adminEmail }).select("+password");
  const isMatch = await verifyUser.matchPassword(adminPassword);
  console.log(`[Create Admin] Credential verification test: ${isMatch ? "SUCCESS" : "FAILED"}`);

  console.log("\n=================================");
  console.log("Admin Account Credentials:");
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Role:     ${verifyUser.role}`);
  console.log("=================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("[Create Admin Error]", err);
  process.exit(1);
});
