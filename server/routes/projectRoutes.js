const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  toggleProjectStar,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllProjects)
  // Only authenticated members can submit projects
  .post(protect, createProject);

router.route('/:id')
  .get(getProjectById)
  // Delete requires ownership or admin rights (verified in controller)
  .delete(protect, deleteProject);

router.patch('/:id/star', protect, toggleProjectStar);

module.exports = router;
