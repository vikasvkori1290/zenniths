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
      .populate('registeredUsers', 'name email mobile avatar techStack usn course batch')
      .populate('teams.leader', 'name email mobile avatar usn course batch');

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
    
    // Parse JSON arrays sent from frontend via FormData
    if (typeof req.body.facultyIncharge === 'string') {
      try { eventData.facultyIncharge = JSON.parse(req.body.facultyIncharge); } catch (e) {}
    }
    if (typeof req.body.studentIncharge === 'string') {
      try { eventData.studentIncharge = JSON.parse(req.body.studentIncharge); } catch (e) {}
    }

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

// ─── POST /api/events/:id/register-team ───────────────────────────────────────
const registerTeam = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Event not found'));
    }

    const { teamName, members } = req.body;
    if (!teamName || !members || !Array.isArray(members)) {
      res.status(400);
      return next(new Error('Team name and members are required'));
    }

    // Total members = leader + other members
    const totalSize = members.length + 1;
    if (totalSize < event.minTeam || totalSize > event.maxTeam) {
      res.status(400);
      return next(new Error(`Team size must be between ${event.minTeam} and ${event.maxTeam}`));
    }

    // Check if user already registered a team
    const alreadyRegistered = event.teams.some(t => t.leader.toString() === req.user.id);
    if (alreadyRegistered) {
      res.status(409);
      return next(new Error('You have already registered a team for this event'));
    }

    event.teams.push({
      teamName,
      leader: req.user.id,
      members,
    });

    // Also add leader to registeredUsers so they show in count
    if (!event.registeredUsers.includes(req.user.id)) {
      event.registeredUsers.push(req.user.id);
    }

    await event.save();
    res.status(201).json({ success: true, message: 'Team registered successfully', totalTeams: event.teams.length });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/events/:id ──────────────────────────────────────────────────────
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Event not found'));
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Not authorized to edit this event'));
    }

    // Update fields from body
    const allowedFields = ['title', 'description', 'date', 'location', 'category', 'minTeam', 'maxTeam'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    // If a new poster was uploaded, update it
    if (req.file && req.file.path) {
      event.poster = req.file.path;
    }

    await event.save();
    res.json({ success: true, event });
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
  updateEvent,
  toggleEventRegistration,
  registerTeam,
  deleteEvent,
};
