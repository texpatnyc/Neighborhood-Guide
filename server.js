'use strict';
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const morgan = require('morgan');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

const restaurantRouter = require('./routes/restaurantRouter');
const nightlifeRouter = require('./routes/nightlifeRouter');
const serviceRouter = require('./routes/serviceRouter');
const userRouter = require('./routes/userRouter');
const { router: authRouter, localStrategy, serializeUser, deserializeUser } = require('./auth');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser());

// Express Session Middleware
app.use(session({
  secret: 'snoop dogg',
  store: new MongoStore({mongooseConnection:mongoose.connection}),
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(localStrategy);

passport.serializeUser(serializeUser);

passport.deserializeUser(deserializeUser);

// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  res.locals.user = req.user;
  next();
});

// EJS Middleware
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/login', (req, res) => {
	const next = req.query ? req.query.next : null;
	res.render('login', {next});
});

app.get('/signup', (req, res) => {
	res.render('signup');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('back');
});

// Method Override
app.use(methodOverride('_method'));

// Logging
app.use(morgan('common'));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

app.use('/restaurants', restaurantRouter);
app.use('/nightlife', nightlifeRouter);
app.use('/services', serviceRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);

//------------------------------------------------------------
//Admin and User Test Middleware
//------------------------------------------------------------


// function isAdminOrAuthor(req, res, next) {
// 	if (req.user && (req.user.username === 'admin' || req.user._id == req.query.commentUserId)) {
// 		next();
// 	} else {
// 		req.flash('failure', 'Not Authorized')
// 		res.redirect('back')
// 	}
// }

// function isAdmin(req, res, next) {
// 	if (req.user && req.user.username === 'admin') {
// 		next();
// 	} else {
// 		req.flash('failure', 'Not Authorized')
// 		res.redirect('back')
// 	}
// }


//------------------------------------------------------------
//Server Functions
//------------------------------------------------------------

let server;

function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
				.on('error', err => {
					mongoose.disconnect();
					reject(err);
				});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing Server');
			server.close(err => {
				if (err) {
				return reject(err);
			}
			resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};
