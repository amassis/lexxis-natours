const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [
        true,
        'A booking needs to specify the user who is booking a tour.',
      ],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [
        true,
        'A booking needs to specify the tour that the user is booking.',
      ],
    },
    price: {
      type: Number,
      required: [true, 'A booking must have a price.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bookingSchema.index({ tour: 1, user: 1 }, { unique: true });

bookingSchema.pre(/^find/, function (next) {
  // Populate related objects
  this.populate({
    path: 'user',
    select: 'firstName familyName photo fullName email',
  }).populate({
    path: 'tour',
    select: 'name summary imageCover',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
