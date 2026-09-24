const Notification = require("../models/Notification");

/**
 * Helper to create system or action notifications
 */
async function createNotification({
  recipient,
  sender = null,
  type,
  title,
  message,
  actionUrl = "",
  metadata = {},
}) {
  try {
    if (!recipient) return null;
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      actionUrl,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error("[Notification Service Error]", error.message);
    return null;
  }
}

module.exports = {
  createNotification,
};
