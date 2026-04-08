const User = require('../models/User');
const Project = require('../models/Project');
const Event = require('../models/Event');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const { broadcastLeaderboard } = require('../socket'); // Import socket broadcaster

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalChallenges = await Challenge.countDocuments();
    const pendingSubmissions = await Submission.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      stats: { totalUsers, totalProjects, totalEvents, totalChallenges, pendingSubmissions },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/submissions/pending ───────────────────────────────────────
const getPendingSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ status: 'Pending' })
      .populate('user', 'name email avatar')
      .populate('challenge', 'title points difficulty')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/admin/submissions/:id/grade ───────────────────────────────────
// Grades a submission, updates points if passed, and broadcasts real-time leaderboard update
const gradeSubmission = async (req, res, next) => {
  try {
    const { status, feedback } = req.body; // status: 'Passed' || 'Failed'

    if (!['Passed', 'Failed'].includes(status)) {
      res.status(400);
      return next(new Error('Invalid grade status. Must be Passed or Failed.'));
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      res.status(404);
      return next(new Error('Submission not found'));
    }

    submission.status = status;
    submission.feedback = feedback || '';
    await submission.save();

    // If the submission is passed, we need to recalculate and broadcast the global leaderboard
    if (status === 'Passed') {
      const allPassed = await Submission.find({ status: 'Passed' }).populate('challenge', 'points');
      const userScores = {};
      allPassed.forEach(sub => {
        const uid = sub.user.toString();
        const pts = sub.challenge ? sub.challenge.points : 0;
        userScores[uid] = (userScores[uid] || 0) + pts;
      });

      const users = await User.find({ _id: { $in: Object.keys(userScores) } })
        .select('name avatar role techStack')
        .lean();

      const leaderboard = users.map(u => ({
        ...u,
        score: userScores[u._id.toString()],
      })).sort((a, b) => b.score - a.score);

      // Access socket.io instance from Express app
      const io = req.app.get('io');
      if (io) {
        broadcastLeaderboard(io, leaderboard);
      }
    }

    res.json({ success: true, message: `Submission marked as ${status}` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getPendingSubmissions,
  gradeSubmission,
};
