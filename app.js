require('dotenv').config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campground-reviews-app';
const SECRET = process.env.SECRET || 'secret123456';

const LocalStrategy = require('passport-local');
const connectMongo = require('connect-mongo');
const ejsMate = require('ejs-mate');
const express = require('express');
const flash = require('connect-flash');
const helmet = require('helmet');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const session = require('express-session');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();
const MongoDBStore = connectMongo(session);

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);

const store = new MongoDBStore({
  secret: SECRET,
  touchAfter: 24 * 60 * 60,
  url: MONGODB_URI,
});

store.on('error', function (e) {
  console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
  name: 'session',
  resave: false,
  saveUninitialized: true,
  secret: SECRET,
  store,
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(flash());
app.use(helmet());
app.use(session(sessionConfig));

const scriptSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com/',
  'https://kit.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://cdn.jsdelivr.net',
  'https://fonts.googleapis.com/',
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://use.fontawesome.com/',
];
const connectSrcUrls = [
  'https://a.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];
const fontSrcUrls = ['https://fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      connectSrc: ["'self'", ...connectSrcUrls],
      defaultSrc: [],
      objectSrc: [],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://images.pexels.com/',
        'https://images.unsplash.com/',
        'https://res.cloudinary.com/desmwpnfw/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy.Strategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', { err });
});

mongoose
  .connect(MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const db = mongoose.connection;

    db.on('error', console.error.bind(console, 'Connection error:'));

    db.once('open', () => {
      console.log('Database connected');
    });

    console.log(`Connected to the database ${db.host}`);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Error connecting to the database');
    console.log(err);
  });
