const User = require('../models/User');

// ─── GET /api/users ───────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && ['admin', 'member'].includes(role)) filter.role = role;

    const users = await User.find(filter)
      .select('name email role avatar techStack githubUrl createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email role avatar techStack githubUrl linkedinUrl activityLog createdAt');

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const { name, techStack, githubUrl, linkedinUrl, avatar } = req.body;
    if (name) user.name = name;
    if (techStack) user.techStack = techStack;
    if (githubUrl) user.githubUrl = githubUrl;
    if (linkedinUrl) user.linkedinUrl = linkedinUrl;
    if (avatar) user.avatar = avatar;

    const updated = await user.save();
    res.json({
      success: true,
      user: {
        _id: updated._id, name: updated.name, email: updated.email,
        role: updated.role, avatar: updated.avatar,
        techStack: updated.techStack, githubUrl: updated.githubUrl,
        linkedinUrl: updated.linkedinUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/users/:id/role ────────────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['member', 'admin'].includes(role)) {
      res.status(400);
      return next(new Error('Invalid role'));
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/users/:id ───────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, updateUserRole, deleteUser };
