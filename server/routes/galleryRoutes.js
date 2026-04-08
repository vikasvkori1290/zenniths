const express = require('express');
const { getGalleryImages, uploadImage, deleteImage } = require('../controllers/galleryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getGalleryImages)
  .post(protect, adminOnly, uploadImage);

router.route('/:id')
  .delete(protect, adminOnly, deleteImage);

module.exports = router;
