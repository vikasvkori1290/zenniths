const Project = require('../models/Project');

// ─── GET /api/projects ────────────────────────────────────────────────────────
const getAllProjects = async (req, res, next) => {
  try {
    const { isFeatured, limit } = req.query;
    const filter = {};
    if (isFeatured === 'true') filter.isFeatured = true;

    let query = Project.find(filter)
      .populate('authors', 'name avatar')
      .sort({ createdAt: -1 });

    if (limit) query = query.limit(parseInt(limit));

    const projects = await query.exec();
    res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('authors', 'name avatar role githubUrl');

    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects ───────────────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    // Automatically add the creator as an author
    const projectData = { ...req.body };
    if (!projectData.authors) projectData.authors = [];
    if (!projectData.authors.includes(req.user.id)) {
      projectData.authors.push(req.user.id);
    }

    const project = await Project.create(projectData);
    await project.populate('authors', 'name avatar');

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/projects/:id/star ─────────────────────────────────────────────
const toggleProjectStar = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    const userId = req.user.id;
    const isStarred = project.stars.includes(userId);

    if (isStarred) {
      // Remove star
      project.stars = project.stars.filter(id => id.toString() !== userId);
    } else {
      // Add star
      project.stars.push(userId);
    }

    await project.save();
    res.json({ success: true, starred: !isStarred, starCount: project.stars.length });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    // Only allow deletion if the user is an author or an admin
    const isAuthor = project.authors.map(a => a.toString()).includes(req.user.id);
    if (!isAuthor && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Not authorized to delete this project'));
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  toggleProjectStar,
  deleteProject,
};
