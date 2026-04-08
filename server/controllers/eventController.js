const Event = require('../models/Event');

// ─── GET /api/events ──────────────────────────────────────────────────────────
const getAllEvents = async (req, res, next) => {
  try {
    const { status } = req.query; // 'upcoming' or 'past'
    const query = {};

    if (status === 'upcoming') {
      query.date = { $gt: new Date() };
    } else if (status === 'past') {
      query.date = { $lte: new Date() };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .sort({ date: status === 'past' ? -1 : 1 }); // Descending for past, Ascending for upcoming

    res.json({ success: true, count: events.length, events });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/events/:id ──────────────────────────────────────────────────────
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('registeredUsers', 'name avatar');

    if (!event) {
      res.status(404);
      return next(new Error('Event not found'));
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/events ─────────────────────────────────────────────────────────
const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body, createdBy: req.user.id };
    
    // If there's a file uploaded via Multer/Cloudinary, grab the URL
    if (req.file && req.file.path) {
      eventData.poster = req.file.path;
    }

    const event = await Event.create(eventData);
    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/events/:id/register ───────────────────────────────────────────
const toggleEventRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Event not found'));
    }

    const userId = req.user.id;
    const isRegistered = event.registeredUsers.includes(userId);

    if (isRegistered) {
      // Un-register
      event.registeredUsers = event.registeredUsers.filter(id => id.toString() !== userId);
    } else {
      // Register
      event.registeredUsers.push(userId);
    }

    await event.save();
    res.json({ success: true, registered: !isRegistered, totalRegistered: event.registeredUsers.length });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/events/:id ───────────────────────────────────────────────────
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Event not found'));
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Not authorized to delete this event'));
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  toggleEventRegistration,
  deleteEvent,
};
