const express = require('express');
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getAnnouncements)
  .post(protect, adminOnly, createAnnouncement);

router.route('/:id')
  .put(protect, adminOnly, updateAnnouncement)
  .delete(protect, adminOnly, deleteAnnouncement);

module.exports = router;
