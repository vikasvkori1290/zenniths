const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

/**
 * @route   POST /api/upload
 * @access  Private (Admin)
 * @desc    Upload an image to Cloudinary via Multer middleware.
 *          Frontend must send a FormData object with key "image".
 *
 * Example Axios call from Admin panel:
 *
 *   const formData = new FormData();
 *   formData.append('image', file);
 *
 *   const { data } = await axios.post('/api/upload', formData, {
 *     headers: {
 *       'Content-Type': 'multipart/form-data',
 *       // ↓ JWT token attached for authorization
 *       Authorization: `Bearer ${accessToken}`,
 *     },
 *   });
 *   // data.url contains the Cloudinary secure URL
 */
// Admin-only general upload
router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: req.file.path,
    public_id: req.file.filename,
  });
});

// Authenticated users can upload project thumbnails
router.post('/project', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: req.file.path,
    public_id: req.file.filename,
  });
});

module.exports = router;
