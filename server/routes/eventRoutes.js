const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  toggleEventRegistration,
  registerTeam,
  deleteEvent,
  toggleVolunteer,
  getMyEvents,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.route('/')
  .get(getAllEvents)
  .post(protect, adminOnly, upload.single('poster'), createEvent);

router.get('/my', protect, getMyEvents);

router.route('/:id')
  .get(getEventById)
  .put(protect, adminOnly, upload.single('poster'), updateEvent)
  .delete(protect, adminOnly, deleteEvent);

// Members can register or unregister for an event
router.patch('/:id/register', protect, toggleEventRegistration);

// Team registration for team events
router.post('/:id/register-team', protect, registerTeam);

// Volunteer for an event
router.patch('/:id/volunteer', protect, toggleVolunteer);

module.exports = router;
