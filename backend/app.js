const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const usersRouter = require('./routes/userRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRewardRoutes = require('./routes/userRewardRoutes');
const notifsRoutes = require('./routes/notifsRoutes');
const expRoutes = require('./routes/expRoutes');

app.use('/users', usersRouter);
app.use('/tasks', taskRoutes);
app.use('/rewards', rewardRoutes);
app.use('/userRewards', userRewardRoutes);
app.use('/preferences', preferenceRoutes);
app.use('/notifs', notifsRoutes);
app.use('/exp', expRoutes);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error Page',
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;