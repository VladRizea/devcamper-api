const express = require('express');
const {
  register,
  login,
  getMe,
  forgotpassword,
  resetPassword,
  updateDetails,
  updatepassword,
  logOut,
} = require('../Controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/me', protect, getMe);

router.put('/updatepassword', protect, updatepassword);

router.put('/updatedetails', protect, updateDetails);

router.post('/forgotpassword', forgotpassword);

router.put('/resetPassword/:resetToken', resetPassword);

router.get('/logout', logOut);

module.exports = router;
