const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Require Authentication for all routes below
router.use(authController.protect);

router
  .route('/myReviews')
  .get(
    reviewController.setMyId,
    reviewController.setTourUserIdsQuery,
    reviewController.getAllReviews,
  );

router
  .route('/')
  .get(reviewController.setTourUserIdsQuery, reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview,
  );

module.exports = router;
