const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const verifyObj = require('../utils/verifyObj');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docId = req.params.id;
    const { collectionName } = Model.collection;
    const doc = await Model.findByIdAndDelete(docId);
    if (!doc)
      return next(
        new AppError(`Unable to find ${collectionName} with id ${docId}.`, 404),
      );
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

/**
 *
 * @param {mongoose.Model} Model
 * @param {object} options
 * @property {Array} filterArray // attributes to ignore
 * @property {Array} requiredArray // required attributes
 * @returns
 */
exports.updateOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    const docId = req.params.id;

    if (options && options.requiredArray) {
      // Verify is all required parameters have been received and returns the missing parameters, if any
      const missing = verifyObj(req.body, options.requiredArray);
      if (missing.length > 0)
        return next(
          new AppError(
            `Missing required attributes in message body: ${missing.join(', ')}`,
          ),
        );
    }

    let filteredBody = req.body;

    let ignoreList = '';
    if (options && options.filterArray) {
      // Returns a filtered object, with the ignored attributes added as a property of the object
      filteredBody = filterObj(req.body, options.filterArray);

      // If there were any ignored attributes, create a string with ignored attributes and removes the ignored property from the object
      if (filteredBody.ignored) {
        ignoreList = filteredBody.ignored.join(', ');
        delete filteredBody.ignored;
      }
    }

    const { collectionName } = Model.collection;

    // If the Model is User and there is a file in the req (which is a photo), update the filename into the database
    if (collectionName === 'users' && req.file) {
      filteredBody.photo = req.file.filename;
    }

    const doc = await Model.findByIdAndUpdate(docId, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(
        new AppError(`Unable to find ${collectionName} with id ${docId}.`, 404),
      );

    const data = {};
    data[collectionName] = doc;

    // If there are ignored attributes, set warning message as one of the data properties
    if (ignoreList.length > 0)
      data.warning = `These attributes cannot be updated using this action and were ignored: ${ignoreList}`;

    res.status(200).json({
      status: 'success',
      data,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { collectionName } = Model.collection;
    const newDoc = await Model.create(req.body);

    const data = {};
    data[collectionName] = newDoc;

    res.status(201).json({
      status: 'success',
      data,
    });
  });

exports.getOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    const { collectionName } = Model.collection;
    let query = Model.findById(req.params.id);
    if (options) query = query.populate(options.populate);

    const doc = await query;

    if (!doc)
      return next(
        new AppError(
          `Unable to find ${collectionName} with id ${req.params.id}.`,
          404,
        ),
      );
    const data = {};
    data[collectionName] = doc;
    res.status(200).json({
      status: 'success',
      data,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const { collectionName } = Model.collection;
    // PREPARE Query with Features
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //REXECUTE Query
    // const docs = await features.query.explain();
    const docs = await features.query;

    //SEND Response
    const data = {};
    data[collectionName] = docs;
    res.status(200).json({
      status: 'Success',
      requestedAt: req.requestTime,
      results: docs.length,
      data,
    });
  });
