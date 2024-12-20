require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var tweetsRouter = require('./routes/tweets');

var app = express();

const cors = require('cors');
app.use(cors(
   {
      origin: ['http://localhost:3001', 'https://frontend-hackatweet.vercel.app'], // Remplacez par vos origines
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Ajustez les méthodes selon vos besoins
      allowedHeaders: ['Content-Type', 'Authorization'],
    }
));

// app.options('*', cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/tweets', tweetsRouter);

module.exports = app;
