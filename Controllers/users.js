const ErroResponse = require('../utils/errorUtils');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Get all Users
// @route   Get /api/v1/auth/users
// @access  Private/Admin

exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single User
// @route   Get /api/v1/auth/users/:id
// @access  Private/Admin

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await user.findById(req.params.id);
  res.status(200).json({
    succes: true,
    data: user,
  });
});

// @desc    Create a user
// @route   Post /api/v1/auth/users
// @access  Private/Admin

exports.createUsers = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    succes: true,
    data: user,
  });
});

// @desc    Update user
// @route   Post /api/v1/auth/users/:id
// @access  Private/Admin

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    succes: true,
    data: user,
  });
});

// @desc    Delete user
// @route   Delete /api/v1/auth/users/:id
// @access  Private/Admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(201).json({
    succes: true,
    data: {},
  });
});
