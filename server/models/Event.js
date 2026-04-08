const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
    },
    category: {
      type: String,
      enum: ['Workshop', 'Hackathon', 'Seminar', 'Social', 'Talk', 'Competition', 'Other'],
      default: 'Workshop',
    },
    poster: {
      type: String, // Cloudinary URL
      default: null,
    },
    facultyIncharge: [
      {
        name: { type: String, required: true },
        number: { type: String },
      }
    ],
    studentIncharge: [
      {
        name: { type: String, required: true },
        number: { type: String },
      }
    ],
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    minTeam: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxTeam: {
      type: Number,
      default: 1,
      min: 1,
    },
    volunteersNeeded: {
      type: Number,
      default: 0,
      min: 0,
    },
    volunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attendedEmails: [
      {
        type: String,
        trim: true,
        lowercase: true,
      }
    ],
    teams: [
      {
        teamName: { type: String, required: true },
        leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        members: [
          {
            name: { type: String, required: true },
            email: { type: String, required: true },
            mobile: { type: String },
            usn: { type: String },
            course: { type: String },
            batch: { type: String },
          },
        ],
        registeredAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property to check if the event is upcoming
eventSchema.virtual('isUpcoming').get(function () {
  return this.date > new Date();
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
