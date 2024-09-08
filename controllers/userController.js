const multer = require('multer'); // file upload (e.g. profile photos)
const sharp = require('sharp'); // image processing

const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Here the multerStorage is going directly to a file
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'public/img/users');
//   },
//   filename: (req, file, callback) => {
//     const ext = file.mimetype.split('/')[1];
//     callback(null, `User-${req.user.id}.${ext}`);
//   },
// });

// Here the multerStorage is going to memory, since we will process the image before saving
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) callback(null, true);
  else
    callback(
      new AppError('This is not a valid image, please try again.', 400),
      false,
    );
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // We need req.file.filename in the updateUser middleware, so we set it here.
  // It would have been set by multer - if we had saved to disk
  // Since we saved to memory, we add it manually here
  req.file.filename = `user-${req.user.id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// Middleware for the "Me" Routes.
exports.setMyId = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const noUpdateAttributes = [
  'role',
  'password',
  'pwdConfirm',
  'pwdLastChangedAt',
  'id',
  'active',
];

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User, {
  filterArray: noUpdateAttributes,
});
exports.alterRole = factory.updateOne(User, { requiredArray: ['role'] });
