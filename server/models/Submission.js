const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The URL where the code exists (GitHub, Replit, or CodeSandbox)
    solutionUrl: {
      type: String,
      required: [true, 'Solution URL is required'],
      match: [/^https?:\/\//, 'Please use a valid URL starting with http expected'],
    },
    // Optional explanation or notes
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Passed', 'Failed'],
      default: 'Pending',
    },
    // Optional feedback from admin reviewer
    feedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure one user can only submit once per challenge (prevents duplicate submissions)
submissionSchema.index({ challenge: 1, user: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
