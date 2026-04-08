const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  deleteUser,
  deleteMe,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Member routes
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.delete('/me', protect, deleteMe);

// Admin-only routes
router.patch('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
