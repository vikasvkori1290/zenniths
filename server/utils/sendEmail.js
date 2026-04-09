const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // ── Production: use Resend HTTP API (bypasses Render SMTP firewall) ──────────
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Zenniths <onboarding@resend.dev>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    });
    if (error) {
      console.error(`❌ Resend FAILED to ${options.email}:`, error);
      throw new Error(error.message);
    }
    console.log(`✅ [Resend] Email sent to ${options.email} — ID: ${data.id}`);
    return;
  }

  // ── Local Dev: fallback to Gmail via nodemailer ───────────────────────────
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const info = await transporter.sendMail({
    from: `"Zenniths" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  });
  console.log(`✅ [Nodemailer] Email sent to ${options.email} — ID: ${info.messageId}`);
};

module.exports = sendEmail;
