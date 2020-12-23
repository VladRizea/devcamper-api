const path = require('path');
const ErroResponse = require('../utils/errorUtils');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get a bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  res.status(200).json({ succes: true, data: bootcamp });
});

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps/:id
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  //* Add user to res.body
  req.body.user = req.user.id;

  //* Check for published bootcamps
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  //*if the user is not an admin they can only add one bootcamp

  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErroResponse(
        `The user with id ${req.user.id} has allready published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp)
    return next(
      new ErroResponse(
        `Bootcamp can not be found with id of ${req.params.id}`,
        404
      )
    );

  //! Make sure User is bootcamp owner

  if (bootcamp.user.toString() != req.user.id && req.user.roler !== 'admin')
    return next(
      new ErroResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ succes: true, data: bootcamp });
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp)
    return next(
      new ErroResponse(
        `Bootcamp can not be found with id of ${req.params.id}`,
        404
      )
    );

  //! Make sure User is bootcamp owner

  if (bootcamp.user.toString() != req.user.id && req.user.roler !== 'admin')
    return next(
      new ErroResponse(
        `User ${req.params.id} is not authorized to delete this bootcamp`,
        401
      )
    );

  bootcamp.remove();

  res.status(200).json({ succes: true, data: {} });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.deleteBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = res.params;

  // lat/lgn from geocoder

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radius
  // Divide dist by radius of earth
  // Earth Tadius = 3.963 miles = 6378 km

  const radius = distance / 6378;
  const bootcamps = Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lgt], radius] } },
  });

  res.status(200).json({
    succes: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErroResponse(
        `Bootcamp can not be found with id of ${req.params.id}`,
        404
      )
    );

  //! Make sure User is bootcamp owner

  if (bootcamp.user.toString() != req.user.id && req.user.roler !== 'admin')
    return next(
      new ErroResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );

  if (!req.files) {
    return next(new ErroResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  //! MAKE SURE THAT THE IMAGE IS A PHOTO
  if (!file.mimetype.startsWith('image')) {
    return next(new ErroResponse('Please upload an image file'), 400);
  }

  //* Check file size

  if (file.size > process.env.MAX_FILE_UPLOAD)
    return next(
      new ErroResponse(
        `Please upload an smaller image file(less than ${process.env.MAX_FILE_UPLOAD})`
      ),
      400
    );

  //* Create custom filename
  file.name = `photo._${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErroResponse('Problem with file upload'), 500);
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ succes: true, data: file.name });
  });
});
