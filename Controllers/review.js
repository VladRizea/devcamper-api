const ErrorResponse = require('../utils/errorUtils');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const errorHandler = require('../middleware/error');

//* @desc    Get reviews
//* @route   GET /api/v1/reviews
//* @route   GET /api/v1/bootcamps/:bootcampId/reviews
//* @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const review = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: review.length,
      data: review,
    });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});

//* @desc    Get single review
//* @route   GET /api/v1/reviews/:id
//* @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name, description',
  });

  if (!review) {
    return next(
      new ErrorResponse(
        `The review with id : ${req.params.id} does not exist`,
        404
      )
    );
  }

  return res.status(200).json({
    success: true,
    data: review,
  });
});

//* @desc    Add review
//* @route   Post /api/v1/bootcamps/:bootcampId/reviews
//* @access  Private

exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `The bootcamp with Id ${req.params.id} does not exist`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  return res.status(201).json({
    success: true,
    data: review,
  });
});

//* @desc    Update review
//* @route   P:ut /api/v1/reviews/:id
//* @access  Private

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(
        `The review with Id ${req.params.id} does not exist`,
        404
      )
    );
  }

  //* Make sure review belongs belongs to a user
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to  update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    data: review,
  });
});

//* @desc    Delete review
//* @route   DELETE /api/v1/reviews/:id
//* @access  Public

exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(
        `The review with Id ${req.params.id} does not exist`,
        404
      )
    );
  }

  //* Make sure review belongs belongs to a user
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to  update review`, 401));
  }

  await review.remove();

  return res.status(200).json({
    success: true,
    data: {},
  });
});
