require('dotenv').config();

const mongoose = require('mongoose');

const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campground-reviews-app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '642680bce628cd8378bc0013',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
      price,
      geometry: {
        type: 'Point',
        coordinates: [-113.1331, 47.0202],
      },
      images: [
        {
          url: 'https://res.cloudinary.com/desmwpnfw/image/upload/v1680260403/campground-reviews/z9ovcpgik9inhhn8n0ef.jpg',
          filename: 'campground-reviews/z9ovcpgik9inhhn8n0ef.jpg',
        },
        {
          url: 'https://res.cloudinary.com/desmwpnfw/image/upload/v1680260404/campground-reviews/evxyxqxiybvgqtlxqjky.jpg',
          filename: 'campground-reviews/evxyxqxiybvgqtlxqjky.jpg',
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
