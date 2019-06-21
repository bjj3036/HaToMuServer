const express = require('express');
const path = require('path');
const session = require('express-session');
const logger = require('morgan');
const twitchAPI = require('twitch-api-v5');
const twitchConfig = require('./config/twitchConfig');
const sessionConfig = require('./config/sessionConfig');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const cors = require('cors');
const UserModel = require('./models/userModel');

mongoose.connect('mongodb://localhost:27017/hatomu', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('userCreateIndex', true);
autoIncrement.initialize(mongoose.connection)

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/userRouter');
let postRouter = require('./routes/postRouter');

let app = express();

twitchAPI.clientID = twitchConfig.clientID;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    const token = req.headers['authorization'] || req.query.token
    if (token) {
        req.token = token
        UserModel.findByToken(token).exec((err, result) => {
            if (err)
                return next(err)
            req.user = result
            next()
        })
    } else
        next()
})
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/postImage', express.static(path.join(__dirname, '/postImage')))
app.use(session(sessionConfig));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/post', postRouter);

mongoose.connection.once('open', function () {
    console.log('Connected MongoDB')
})

module.exports = app;
