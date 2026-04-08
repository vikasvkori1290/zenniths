const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  toggleEventRegistration,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.route('/')
  .get(getAllEvents)
  // Creating an event supports uploading an image field named 'poster'
  // and we restrict this to admins only to prevent spam.
  .post(protect, adminOnly, upload.single('poster'), createEvent);

router.route('/:id')
  .get(getEventById)
  .delete(protect, adminOnly, deleteEvent);

// Members can register or unregister for an event
router.patch('/:id/register', protect, toggleEventRegistration);

module.exports = router;
