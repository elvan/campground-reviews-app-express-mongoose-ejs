const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema(
  {
    title: String,
    price: Number,
    description: String,
    location: String,
  },
  {
    timestamps: true,
  }
);

const Campground = mongoose.model('Campground', campgroundSchema);

module.exports = Campground;
