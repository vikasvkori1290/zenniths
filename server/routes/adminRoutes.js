const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPendingSubmissions,
  gradeSubmission,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes must be heavily protected
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/submissions/pending', getPendingSubmissions);
router.patch('/submissions/:id/grade', gradeSubmission);

module.exports = router;
