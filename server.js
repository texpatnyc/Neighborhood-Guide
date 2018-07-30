'use strict';

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator/check');
const flash = require('connect-flash');
const session = require('express-session');


mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

const restaurantRouter = require('./routes/restaurantRouter');
const nightlifeRouter = require('./routes/nightlifeRouter');
const serviceRouter = require('./routes/serviceRouter');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// EJS Middleware
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index');
});

app.use('/restaurants', restaurantRouter);
app.use('/nightlife', nightlifeRouter);
app.use('/services', serviceRouter);

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
