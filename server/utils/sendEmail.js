const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `"ClubHub Admin" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3) Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email successfully sent to:", options.email);
  } catch (error) {
    console.error("CRITICAL EMAIL SENDING ERROR:");
    console.error(error);
  }
};

module.exports = sendEmail;
