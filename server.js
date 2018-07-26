'use strict';

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

const restaurantRouter = require('./routes/restaurantRouter');
const nightlifeRouter = require('./routes/nightlifeRouter');
const serviceRouter = require('./routes/serviceRouter');

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index');
});

// app.get('/restaurants', (req, res) => {
// 	res.redirect('restaurants')
// })

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
