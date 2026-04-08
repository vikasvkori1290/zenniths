const User = require('../models/User');
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

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      return next(new Error('An account with this email already exists'));
    }

    const user = await User.create({ name, email, password, mobile });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    attachRefreshToken(res, refreshToken);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar,
        techStack: user.techStack,
      },
      accessToken,
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

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    attachRefreshToken(res, refreshToken);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar,
        techStack: user.techStack,
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

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, getMe };
