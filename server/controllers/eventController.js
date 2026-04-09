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
      .select('-teams.members')
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
      .populate('teams.leader', 'name email mobile avatar usn course batch')
      .populate('volunteers', 'name email mobile avatar techStack usn course batch');

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
    const isRegistered = event.registeredUsers.some(id => id.toString() === userId);
    const isTeamLeader = event.teams.some(t => t.leader.toString() === userId);
    const isVolunteer = event.volunteers.some(id => id.toString() === userId);

    if (isRegistered || isTeamLeader) {
      // Un-register (removes both individual registration and any team led by this user)
      event.registeredUsers = event.registeredUsers.filter(id => id.toString() !== userId);
      event.teams = event.teams.filter(t => t.leader.toString() !== userId);
      event.markModified('teams');
    } else {
      if (isVolunteer) {
        res.status(400);
        return next(new Error('You are already registered as a volunteer. Cancel volunteering first to register as participant.'));
      }
      // Register
      event.registeredUsers.push(userId);
    }

    await event.save();
    await event.populate('createdBy', 'name');
    res.json({ success: true, registered: (!isRegistered && !isTeamLeader), event, totalRegistered: event.registeredUsers.length });
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

    // Check if user is already a volunteer
    const isVolunteer = event.volunteers.some(id => id.toString() === req.user.id);
    if (isVolunteer) {
      res.status(400);
      return next(new Error('You are already registered as a volunteer. Cancel volunteering first to register a team.'));
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
    res.status(201).json({ success: true, message: 'Team registered successfully', event, totalTeams: event.teams.length });
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
    const allowedFields = ['title', 'description', 'date', 'location', 'category', 'minTeam', 'maxTeam', 'volunteersNeeded'];
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

// ─── PATCH /api/events/:id/volunteer ─────────────────────────────────────────
const toggleVolunteer = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Event not found'));
    }

    const userId = req.user.id;
    const isVolunteer = event.volunteers.some(id => id.toString() === userId);
    const isRegistered = event.registeredUsers.some(id => id.toString() === userId) ||
      event.teams.some(t => t.leader.toString() === userId);

    if (isVolunteer) {
      // Un-volunteer
      event.volunteers = event.volunteers.filter(id => id.toString() !== userId);
      await event.save();
      return res.json({ success: true, volunteered: false, totalVolunteers: event.volunteers.length });
    }

    // Block if already in regular registration
    if (isRegistered) {
      res.status(400);
      return next(new Error('You are already registered as a participant. Unregister first to volunteer.'));
    }

    // Check capacity
    if (event.volunteersNeeded > 0 && event.volunteers.length >= event.volunteersNeeded) {
      res.status(400);
      return next(new Error('Volunteer slots are full.'));
    }

    event.volunteers.push(userId);
    await event.save();
    res.json({ success: true, volunteered: true, totalVolunteers: event.volunteers.length });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/events/my ────────────────────────────────────────────────────────
const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      $or: [
        { registeredUsers: req.user.id },
        { 'teams.leader': req.user.id },
        { 'teams.members.email': req.user.email },
        { volunteers: req.user.id }
      ]
    });
    res.json({ success: true, count: events.length, events });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/events/:id/feedback ─────────────────────────────────────────────
const addEventFeedback = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Event not found'));
    }

    if (event.date > new Date()) {
      res.status(400);
      return next(new Error('Cannot review an event that has not yet occurred.'));
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      return next(new Error('Please provide a valid rating between 1 and 5.'));
    }

    const alreadyReviewed = event.feedbacks && event.feedbacks.some(
      (feedback) => feedback.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      res.status(400);
      return next(new Error('You have already submitted feedback for this event.'));
    }

    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment: comment || '',
    };

    if (!event.feedbacks) {
      event.feedbacks = [];
    }
    
    event.feedbacks.push(review);
    await event.save();

    // Populate createdBy etc. to return a fully populated event object
    await event.populate('createdBy', 'name');

    res.status(201).json({ success: true, message: 'Feedback submitted successfully', event });
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
  toggleVolunteer,
  getMyEvents,
  addEventFeedback,
};

