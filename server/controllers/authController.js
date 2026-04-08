const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwtUtils');

// ─── Helper: attach refresh token as HTTP-only cookie ───────────────────────
const attachRefreshToken = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      res.status(400);
      return next(new Error('Please provide name, email, mobile and password'));
    }

    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        res.status(409);
        return next(new Error('An account with this email already exists'));
      } else {
        // They are unverified. Overwrite their details manually to resend OTP
        user.name = name;
        user.password = password;
        user.mobile = mobile;
      }
    } else {
      // New user
      user = new User({ name, email, password, mobile });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `
      <h2>Welcome to ClubFlow!</h2>
      <p>Your email verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your ClubFlow account',
        html: message,
      });
    } catch (error) {
      console.log('Error sending email', error);
    }

    res.status(201).json({
      success: true,
      requiresOtp: true,
      message: 'Registration successful! Please check your email for the OTP.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    if (!user.isVerified && user.role !== 'admin') {
      // Send new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      try {
        await sendEmail({
          email: user.email,
          subject: 'ClubFlow OTP Verification',
          html: `<p>Your verification code is: <strong>${otp}</strong>.</p><p>It will expire in 10 minutes.</p>`
        });
      } catch (emailErr) {
        console.error('Failed to send OTP email during login:', emailErr.message);
        // Still continue — user can request OTP again
      }

      return res.status(200).json({
        success: true,
        requiresOtp: true,
        message: 'Your account is not verified yet. A new OTP has been sent to your email.'
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    attachRefreshToken(res, refreshToken);

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar,
        techStack: user.techStack,
        usn: user.usn,
        course: user.course,
        batch: user.batch,
        bio: user.bio,
        github: user.github,
      },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      res.status(401);
      return next(new Error('No refresh token found'));
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      res.status(403);
      return next(new Error('Invalid refresh token'));
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logoutUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400);
      return next(new Error('Please provide email and OTP code.'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      return next(new Error('User not found.'));
    }

    if (user.isVerified) {
      res.status(400);
      return next(new Error('User is already verified.'));
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      res.status(400);
      return next(new Error('Invalid or expired OTP. Please try logging in again to request a new code.'));
    }

    // Success! Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    attachRefreshToken(res, refreshToken);

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar,
        techStack: user.techStack,
        usn: user.usn,
        course: user.course,
        batch: user.batch,
        bio: user.bio,
        github: user.github,
      },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyOtp,
  getMe,
};
