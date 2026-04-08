const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      default: 'Medium',
    },
    // The main body is written in Markdown
    description: {
      type: String,
      required: [true, 'Description/Instructions are required'],
    },
    points: {
      type: Number,
      required: [true, 'Points reward is required'],
      default: 10,
    },
    // Optional deadline for timed challenges
    deadline: {
      type: Date,
      default: null,
    },
    // For sorting/categorizing
    category: {
      type: String,
      enum: ['Algorithm', 'Frontend', 'Backend', 'System Design', 'Other'],
      default: 'Algorithm',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property for active status
challengeSchema.virtual('isActive').get(function () {
  if (!this.deadline) return true;
  return new Date() < this.deadline;
});

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;
