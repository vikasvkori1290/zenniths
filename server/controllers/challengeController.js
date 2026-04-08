const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const User = require('../models/User');

// ─── GET /api/challenges ──────────────────────────────────────────────────────
const getAllChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });

    // Optionally attach user's submission status if logged in
    let results = challenges;
    if (req.user) {
      const submissions = await Submission.find({ user: req.user.id });
      results = challenges.map((chal) => {
        const sub = submissions.find(s => s.challenge.toString() === chal._id.toString());
        return {
          ...chal.toObject(),
          userStatus: sub ? sub.status : null,
        };
      });
    }

    res.json({ success: true, count: challenges.length, challenges: results });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/challenges/:id ──────────────────────────────────────────────────
const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!challenge) {
      res.status(404);
      return next(new Error('Challenge not found'));
    }

    let userStatus = null;
    let submissionUrl = null;
    let feedback = null;

    if (req.user) {
      const sub = await Submission.findOne({ challenge: challenge._id, user: req.user.id });
      if (sub) {
        userStatus = sub.status;
        submissionUrl = sub.solutionUrl;
        feedback = sub.feedback;
      }
    }

    res.json({
      success: true,
      challenge: { ...challenge.toObject(), userStatus, submissionUrl, feedback },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/challenges ─────────────────────────────────────────────────────
const createChallenge = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const challenge = await Challenge.create(data);
    res.status(201).json({ success: true, challenge });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/challenges/:id/submit ──────────────────────────────────────────
const submitSolution = async (req, res, next) => {
  try {
    const { solutionUrl, notes } = req.body;
    if (!solutionUrl) {
      res.status(400);
      return next(new Error('Solution URL is required'));
    }

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      res.status(404);
      return next(new Error('Challenge not found'));
    }

    // Check if duplicate submission
    const existing = await Submission.findOne({ challenge: challenge._id, user: req.user.id });
    if (existing) {
      res.status(400);
      return next(new Error('You have already submitted a solution for this challenge'));
    }

    const submission = await Submission.create({
      challenge: challenge._id,
      user: req.user.id,
      solutionUrl,
      notes,
      status: 'Pending',
    });

    res.status(201).json({ success: true, message: 'Solution submitted for review', submission });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/challenges/leaderboard/global ───────────────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    // Generate scores dynamically based on passed submissions
    const submissions = await Submission.find({ status: 'Passed' }).populate('challenge', 'points');
    
    // Tally points per user
    const userScores = {};
    submissions.forEach(sub => {
      const uid = sub.user.toString();
      const pts = sub.challenge ? sub.challenge.points : 0;
      userScores[uid] = (userScores[uid] || 0) + pts;
    });

    // Get all users who have scored points + pop details
    const users = await User.find({ _id: { $in: Object.keys(userScores) } })
      .select('name avatar role techStack')
      .lean();

    const leaderboard = users.map(user => ({
      ...user,
      score: userScores[user._id.toString()],
    })).sort((a, b) => b.score - a.score);

    res.json({ success: true, leaderboard });
  } catch (err) {
    next(err);
  }
};

// Admin grading will be added in Phase 7

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  submitSolution,
  getLeaderboard,
};
