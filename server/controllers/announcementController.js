const Announcement = require('../models/Announcement');

// Public: Get active announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      text: req.body.text,
      author: req.user.id
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
};

// Admin: Update/Toggle announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!announcement) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Update failed' });
  }
};

// Admin: Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Not found' });
    await announcement.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};
