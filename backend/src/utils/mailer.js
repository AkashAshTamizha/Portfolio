import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

// Escapes HTML-significant characters so user-submitted form values can't
// inject markup/scripts into the HTML email body rendered by mail clients.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const t = getTransporter();
  if (!t) {
    // Dev fallback so the flow is testable without SMTP configured.
    console.warn("[mail] SMTP not configured — password reset link (dev only):");
    console.warn(`[mail] ${resetUrl}`);
    return;
  }

  await t.sendMail({
    from: `"Portfolio Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your admin password",
    text: `You requested a password reset. Click the link below (valid for 30 minutes):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <p>You requested a password reset for your portfolio admin account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a> (valid for 30 minutes).</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendContactNotification({ name, email, subject, message }) {
  const t = getTransporter();
  if (!t) {
    console.warn("[mail] SMTP not configured — skipping email notification.");
    return;
  }

  const to = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

  await t.sendMail({
    from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
    to,
    replyTo: email,
    subject: `[Portfolio] ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `
      <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p>${safeMessage}</p>
    `,
  });
}
