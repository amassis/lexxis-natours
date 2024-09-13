const express = require('express');
const viewController = require('../controllers/viewController');
//const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewController.alerts);

router.get(
  '/',
  // bookingController.createBookingAtCheckout, // This was a temporary solution
  authController.isLoggedIn,
  viewController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignupForm);
router.get('/me', authController.protect, viewController.getAccountForm);
router.get('/passwordReset/:token', viewController.passwordReset);
router.get('/myTours', authController.protect, viewController.getMyTours);
router.get('/myReviews', authController.protect, viewController.getMyReviews);
module.exports = router;
