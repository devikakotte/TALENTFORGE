const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
    });
  }
  return transporter;
}

/**
 * Sends an email. Failures are logged but never thrown up to the caller
 * for non-critical notifications (e.g. "application received") so a
 * flaky SMTP provider never breaks the core request/response flow.
 * Critical flows (password reset, email verification) should check the
 * return value and surface a clear error if delivery fails.
 */
async function sendEmail({ to, subject, html, critical = false }) {
  try {
    const info = await getTransporter().sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Email send failed to ${to}: ${error.message}`);
    if (critical) {
      throw error;
    }
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };
