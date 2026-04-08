const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');

const socialAuthSuccess = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/error`);
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token and basic user info
    // We pass the token in the URL so the frontend can capture it and save to localStorage
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth-success?token=${accessToken}`);
  } catch (err) {
    console.error('Social auth error:', err);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/error`);
  }
};

module.exports = {
  socialAuthSuccess,
};
