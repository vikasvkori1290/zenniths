const nodemailer = require('nodemailer');

// Create transporter once (connection pooling) instead of per-request
// Using port 465 + SSL (more reliable on cloud servers than 587/STARTTLS)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL — works better than STARTTLS (587) on cloud hosts like Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,         // Reuse connections instead of opening new ones each send
  maxConnections: 3,
  socketTimeout: 10000,  // 10 second timeout
  tls: {
    rejectUnauthorized: false, // Prevent TLS cert errors on cloud networks
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Zenniths 🚀" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.email} — MessageID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Email FAILED to ${options.email}:`, error.message);
    throw error; // Re-throw so caller's .catch() can log it
  }
};

module.exports = sendEmail;
