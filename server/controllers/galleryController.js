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
    const fileData = req.body.images || (req.body.image ? [req.body.image] : null);

    if (!fileData || !Array.isArray(fileData) || fileData.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an image or images' });
    }

    if (fileData.length > 15) {
       return res.status(400).json({ success: false, message: 'You can upload a maximum of 15 images at a time' });
    }

    // Upload all to Cloudinary concurrently
    const uploadPromises = fileData.map((fileBase64) =>
      cloudinary.uploader.upload(fileBase64, {
        folder: 'clubhub/gallery',
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Create DB records
    const galleryDocs = uploadResults.map(res => ({
      url: res.secure_url,
      title: req.body.title || 'Event Memory',
      uploadedBy: req.user.id
    }));

    const newImages = await Gallery.insertMany(galleryDocs);

    res.status(201).json({ success: true, data: newImages });
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
