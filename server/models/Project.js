const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    techStack: {
      type: [String],
      required: true,
      validate: [v => v.length > 0, 'At least one technology must be specified'],
    },
    thumbnail: {
      type: String, // Cloudinary URL
      default: null,
    },
    repoUrl: {
      type: String,
      default: '',
    },
    liveUrl: {
      type: String,
      default: '',
    },
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Array of user IDs who starred the project
    stars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property for star count (faster reads)
projectSchema.virtual('starCount').get(function () {
  return this.stars.length;
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
