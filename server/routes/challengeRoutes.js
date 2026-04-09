const express = require('express');
const router = express.Router();
const {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  submitSolution,
  getLeaderboard,
  getMyChallenges,
} = require('../controllers/challengeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllChallenges) // Members can view challenges. (If we want, we can make it public with optional `protect` parsing)
  .post(protect, adminOnly, createChallenge);

router.get('/leaderboard', getLeaderboard);

router.get('/my', protect, getMyChallenges);

router.route('/:id')
  .get(getChallengeById);

router.post('/:id/submit', protect, submitSolution);

module.exports = router;
