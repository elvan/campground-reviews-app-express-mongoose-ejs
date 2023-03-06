// Load environment variables
require('dotenv').config();

const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');
const mongoose = require('mongoose');

const Campground = require('./models/campground');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campground-reviews-app';

// Create an express app
const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

// Connect to the database
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const { host } = mongoose.connection;
    console.log(`Connected to the database ${host}`);

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Error connecting to the database');
    console.log(err);
  });
