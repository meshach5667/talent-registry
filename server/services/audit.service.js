const AuditLog = require("../models/AuditLog");

/**
 * Log platform actions for audit trail
 */
async function logAudit({
  userId = null,
  action,
  targetType = "",
  targetId = "",
  req = null,
  details = {},
}) {
  try {
    let ipAddress = "127.0.0.1";
    let userAgent = "";

    if (req) {
      ipAddress =
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.ip ||
        "127.0.0.1";
      userAgent = req.headers["user-agent"] || "";
      if (!userId && req.user) {
        userId = req.user._id;
      }
    }

    await AuditLog.create({
      user: userId,
      action,
      targetType,
      targetId,
      ipAddress,
      userAgent,
      details,
    });
  } catch (error) {
    console.error("[Audit Service Error]", error.message);
  }
}

module.exports = {
  logAudit,
};
