const express = require('express');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('users/register');
});

module.exports = router;
