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
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
    },
    category: {
      type: String,
      enum: ['Workshop', 'Hackathon', 'Seminar', 'Social', 'Other'],
      default: 'Workshop',
    },
    poster: {
      type: String, // Cloudinary URL
      default: null,
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
