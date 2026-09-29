const nodemailer = require("nodemailer");

let cachedTestAccount = null;

/**
 * Helper to get ethereal test transporter
 */
async function getTestTransporter() {
  if (!cachedTestAccount) {
    try {
      cachedTestAccount = await nodemailer.createTestAccount();
      console.log(
        `[Email Service] Initialized Ethereal test account: ${cachedTestAccount.user}`
      );
    } catch (err) {
      console.warn(
        `[Email Service] Failed to create Ethereal test account: ${err.message}`
      );
      return null;
    }
  }

  const testTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: cachedTestAccount.user,
      pass: cachedTestAccount.pass,
    },
  });

  return {
    transporter: testTransporter,
    isTest: true,
  };
}

/**
 * Resolve an active email transporter
 */
async function getTransporter() {
  const host = (process.env.SMTP_HOST || "").toLowerCase();
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const rawPass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS;
  const pass = rawPass ? rawPass.trim().replace(/\s+/g, "") : "";

  // 1. Configured SMTP provider (Gmail, Brevo, Sendgrid, Mailgun, Amazon SES, etc.)
  if (host || user) {
    const isGmail = host.includes("gmail") || user?.includes("@gmail.com");
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    const transportConfig = isGmail
      ? {
          service: "gmail",
          auth: { user, pass },
        }
      : {
          host: host || "smtp.gmail.com",
          port,
          secure,
          auth: { user, pass },
        };

    return {
      transporter: nodemailer.createTransport(transportConfig),
      isTest: false,
    };
  }

  // 2. Development / Fallback using Ethereal Email test account
  return await getTestTransporter();
}

/**
 * Send an email via Resend API or SMTP
 */
async function sendEmail({ to, subject, html, text }) {
  let from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    '"Talent Registry" <noreply@talentregistry.africa>';

  const host = (process.env.SMTP_HOST || "").toLowerCase();
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;

  // Gmail strictly requires From address to match the authenticated Gmail account
  if ((host.includes("gmail") || user?.includes("@gmail.com")) && user) {
    from = `"Talent Registry" <${user}>`;
  }

  // Check for Resend API key first
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Talent Registry <onboarding@resend.dev>",
          to: [to],
          subject,
          html,
          text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Resend API failed with status ${res.status}`);
      }

      console.log(`[Email Service] Successfully sent via Resend API to ${to}: ${data.id}`);
      return { success: true, messageId: data.id };
    } catch (err) {
      console.error(`[Email Service] Resend API error:`, err.message);
      // Fallback to SMTP
    }
  }

  const transportInfo = await getTransporter();
  if (!transportInfo || !transportInfo.transporter) {
    console.warn(
      `[Email Service] No email transporter available. Email to ${to} could not be dispatched.`
    );
    return { success: false, error: "No email transporter configured" };
  }

  try {
    const info = await transportInfo.transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    let previewUrl = null;
    if (transportInfo.isTest) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(
        `\n============================================================\n[Email Service] Ethereal Preview URL for ${to}:\n${previewUrl}\n============================================================\n`
      );
    } else {
      console.log(`[Email Service] Email sent to ${to} [ID: ${info.messageId}]`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      isTest: transportInfo.isTest,
    };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${to}:`, error.message);

    let friendlyError = error.message;
    if (error.code === "EAUTH" || error.responseCode === 535) {
      friendlyError =
        "Gmail authentication failed (535 BadCredentials). Google requires a 16-character 'Google App Password' generated from your Google Account security settings, not your standard account password.";
    }

    // Try fallback to Ethereal so user has a working dev preview
    try {
      const fallback = await getTestTransporter();
      if (fallback) {
        const testInfo = await fallback.transporter.sendMail({
          from: '"Talent Registry" <noreply@talentregistry.africa>',
          to,
          subject,
          html,
          text,
        });
        const previewUrl = nodemailer.getTestMessageUrl(testInfo);
        return {
          success: false,
          error: friendlyError,
          previewUrl,
        };
      }
    } catch (e) {
      // ignore
    }

    return {
      success: false,
      error: friendlyError,
    };
  }
}

/**
 * Send official verification request email to the verifier
 */
async function sendVerificationEmail({
  verifierEmail,
  verifierName,
  verifierTitle,
  professionalName,
  professionalEmail,
  itemType,
  itemTitle,
  companyOrClient,
  requestMessage,
  verificationUrl,
}) {
  const isExp = itemType === "experience";
  const itemTypeLabel = isExp ? "Professional Experience" : "Delivered Project";
  const formattedVerifierName = verifierName || "Engineering Leader";
  const subject = `Action Required: Official Verification Request for ${professionalName} — Talent Registry`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px;">Official Verification Request</span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Talent Registry</h1>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Verified African & Global Engineering Credentials</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; margin: 0 0 16px 0; color: #334155;">
                Hello <strong>${formattedVerifierName}</strong>,
              </p>
              
              <p style="font-size: 14px; margin: 0 0 20px 0; color: #334155;">
                <strong>${professionalName}</strong> (<a href="mailto:${professionalEmail}" style="color: #0284c7; text-decoration: none;">${professionalEmail}</a>) has listed work with your organization and designated you to verify their engineering contributions on their public Developer Passport.
              </p>

              <!-- Verification Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px;">
                      Claim Details
                    </div>
                    <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                      ${itemTitle}
                    </div>
                    <div style="font-size: 14px; font-weight: 600; color: #2563eb; margin-bottom: 12px;">
                      ${companyOrClient} &bull; <span style="color: #64748b; font-weight: 400;">${itemTypeLabel}</span>
                    </div>

                    ${
                      requestMessage
                        ? `<div style="background-color: #ffffff; border-left: 3px solid #10b981; padding: 12px; border-radius: 4px; font-size: 13px; color: #334155; font-style: italic;">
                            "${requestMessage}"
                          </div>`
                        : ""
                    }
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 28px 0 28px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 8px; border: 1px solid #0f172a; letter-spacing: 0.01em;">
                  Review & Verify Credentials &rarr;
                </a>
              </div>

              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #854d0e;">
                <strong>Fast & Secure:</strong> You do not need to create an account to verify this claim. The link above takes you directly to the review form where you can confirm duties, add recommendations, or flag discrepancies.
              </div>

              <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">
                If the button above does not work, copy and paste this link into your web browser:
              </p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 11px; color: #475569; word-break: break-all;">
                ${verificationUrl}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #94a3b8; text-align: center;">
              <p style="margin: 0 0 6px 0;">
                This email was sent to <strong>${verifierEmail}</strong> on behalf of ${professionalName}.
              </p>
              <p style="margin: 0;">
                Talent Registry &copy; ${new Date().getFullYear()} &bull; Verified African Engineering Excellence
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
TALENT REGISTRY - VERIFICATION REQUEST
==================================================

Hello ${formattedVerifierName},

${professionalName} (${professionalEmail}) has requested you verify their credentials as:

- Item: ${itemTitle}
- Organization / Client: ${companyOrClient}
- Type: ${itemTypeLabel}
${requestMessage ? `\nPersonal Note:\n"${requestMessage}"\n` : ""}

Please review and confirm or reject this verification claim using the secure link below (no account required):
${verificationUrl}

Thank you,
The Talent Registry Team
https://talentregistry.africa
`.trim();

  return await sendEmail({
    to: verifierEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send notification to professional when their claim has been reviewed
 */
async function sendVerificationDecisionEmail({
  professionalEmail,
  professionalName,
  itemTitle,
  companyOrClient,
  status,
  verifierName,
  responseNotes,
  passportUrl,
}) {
  const isApproved = status === "approved";
  const subject = `Your verification for "${itemTitle}" was ${isApproved ? "Approved" : "Reviewed"}`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1e293b; padding: 20px;">
  <h2>${isApproved ? "Congratulations! Claim Verified" : "Verification Update"}</h2>
  <p>Hello ${professionalName},</p>
  <p>
    <strong>${verifierName || "Your verifier"}</strong> has reviewed your claim for 
    <strong>${itemTitle}</strong> at <strong>${companyOrClient}</strong>.
  </p>
  <p><strong>Status:</strong> ${isApproved ? "Verified (Approved)" : "Not Approved"}</p>
  ${responseNotes ? `<p><strong>Feedback:</strong> "${responseNotes}"</p>` : ""}
  ${
    passportUrl
      ? `<p><a href="${passportUrl}" style="display:inline-block;padding:10px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">View Your Passport</a></p>`
      : ""
  }
</body>
</html>
  `.trim();

  const text = `
Hello ${professionalName},

Your verification claim for ${itemTitle} at ${companyOrClient} was ${status} by ${verifierName || "your verifier"}.
${responseNotes ? `Feedback: "${responseNotes}"` : ""}

Talent Registry Team
  `.trim();

  return await sendEmail({
    to: professionalEmail,
    subject,
    html,
    text,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendVerificationDecisionEmail,
};
