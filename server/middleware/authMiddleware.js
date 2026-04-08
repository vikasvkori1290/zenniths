const { verifyAccessToken } = require('../utils/jwtUtils');
const User = require('../models/User');

/**
 * protect — Verifies JWT Bearer token and attaches user to req.user.
 * Usage: router.get('/route', protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      return next(new Error('Not authorized — no token provided'));
    }

    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized — user no longer exists'));
    }

    next();
  } catch (err) {
    res.status(401);
    next(new Error('Not authorized — invalid token'));
  }
};

/**
 * adminOnly — Restricts route to role === 'admin'. Always use AFTER protect.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  next(new Error('Access denied — admin only'));
};

module.exports = { protect, adminOnly };
