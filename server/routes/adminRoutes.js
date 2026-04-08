const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPublicStats,
  getPendingSubmissions,
  gradeSubmission,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route for landing page stats
router.get('/public-stats', getPublicStats);

// All other admin routes must be heavily protected
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/submissions/pending', getPendingSubmissions);
router.patch('/submissions/:id/grade', gradeSubmission);

module.exports = router;
