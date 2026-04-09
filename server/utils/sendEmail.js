const { Resend } = require('resend');

// Resend uses HTTP API (not SMTP) — works on Render/Vercel/AWS where SMTP is blocked
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Zenniths <onboarding@resend.dev>', // Use resend.dev until you verify a domain
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error(`❌ Resend email FAILED to ${options.email}:`, error);
      throw new Error(error.message);
    }

    console.log(`✅ Email sent to ${options.email} — ID: ${data.id}`);
  } catch (err) {
    console.error(`❌ Email error for ${options.email}:`, err.message);
    throw err;
  }
};

module.exports = sendEmail;
