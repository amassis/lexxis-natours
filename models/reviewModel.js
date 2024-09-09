const mongoose = require('mongoose');
const Tour = require('./tourModel');
const Booking = require('./bookingModel');
const AppError = require('../utils/appError');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [
        true,
        'You must indicate the user who is the author of the review.',
      ],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'You must indicate the tour this review is about.'],
    },
    review: {
      type: String,
      minlength: [
        30,
        'A review with less than 30 chars is not allowed. Please, give us more details.',
      ],
      required: [true, 'Review cannot be empty.'],
    },
    rating: {
      type: Number,
      min: [1, 'Ratings start at 1.0'],
      max: [5, 'Ratings go up to 5.0'],
      required: [true, 'You must inform a rating.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre('save', async function (next) {
  const booking = await Booking.findOne({ tour: this.tour, user: this.user });
  if (!booking)
    return next(
      new AppError(
        'You cannot review a tour you have not previously booked.',
        400,
      ),
    );
  next();
});

reviewSchema.pre(/^find/, function (next) {
  // Populate related objects
  // this.populate({
  //   path: 'user',
  //   select: 'firstName familyName photo',
  // }).populate({
  //   path: 'tour',
  //   select: 'name summary imageCover',
  // });

  this.populate({
    path: 'user',
    select: 'firstName familyName photo',
  });
  next();
});

// We use a static method because we want to use the aggregate in the model. "This" points to the Model.
reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats.length > 0 ? stats[0].nRating : 0,
    ratingsAverage: stats.length > 0 ? stats[0].avgRating : 4.5, // back to default if there are no reviews
  });
};

// Post middleware has access to the doc saved
// from the doc we can get tourId and call the static method
reviewSchema.post(/save|^findOneAnd/, async (doc) => {
  await doc.constructor.calcAverageRating(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
