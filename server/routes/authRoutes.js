const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, refreshAccessToken, logoutUser, verifyOtp, getMe, changePassword,
} = require('../controllers/authController');
const { socialAuthSuccess } = require('../controllers/socialAuthController');
const passport = require('passport');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

// ─── SOCIAL AUTH ───
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth-error' }), socialAuthSuccess);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/auth-error' }), socialAuthSuccess);

module.exports = router;
