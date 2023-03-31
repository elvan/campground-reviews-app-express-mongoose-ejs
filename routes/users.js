const express = require('express');

const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post(
  '/register',
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash('success', 'Welcome to TheCampgrounds!');
        res.redirect('/campgrounds');
      });
    } catch (e) {
      req.flash('error', e.message);
      res.redirect('register');
    }
  })
);

module.exports = router;
