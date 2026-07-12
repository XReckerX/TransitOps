const nodemailer = require('nodemailer');

// Setup transparent email sender (fallback to log if no credentials)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || 'your_smtp_user',
    pass: process.env.SMTP_PASS || 'your_smtp_pass'
  }
});

async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@transitops.io',
      to,
      subject,
      text,
      html
    });
    console.log(`Email dispatched successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email dispatch failed: ${error.message}. Logging contents:`);
    console.log(`[EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return null;
  }
}

module.exports = {
  sendEmail
};
