const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:userId/reviews', reviewRouter);

// Require Authentication for all routes below
router.use(authController.protect);

router
  .route('/me')
  .patch(
    userController.setMyId,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateUser,
  )
  .delete(userController.setMyId, userController.deleteUser)
  .get(userController.setMyId, userController.getUser);

// Require Admin Authorization for all routes below
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.patch('/:id/alterRole', userController.alterRole);

module.exports = router;
