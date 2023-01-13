const dotenv = require('dotenv');
const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');
const mongoose = require('mongoose');

const Campground = require('./models/campgrounds');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campground-directory-app';

// Create an express app
const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/create-campgrounds', (req, res) => {
  // Create a new campground
  const campground = new Campground({
    title: faker.company.companyName(),
    price: faker.random.numeric(2),
    description: faker.lorem.paragraph(),
    location: faker.address.streetName(),
  });

  // Save the campground to the database
  campground
    .save()
    .then((campground) => {
      console.log(campground);
      res.send(campground);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
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
