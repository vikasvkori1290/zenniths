const Gallery = require('../models/Gallery');
const { v2: cloudinary } = require('cloudinary');

// Fetch all gallery images
exports.getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json({ success: true, count: images.length, data: images });
  } catch (error) {
    console.error('Fetch gallery error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Upload new image (Admin Only)
exports.uploadImage = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ success: false, message: 'Please provide an image' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'clubhub/gallery',
    });

    const newImage = await Gallery.create({
      url: result.secure_url,
      title: req.body.title || 'Event Memory',
      uploadedBy: req.user.id
    });

    res.status(201).json({ success: true, data: newImage });
  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

// Delete an image (Admin Only)
exports.deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    await image.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Gallery delete error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
